// Purpose: deploy-owed ledger tests for the real code email: DIF-001 (the fake mailer's difference) and SEAM-001 (the Cloudflare Email Service probe), run on staging only.
//
// These run against staging (run-tests.sh --against: PRODUCT_URL is the staging address) and need the harness's test
// inbox — STAGING_INBOX, an address that takes +tags, and STAGING_INBOX_URL, a reader answering GET ?to=<address> with
// {"messages":[{"raw":"<the RFC 5322 message>"}]} — and CAPTURES_DIR, the work folder's captures/ (requested of the
// test manager). Each real answer is saved there, never committed. Without them a case errors "setup:".
//
// The test argument (DIF-001)
// DIF-001 promise: difference — the code email sender: in tests, a fake mailer that records the one recipient and the
//   body in memory; in production, the Cloudflare Email Service binding sending from
//   no-reply@call-by-identifier.josueayala.me; the fake records exactly what the adapter hands to the binding, so the
//   product's choice of recipient and body is still tested. Paying step: staging — one real code email to a test
//   inbox through the binding, SPF, DKIM and DMARC passing. Authority: DIF-001, D-008.
// DIF-001 wrong product: an adapter that hands the binding something other than what the fake records (another
//   recipient, a body without the code); a sending domain without SPF/DKIM/DMARC, so the code lands in spam.
// DIF-001 given: a fresh +tag of the test inbox; when: a code is asked for it on staging; then: within 45 s one message
//   arrives, from no-reply@call-by-identifier.josueayala.me, to exactly that address, Authentication-Results showing
//   spf=pass, dkim=pass and dmarc=pass, its body carrying one 6-digit code that signs in on staging.
// DIF-001 controls: the code request shows the code-entry step (the request reached the send).
// DIF-001 technique: a fake checked against the real contract — the real message, saved to captures/.
// cases: DIF-001 target=DIF-001 one real code email reaches the test inbox with SPF, DKIM and DMARC passing control=SEAM-001 the Email Service sends a code email on staging
//
// The test argument (SEAM-001)
// SEAM-001 promise: seam — Cloudflare Email Service sends the sign-in code email (chosen: D-008); the probe makes one
//   real action through the service on staging. Authority: SEAM-001, D-008.
// SEAM-001 wrong product: the binding never called (the fake left wired on staging); a send that fails and is reported
//   as sent.
// SEAM-001 given: a fresh +tag of the test inbox; when: a code is asked for it on staging; then: the code-entry step
//   shows and one message arrives in the inbox within 45 s. The raw message is saved to captures/.
// SEAM-001 controls: none further — it is the probe.
// cases: SEAM-001 target=SEAM-001 the Email Service sends a code email on staging control=SEAM-001 the Email Service sends a code email on staging

import { test, expect } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { requestCode, enterCode, signedIn, fresh, SetupError } from './signin';

const SENDER = 'no-reply@call-by-identifier.josueayala.me';

function env(name: string): string {
  const v = (process.env[name] || '').trim();
  if (!v) throw new SetupError(`${name} unset: this deploy-owed test runs on staging with the test inbox`);
  return v;
}

function tagged(inbox: string, tag: string): string {
  const at = inbox.indexOf('@');
  return `${inbox.slice(0, at)}+${tag}-${fresh(4)}${inbox.slice(at)}`.toLowerCase();
}

async function awaitMessage(to: string): Promise<string> {
  const reader = env('STAGING_INBOX_URL');
  const until = Date.now() + 45_000;
  while (Date.now() < until) {
    let res: Response | undefined;
    try {
      res = await fetch(`${reader}${reader.includes('?') ? '&' : '?'}to=${encodeURIComponent(to)}`);
    } catch {
      res = undefined;
    }
    if (res && res.ok) {
      const j = (await res.json().catch(() => ({}))) as { messages?: { raw?: string }[] };
      const raw = j.messages?.[0]?.raw;
      if (raw) return raw;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`no message reached ${to} within 45 s`);
}

function capture(name: string, raw: string) {
  const dir = env('CAPTURES_DIR');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}-${new Date().toISOString().replace(/[:.]/g, '')}.eml`), raw);
}

function header(raw: string, name: string): string[] {
  const head = raw.split(/\r?\n\r?\n/)[0].replace(/\r?\n[ \t]+/g, ' ');
  return head.split(/\r?\n/).filter((l) => l.toLowerCase().startsWith(name.toLowerCase() + ':')).map((l) => l.slice(name.length + 1).trim());
}

test('SEAM-001 the Email Service sends a code email on staging', async () => {
  const to = tagged(env('STAGING_INBOX'), 'seam001');
  env('CAPTURES_DIR');
  const flow = await requestCode(to);
  expect(!!flow.form, 'SEAM-001: the code request on staging shows no code-entry step').toBe(true);
  const raw = await awaitMessage(to);
  capture('seam-001', raw);
  expect(raw.length, 'SEAM-001: the message that arrived is empty').toBeGreaterThan(0);
});

test('DIF-001 one real code email reaches the test inbox with SPF, DKIM and DMARC passing', async () => {
  const to = tagged(env('STAGING_INBOX'), 'dif001');
  env('CAPTURES_DIR');
  const flow = await requestCode(to);
  expect(!!flow.form, 'DIF-001: the code request on staging shows no code-entry step').toBe(true);
  const raw = await awaitMessage(to);
  capture('dif-001', raw);
  expect(header(raw, 'From').join(' ').toLowerCase(), 'DIF-001: the code email is not from the sending address').toContain(SENDER);
  const rcpt = [...header(raw, 'To'), ...header(raw, 'Cc')].join(',').toLowerCase().match(/[^\s<>,"]+@[^\s<>,"]+/g) || [];
  expect(rcpt, 'DIF-001: the code email does not go to exactly the requested address').toEqual([to]);
  const auth = header(raw, 'Authentication-Results').join(' ').toLowerCase();
  for (const k of ['spf=pass', 'dkim=pass', 'dmarc=pass']) expect(auth, `DIF-001: the code email's Authentication-Results lack ${k}`).toContain(k);
  const body = raw.split(/\r?\n\r?\n/).slice(1).join('\n');
  const runs = body.match(/\b\d{6}\b/g) || [];
  expect(runs.length, 'DIF-001: the real code email carries no 6-digit code').toBeGreaterThan(0);
  await enterCode(flow, runs[0]!);
  expect(await signedIn(flow.client), 'DIF-001: the code from the real email does not sign in on staging').toBe(true);
});
