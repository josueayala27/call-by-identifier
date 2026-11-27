// Purpose: the sign-in ledger's shared HTTP helpers: a cookie-keeping client, the sign-in and code-entry forms, and the test-switch doors.
//
// Public harness boundary for the S2 rows (ROW-001 … HOS-030). Every case reaches the product the way a browser does:
// it loads /, fills the form the product itself renders, posts it with the browser's Origin, keeps the cookies it is
// given and follows redirects. The client address is the CF-Connecting-IP header the test sets (DIF-003).
//
// What the product does not yet have errors with a message beginning "setup:" (docs/RESULTS-FORMAT.md): the product
// missing, a test-switch door missing (404), a precondition step that did not happen. Helpers never fail a row; the
// cases assert the rows' promises themselves.
//
// The doors, each under the test switch (VID_TEST=1) alone and absent with it off — requested in requests-5.txt:
//   GET  /__test/mail?to=<email>          what the fake mailer (DIF-001) recorded for that recipient, oldest first:
//                                         {"messages":[{"to":["…"],"from":"…","subject":"…","text":"…"}]}
//   POST /__test/mail/fail?to=<email>     the fake mailer's next send to that recipient fails (nothing is recorded)
//   POST /__test/clock?advance=<seconds>  the product's clock moves forward by that many seconds, for every later read
//   POST /__test/fault?at=<codes|codes-write|none>   every code-store operation (or every code-store write) fails
//                                         until at=none
//   GET  /__test/account?email=<email>    {"accounts": <number of stored accounts with that email>}
// And the harness's own (test manager): PRODUCT_OFF_URL, PRODUCT_RESTART_URL, PRODUCT_SECRET_VARIANTS, CAPTURES_DIR,
// STAGING_INBOX, STAGING_INBOX_URL.

import { randomBytes, randomInt } from 'node:crypto';
import { SetupError, productUrl, fresh } from './harness';

export { SetupError, productUrl, fresh };

// ---------------------------------------------------------------------------------------------------------------
// Addresses

/**
 * A fresh IPv4 client address from 10.0.0.0/8 (the test network has no route out, so any address is a label): about
 * 16 million values, so the hundreds a run draws never repeat and no per-address count carries between cases.
 */
export function freshClientAddress(): string {
  const b = randomBytes(3);
  return `10.${b[0]}.${b[1]}.${1 + (b[2] % 254)}`;
}

/** A fresh IPv6 /64 in the documentation range (RFC 3849), as its first four groups. */
export function freshV6Net(): string {
  const b = randomBytes(4);
  return `2001:db8:${b.readUInt16BE(0).toString(16)}:${b.readUInt16BE(2).toString(16)}`;
}

/** Host <n> inside an IPv6 /64. */
export function v6Host(net: string, n: number): string {
  return `${net}::${n.toString(16)}`;
}

/** A fresh plain-ASCII email on a reserved test domain (RFC 2606). */
export function freshMail(tag = 's2'): string {
  return `${tag}-${fresh()}@example.test`;
}

// ---------------------------------------------------------------------------------------------------------------
// HTML forms, read the way a browser reads them

export type Field = { tag: string; type: string; name: string; value: string; autocomplete: string };
export type Form = { action: string; method: string; fields: Field[]; buttons: { name: string; value: string; text: string; type: string }[] };

function decode(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([^\s=>\/"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return out;
}

function text(html: string): string {
  return decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function parseForms(html: string, pageUrl: string): Form[] {
  const forms: Form[] = [];
  const re = /<form\b([^>]*)>([\s\S]*?)<\/form>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const a = attrs(m[1]);
    const body = m[2];
    const fields: Field[] = [];
    const inRe = /<input\b([^>]*)>/gi;
    let i: RegExpExecArray | null;
    while ((i = inRe.exec(body))) {
      const x = attrs(i[1]);
      fields.push({ tag: 'input', type: (x.type || 'text').toLowerCase(), name: x.name || '', value: x.value || '', autocomplete: x.autocomplete || '' });
    }
    const taRe = /<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/gi;
    while ((i = taRe.exec(body))) {
      const x = attrs(i[1]);
      fields.push({ tag: 'textarea', type: 'textarea', name: x.name || '', value: decode(i[2]), autocomplete: x.autocomplete || '' });
    }
    const buttons: Form['buttons'] = [];
    const bRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
    while ((i = bRe.exec(body))) {
      const x = attrs(i[1]);
      buttons.push({ name: x.name || '', value: x.value || '', text: text(i[2]) || x['aria-label'] || '', type: (x.type || 'submit').toLowerCase() });
    }
    for (const f of fields) if (f.tag === 'input' && f.type === 'submit') buttons.push({ name: f.name, value: f.value, text: f.value, type: 'submit' });
    forms.push({ action: new URL(a.action || pageUrl, pageUrl).toString(), method: (a.method || 'get').toLowerCase(), fields, buttons });
  }
  return forms;
}

const VISIBLE = (f: Field) => !['hidden', 'submit', 'button', 'reset', 'image', 'checkbox', 'radio'].includes(f.type);

/** The code box (test value, asked): a visible field named with "code" or "otp", or marked autocomplete=one-time-code. */
export function codeBox(form: Form): Field | undefined {
  return form.fields.find((f) => VISIBLE(f) && (/code|otp/i.test(f.name) || f.autocomplete === 'one-time-code'));
}

/** The email box: a visible field of type email or named with "email". */
export function emailBox(form: Form): Field | undefined {
  return form.fields.find((f) => VISIBLE(f) && (f.type === 'email' || /email/i.test(f.name)));
}

/** The sign-in form (the email step): an email box, no code box, and a submit whose label holds "code" (ROW-093's test value). */
export function signInForm(forms: Form[]): Form | undefined {
  return forms.find((f) => emailBox(f) && !codeBox(f) && f.buttons.some((b) => b.type === 'submit' && /code/i.test(b.text)));
}

/** The code-entry form: the form holding a code box. */
export function codeForm(forms: Form[]): Form | undefined {
  return forms.find((f) => !!codeBox(f));
}

// ---------------------------------------------------------------------------------------------------------------
// The client: one browser — its cookies, its client address

export type Page = { status: number; url: string; html: string; forms: Form[]; setCookies: string[] };

type Cookie = { value: string; httpOnly: boolean };

export class Client {
  cookies = new Map<string, Cookie>();
  constructor(public address: string = freshClientAddress(), public base: string = productUrl()) {}

  /** The same browser (cookies copied) seen from another client address. */
  clone(address: string = this.address): Client {
    const c = new Client(address, this.base);
    for (const [k, v] of this.cookies) c.cookies.set(k, { ...v });
    return c;
  }

  without(cookieName: string): Client {
    const c = this.clone();
    c.cookies.delete(cookieName);
    return c;
  }

  private cookieHeader(): string {
    return [...this.cookies].map(([k, v]) => `${k}=${v.value}`).join('; ');
  }

  private keep(setCookies: string[]) {
    for (const sc of setCookies) {
      const [pair, ...rest] = sc.split(';');
      const eq = pair.indexOf('=');
      if (eq < 1) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      const lower = rest.map((r) => r.trim().toLowerCase());
      const maxAge = lower.find((r) => r.startsWith('max-age='));
      const expires = rest.map((r) => r.trim()).find((r) => /^expires=/i.test(r));
      const gone =
        (maxAge && Number(maxAge.slice(8)) <= 0) ||
        (expires && Date.parse(expires.slice(8)) <= Date.now()) ||
        value === '';
      if (gone) this.cookies.delete(name);
      else this.cookies.set(name, { value, httpOnly: lower.includes('httponly') });
    }
  }

  /** One request, then redirects followed as a browser does, cookies kept at every hop. */
  async request(path: string, init: { method?: string; body?: string; headers?: Record<string, string> } = {}): Promise<Page> {
    let url = new URL(path, this.base + '/').toString();
    let method = (init.method || 'GET').toUpperCase();
    let body = init.body;
    const all: string[] = [];
    for (let hop = 0; hop < 8; hop++) {
      const headers: Record<string, string> = {
        'CF-Connecting-IP': this.address,
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        ...(init.headers || {}),
      };
      const ck = this.cookieHeader();
      if (ck) headers.Cookie = ck;
      if (method !== 'GET' && method !== 'HEAD') {
        headers.Origin = new URL(this.base).origin;
        headers['Sec-Fetch-Site'] = 'same-origin';
        if (body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      let res: Response;
      try {
        res = await fetch(url, { method, body: method === 'GET' || method === 'HEAD' ? undefined : body, headers, redirect: 'manual' });
      } catch (e) {
        throw new SetupError(`the product did not answer at ${url}: ${(e as Error).message}`);
      }
      const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      all.push(...sc);
      this.keep(sc);
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) {
        url = new URL(loc, url).toString();
        if (res.status !== 307 && res.status !== 308) {
          method = 'GET';
          body = undefined;
        }
        await res.arrayBuffer().catch(() => undefined);
        continue;
      }
      const html = await res.text();
      return { status: res.status, url, html, forms: parseForms(html, url), setCookies: all };
    }
    throw new SetupError(`more than 8 redirects from ${path}`);
  }

  async submit(form: Form, values: Record<string, string>, omit: string[] = []): Promise<Page> {
    const p = new URLSearchParams();
    for (const f of form.fields) {
      if (!f.name || omit.includes(f.name)) continue;
      if (['submit', 'button', 'reset', 'image'].includes(f.type)) continue;
      if ((f.type === 'checkbox' || f.type === 'radio')) continue;
      p.append(f.name, f.name in values ? values[f.name] : f.value);
    }
    for (const [k, v] of Object.entries(values)) if (!form.fields.some((f) => f.name === k) && !omit.includes(k)) p.append(k, v);
    const btn = form.buttons.find((b) => b.type === 'submit' && b.name);
    if (btn) p.append(btn.name, btn.value);
    if (form.method === 'get') {
      const u = new URL(form.action);
      for (const [k, v] of p) u.searchParams.append(k, v);
      return this.request(u.toString());
    }
    return this.request(form.action, { method: 'POST', body: p.toString() });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The sign-in flow

export type Flow = { client: Client; email: string; page: Page; form: Form | undefined };

/** Loads / and asks for a code for <email> through the sign-in form the product renders. */
export async function requestCode(email: string, client: Client = new Client()): Promise<Flow> {
  const home = await client.request('/');
  const form = signInForm(home.forms);
  if (!form) throw new SetupError(`no sign-in form at / (status ${home.status}): the email step is an earlier step's (ROW-093)`);
  const box = emailBox(form)!;
  const page = await client.submit(form, { [box.name]: email });
  return { client, email, page, form: codeForm(page.forms) };
}

/** The code-entry form a flow reached, or a setup error naming what did not happen. */
export function needCodeForm(flow: Flow): Form {
  if (!flow.form)
    throw new SetupError(`the code-entry step did not appear after a code request for ${flow.email} (status ${flow.page.status}): the request step is not there yet`);
  return flow.form;
}

/** Enters <code> in the flow's code-entry form, from <client> (the flow's own browser by default). */
export async function enterCode(flow: Flow, code: string, client: Client = flow.client, opts: { omitCode?: boolean } = {}): Promise<Page> {
  const form = needCodeForm(flow);
  const box = codeBox(form)!;
  return opts.omitCode ? client.submit(form, {}, [box.name]) : client.submit(form, { [box.name]: code });
}

/**
 * Whether a browser is signed in (test value, asked): / answers 200 and shows neither the email step nor the code-entry
 * step, while the same request with no cookie shows the email step — so the difference is the browser's session.
 */
export async function signedIn(client: Client): Promise<boolean> {
  const page = await client.request('/');
  if (page.status !== 200) return false;
  if (signInForm(page.forms) || codeForm(page.forms)) return false;
  const bare = await new Client(client.address, client.base).request('/');
  if (!signInForm(bare.forms)) throw new SetupError(`a cookie-less browser at / sees no sign-in form (status ${bare.status}): the email step is ROW-093's`);
  return true;
}

/** The cookie whose removal signs the browser out: the session cookie. */
export async function sessionCookie(client: Client): Promise<{ name: string; value: string; httpOnly: boolean } | undefined> {
  for (const [name, c] of client.cookies) {
    if (!(await signedIn(client.without(name)))) return { name, ...c };
  }
  return undefined;
}

// ---------------------------------------------------------------------------------------------------------------
// The doors (test switch only)

async function door(path: string, method = 'GET', base: string = productUrl()): Promise<Response> {
  const url = base.replace(/\/+$/, '') + path;
  let res: Response;
  try {
    res = await fetch(url, { method, headers: { 'CF-Connecting-IP': freshClientAddress(), Accept: 'application/json' } });
  } catch (e) {
    throw new SetupError(`the product did not answer at ${url}: ${(e as Error).message}`);
  }
  if (res.status === 404 || res.status === 405) throw new SetupError(`no test-switch door ${method} ${path.split('?')[0]} (answered ${res.status})`);
  if (!res.ok) throw new SetupError(`the test-switch door ${method} ${path.split('?')[0]} answered ${res.status}`);
  return res;
}

export type Mail = { to: string[]; cc?: string[]; bcc?: string[]; from?: string; subject?: string; text?: string; body?: string; html?: string };

/** What the fake mailer (DIF-001) recorded for a recipient, oldest first. */
export async function mailFor(email: string, base: string = productUrl()): Promise<Mail[]> {
  const res = await door(`/__test/mail?to=${encodeURIComponent(email)}`, 'GET', base);
  let j: { messages?: Mail[] };
  try {
    j = (await res.json()) as { messages?: Mail[] };
  } catch {
    throw new SetupError('GET /__test/mail did not answer JSON');
  }
  if (!Array.isArray(j.messages)) throw new SetupError('GET /__test/mail answered no "messages" list');
  return j.messages.map((m) => ({ ...m, to: Array.isArray(m.to) ? m.to : m.to ? [String(m.to)] : [] }));
}

export function bodyOf(m: Mail): string {
  return m.text ?? m.body ?? (m.html ? text(m.html) : '');
}

/** The code a message carries (test value, asked): its body's only run of 3 or more digits, as written. */
export function codeIn(m: Mail): string | undefined {
  const runs = bodyOf(m).match(/\d{3,}/g) || [];
  return runs.length === 1 ? runs[0] : undefined;
}

/** The newest code emailed to <email>; a setup error when none was recorded. */
export async function latestCode(email: string): Promise<string> {
  const msgs = await mailFor(email);
  if (!msgs.length) throw new SetupError(`the fake mailer recorded no code email for ${email}`);
  const c = codeIn(msgs[msgs.length - 1]);
  if (!c) throw new SetupError(`the newest code email for ${email} carries no single run of digits: ${JSON.stringify(bodyOf(msgs[msgs.length - 1]))}`);
  return c;
}

/** Asks for a code and returns the flow with the code emailed for it; every missing step is a setup error. */
export async function codeFlow(email: string = freshMail(), client: Client = new Client()): Promise<Flow & { code: string }> {
  const before = (await mailFor(email)).length;
  const flow = await requestCode(email, client);
  needCodeForm(flow);
  const msgs = await mailFor(email);
  if (msgs.length <= before) throw new SetupError(`no new code email recorded for ${email} after its request`);
  const code = codeIn(msgs[msgs.length - 1]);
  if (!code) throw new SetupError(`the code email for ${email} carries no single run of digits`);
  return { ...flow, code };
}

/** A 6-digit code different from every code given. */
export function wrongCode(...not: string[]): string {
  for (;;) {
    const c = String(randomInt(0, 1_000_000)).padStart(6, '0');
    if (!not.includes(c)) return c;
  }
}

export async function advanceClock(seconds: number): Promise<void> {
  await door(`/__test/clock?advance=${seconds}`, 'POST');
}

export async function failNextMail(email: string): Promise<void> {
  await door(`/__test/mail/fail?to=${encodeURIComponent(email)}`, 'POST');
}

export async function storageFault(at: 'codes' | 'codes-write' | 'none'): Promise<void> {
  await door(`/__test/fault?at=${at}`, 'POST');
}

export async function accountCount(email: string): Promise<number> {
  const res = await door(`/__test/account?email=${encodeURIComponent(email)}`);
  const j = (await res.json().catch(() => ({}))) as { accounts?: unknown };
  if (typeof j.accounts !== 'number') throw new SetupError('GET /__test/account answered no "accounts" number');
  return j.accounts;
}

/** The 60-second rule (REQ-023, a later row) never blocks a second request these cases make: they move the clock past it. */
export const PAST_RESEND_SECONDS = 61;

/** Restarts the product between two steps of a case (harness: PRODUCT_RESTART_URL), waiting until / answers again. */
export async function restartProduct(): Promise<void> {
  const url = (process.env.PRODUCT_RESTART_URL || '').trim();
  if (!url) throw new SetupError('no way to restart the product in this run (PRODUCT_RESTART_URL unset)');
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST' });
  } catch (e) {
    throw new SetupError(`the restart hook did not answer: ${(e as Error).message}`);
  }
  if (!res.ok) throw new SetupError(`the restart hook answered ${res.status}`);
  const until = Date.now() + 40_000;
  while (Date.now() < until) {
    try {
      const r = await fetch(productUrl() + '/', { headers: { 'CF-Connecting-IP': freshClientAddress() } });
      if (r.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new SetupError('the product did not answer within 40 s of its restart');
}
