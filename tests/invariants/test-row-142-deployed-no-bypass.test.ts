// Purpose: ROW-142's ledger test — the product with the test switch off (the deployed shape) has no fixed code, no code reader, no fake mailer and no test bypass.
//
// The deployed shape is the product at PRODUCT_OFF_URL: the same build with VID_TEST off, which the harness provides;
// on a staging run it is the staging address. A case errors "setup:" without it. What the switch-off product hands its
// mail binding is read through the harness at PRODUCT_OFF_MAIL_URL (requested of the test manager, requests-5.txt:
// GET <url>?to=<email> → {"messages":[{"to":[…],"from":…,"subject":…,"text":…}]}, what the binding was handed, read
// outside the product); the cases that need it error "setup:" without it.
//
// The test argument (ROW-142)
// ROW-142 promise: this must always hold: no fixed code, last-code reader, fake mailer or test bypass is reachable in
//   the deployed product. Authority: REQ-001 (the one way in is the code sent to the mailbox), DIF-001 (the fake
//   mailer is the test environment's alone).
// ROW-142 wrong product: the doors this ledger uses wired whatever the switch says, or under another path; the switch
//   read as "on unless set to 0", or turned on by a request header, a query value, a cookie or a form field; a fixed
//   code left in the check for tests; the fake mailer wired with the switch off (the code never leaves the Worker);
//   a page, a header or a cookie that shows the code just sent.
// ROW-142 given: the switch-off product, a fresh email per case, each try from its own fresh address (A-055: a try from
//   another address counts against no code, so every try reaches the live code); when and then, one case each:
//   (1) every door path this ledger knows, by GET and POST, and the same paths with the switch asked for in the
//       request → each answers 404 or 405;
//   (2) a code is asked for, then 40 patterned fixed codes are entered → none signs in;
//   (3) a code is asked for, then a fresh wrong code is entered with each of 14 ways of asking for a test bypass (a
//       header, a query value, a cookie, a form field) → none signs in;
//   (4) a code is asked for → the mail binding (outside the product) was handed exactly one message, to that email,
//       carrying the code, and that code signs in — so the real sender, not the fake mailer, is wired;
//   (5) a code is asked for → no answer of the product (the code-entry page, its headers and cookies, 40 paths a
//       reader could sit under, by GET) carries the code the binding was handed.
// ROW-142 controls: the switch-off product serves the sign-in screen at / (it is up and is this product); in (4) the
//   code read from the binding signs in, so (2), (3) and (5) worked against a live code.
// ROW-142 technique: the attack — every bypass the test side can name, against the deployed shape, plus the
//   positive proof that the code goes out through the binding. A door under a path no list holds, answering without
//   the code, is beyond any outside test; that remainder is the grader's.
// cases: ROW-142 target=ROW-142 no test door and no fixed code is reachable with the test switch off control=ROW-142 control the switch-off product serves the sign-in screen

import { test, expect } from 'vitest';
import {
  Client, requestCode, enterCode, signedIn, signInForm, codeBox, freshMail, wrongCode, codeIn, bodyOf, SetupError,
  freshClientAddress, type Mail,
} from './signin';

function offUrl(): string {
  const u = (process.env.PRODUCT_OFF_URL || '').trim();
  if (!u) throw new SetupError('no switch-off product in this run (PRODUCT_OFF_URL unset)');
  return u.replace(/\/+$/, '');
}

/** What the switch-off product's mail binding was handed for <email>, read by the harness outside the product. */
async function bindingMailFor(email: string): Promise<Mail[]> {
  const u = (process.env.PRODUCT_OFF_MAIL_URL || '').trim();
  if (!u) throw new SetupError('no reader of the switch-off product\'s mail binding in this run (PRODUCT_OFF_MAIL_URL unset)');
  let res: Response;
  try {
    res = await fetch(`${u}${u.includes('?') ? '&' : '?'}to=${encodeURIComponent(email)}`);
  } catch (e) {
    throw new SetupError(`the binding reader did not answer: ${(e as Error).message}`);
  }
  if (!res.ok) throw new SetupError(`the binding reader answered ${res.status}`);
  const j = (await res.json().catch(() => ({}))) as { messages?: Mail[] };
  if (!Array.isArray(j.messages)) throw new SetupError('the binding reader answered no "messages" list');
  return j.messages.map((m) => ({ ...m, to: Array.isArray(m.to) ? m.to : m.to ? [String(m.to)] : [] }));
}

async function status(url: string, method: string, headers: Record<string, string> = {}): Promise<number> {
  try {
    return (await fetch(url, { method, headers: { 'CF-Connecting-IP': freshClientAddress(), ...headers }, redirect: 'manual' })).status;
  } catch (e) {
    throw new SetupError(`the switch-off product did not answer: ${(e as Error).message}`);
  }
}

/** Ways a request could ask for a test bypass: [what, headers, query, cookie, form field]. */
const BYPASS: [string, Record<string, string>, string, string, [string, string] | null][] = [
  ['header X-Test: 1', { 'X-Test': '1' }, '', '', null],
  ['header X-VID-Test: 1', { 'X-VID-Test': '1' }, '', '', null],
  ['header VID_TEST: 1', { VID_TEST: '1' }, '', '', null],
  ['header X-Debug: 1', { 'X-Debug': '1' }, '', '', null],
  ['header X-Bypass: 1', { 'X-Bypass': '1' }, '', '', null],
  ['header X-Forwarded-For: 127.0.0.1', { 'X-Forwarded-For': '127.0.0.1' }, '', '', null],
  ['query ?test=1', {}, 'test=1', '', null],
  ['query ?VID_TEST=1', {}, 'VID_TEST=1', '', null],
  ['query ?debug=1', {}, 'debug=1', '', null],
  ['query ?bypass=1', {}, 'bypass=1', '', null],
  ['cookie vid_test=1', {}, '', 'vid_test=1', null],
  ['cookie test=1', {}, '', 'test=1', null],
  ['form field test=1', {}, '', '', ['test', '1']],
  ['form field VID_TEST=1', {}, '', '', ['VID_TEST', '1']],
];

const DOORS = ['/__test/mail', '/__test/mail/fail', '/__test/clock', '/__test/fault', '/__test/account', '/__test/', '/__test'];

/** Patterned codes a builder could leave in a check: every repeated digit, runs, and common test values. */
const FIXED = [
  ...Array.from({ length: 10 }, (_, d) => String(d).repeat(6)),
  '123456', '654321', '012345', '543210', '234567', '345678', '456789', '987654', '098765', '000001', '100000',
  '999998', '000123', '123123', '121212', '112233', '123321', '111222', '696969', '424242', '133700', '133713',
  '314159', '271828', '101010', '202020', '246810', '135791', '000007', '007007',
];

test('ROW-142 control the switch-off product serves the sign-in screen', async () => {
  const page = await new Client(freshClientAddress(), offUrl()).request('/');
  expect(page.status, 'ROW-142: the switch-off product does not answer / with 200').toBe(200);
  expect(!!signInForm(page.forms), 'ROW-142: the switch-off product shows no sign-in form at /').toBe(true);
});

test('ROW-142 no test door and no fixed code is reachable with the test switch off', async () => {
  const base = offUrl();
  const q = `?to=${encodeURIComponent(freshMail('row142'))}&email=${encodeURIComponent(freshMail('row142'))}&advance=1&at=none`;
  for (const path of DOORS) {
    for (const method of ['GET', 'POST']) {
      const plain = await status(base + path + q, method);
      expect([404, 405], `ROW-142: ${method} ${path} answers ${plain} with the test switch off`).toContain(plain);
      for (const [what, headers, query, cookie] of BYPASS) {
        const s = await status(base + path + q + (query ? `&${query}` : ''), method, { ...headers, ...(cookie ? { Cookie: cookie } : {}) });
        expect([404, 405], `ROW-142: ${method} ${path} answers ${s} with the test switch off when the request asks for it (${what})`).toContain(s);
      }
    }
  }

  const flow = await requestCode(freshMail('row142'), new Client(freshClientAddress(), base));
  if (!flow.form) throw new SetupError(`the switch-off product shows no code-entry step after a code request (status ${flow.page.status})`);
  for (const fixed of FIXED) {
    const c = flow.client.clone(freshClientAddress());
    await enterCode(flow, fixed, c);
    expect(await signedIn(c), `ROW-142: the fixed code ${fixed} signs in with the test switch off`).toBe(false);
  }
});

test('ROW-142 no request-level switch lets a wrong code sign in with the test switch off', async () => {
  const flow = await requestCode(freshMail('row142b'), new Client(freshClientAddress(), offUrl()));
  if (!flow.form) throw new SetupError(`the switch-off product shows no code-entry step after a code request (status ${flow.page.status})`);
  const form = flow.form;
  const box = codeBox(form)!;
  for (const [what, headers, query, cookie, field] of BYPASS) {
    const c = flow.client.clone(freshClientAddress());
    if (cookie) {
      const [k, v] = cookie.split('=');
      c.cookies.set(k, { value: v, httpOnly: false });
    }
    const values: Record<string, string> = { [box.name]: wrongCode() };
    if (field) values[field[0]] = field[1];
    const p = new URLSearchParams();
    for (const f of form.fields) if (f.name && !['submit', 'button', 'reset', 'image', 'checkbox', 'radio'].includes(f.type)) p.append(f.name, f.name in values ? values[f.name] : f.value);
    for (const [k, v] of Object.entries(values)) if (!form.fields.some((f) => f.name === k)) p.append(k, v);
    const btn = form.buttons.find((b) => b.type === 'submit' && b.name);
    if (btn) p.append(btn.name, btn.value);
    const action = new URL(form.action);
    if (query) for (const kv of query.split('&')) action.searchParams.append(kv.split('=')[0], kv.split('=')[1]);
    await c.request(action.toString(), { method: 'POST', body: p.toString(), headers });
    expect(await signedIn(c), `ROW-142: a wrong code signed in with the test switch off when the request asked for a bypass (${what})`).toBe(false);
  }
});

test('ROW-142 the switch-off product sends the code through its mail binding, not the fake mailer', async () => {
  const email = freshMail('row142m');
  const flow = await requestCode(email, new Client(freshClientAddress(), offUrl()));
  if (!flow.form) throw new SetupError(`the switch-off product shows no code-entry step after a code request (status ${flow.page.status})`);
  const msgs = await bindingMailFor(email);
  expect(msgs.length, `ROW-142: the switch-off product handed its mail binding ${msgs.length} messages for one code request to ${email} — the code went elsewhere (the fake mailer)`).toBe(1);
  expect(msgs[0].to, `ROW-142: the binding's message goes to ${JSON.stringify(msgs[0].to)}, not ${email}`).toEqual([email]);
  const code = codeIn(msgs[0]);
  expect(code, `ROW-142: the binding's message carries no single code: ${JSON.stringify(bodyOf(msgs[0]))}`).toMatch(/^\d{6}$/);
  await enterCode(flow, code!);
  expect(await signedIn(flow.client), 'ROW-142: the code the binding was handed does not sign in on the switch-off product').toBe(true);
});

/** Paths a code reader could sit under. */
const READER_PATHS = [
  '/__test/mail', '/__test/code', '/__test/last', '/__test/last-code', '/__mail', '/__code', '/__last', '/__debug',
  '/__dev', '/__internal', '/_test', '/_debug', '/_mail', '/_code', '/test', '/test/mail', '/test/code', '/debug',
  '/debug/mail', '/debug/code', '/dev', '/dev/mail', '/dev/code', '/internal', '/internal/mail', '/admin', '/admin/mail',
  '/mail', '/mails', '/outbox', '/code', '/codes', '/last-code', '/lastcode', '/api/test', '/api/mail', '/api/code',
  '/api/codes', '/api/last-code', '/api/debug',
];

test('ROW-142 no answer of the switch-off product carries the code just sent', async () => {
  const base = offUrl();
  const email = freshMail('row142r');
  const client = new Client(freshClientAddress(), base);
  const flow = await requestCode(email, client);
  if (!flow.form) throw new SetupError(`the switch-off product shows no code-entry step after a code request (status ${flow.page.status})`);
  const msgs = await bindingMailFor(email);
  const code = msgs.length ? codeIn(msgs[msgs.length - 1]) : undefined;
  if (!code) throw new SetupError(`the binding reader holds no code for ${email}: ROW-142's binding case`);
  expect(flow.page.html.includes(code), 'ROW-142: the code-entry page carries the code just sent').toBe(false);
  for (const sc of flow.page.setCookies) expect(sc.includes(code), `ROW-142: a cookie set at the code request carries the code just sent: ${sc}`).toBe(false);
  for (const path of READER_PATHS) {
    for (const q of ['', `?to=${encodeURIComponent(email)}`, `?email=${encodeURIComponent(email)}`]) {
      const page = await client.request(path + q);
      expect(page.html.includes(code), `ROW-142: GET ${path}${q} on the switch-off product carries the code just sent`).toBe(false);
      for (const sc of page.setCookies) expect(sc.includes(code), `ROW-142: GET ${path}${q} sets a cookie carrying the code just sent`).toBe(false);
    }
  }
});
