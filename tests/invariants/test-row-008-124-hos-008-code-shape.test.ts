// Purpose: ledger tests for what a code and a session value are made of: ROW-008, ROW-124 and HOS-008.
//
// Codes are read as the fake mailer (DIF-001) recorded them. Each request is a fresh email from a fresh address, so no
// per-email or per-address limit (later rows) stands in the way. Here the code is read raw: every run of 3 or more
// digits in the body (test value, asked: the body carries the code as its only such run).
//
// The test argument (ROW-008)
// ROW-008 promise: this never happens: a code is not 6 digits. Authority: REQ-002 fail-if (5), A-015 AMENDED.
// ROW-008 wrong product: a 4- or 8-digit code; a number printed without its leading zeros (5 digits one time in ten);
//   letters mixed in.
// ROW-008 given: 30 fresh code requests; when: each code email is read; then: each carries exactly one run of digits
//   and it is exactly 6 digits.
// ROW-008 controls: one of those codes, entered, signs in — the run read is the code.
// ROW-008 technique: a property over generated requests, plus the named example that signs in.
// cases: ROW-008 target=ROW-008 every emailed code is exactly 6 digits control=ROW-008 control the 6 digits read from the email are the code that signs in
//
// The test argument (ROW-124)
// ROW-124 promise: this must always hold: codes are drawn from a cryptographic random source, every code from 000000 to
//   999999 can occur and keeps its leading zeros, and session values carry at least 128 random bits; and this must
//   always hold: the composition root binds randomness to the cryptographic source; no Math.random in src.
//   Authority: REQ-002, D-009 (crypto.getRandomValues, rejection sampling), D-010 (256-bit session tokens).
// ROW-124 wrong product: codes from 100000 to 999999 (no leading zero ever); a code stored as a number, so "012345"
//   fails when typed; a counter or clock-based code; a short or guessable session value (an id, an email, 8 bytes).
// ROW-124 given: 150 fresh code requests; when: the codes are read; then: some begin with 0, each digit 0-9 appears in
//   each of the 6 positions, at most a few repeat; a code beginning with 0, entered, signs in; 4 sign-ins give 4
//   distinct session values (the cookie whose removal signs out) of at least 128 bits each by length and alphabet.
// ROW-124 controls: ROW-008's control. Not observed here: the random source's kind and "no Math.random in src" —
//   no public surface shows them; a statistical sample tells a narrow or structured range, not a weak generator.
// ROW-124 technique: generated inputs; the chance a right product fails is under 1e-6 (no leading 0 in 150: 0.9^150).
// cases: ROW-124 target=ROW-124 codes span the whole range with leading zeros kept control=ROW-008 control the 6 digits read from the email are the code that signs in
//
// The test argument (HOS-008) — a protection row (protects REQ-002; disable: remove the 6-digit code generator)
// HOS-008 promise: read every code the fake mailer recorded over many requests, expect each is exactly 6 digits.
// HOS-008 wrong product: the 6-digit generator removed (any other code shape).
// HOS-008 given/when/then: 40 requests; each recorded code is exactly 6 digits. The failure message carries
//   vid-forbidden-effect: HOS-008 only on a code that is not.
// cases: HOS-008 target=HOS-008 every code recorded over many requests is exactly 6 digits control=ROW-008 control the 6 digits read from the email are the code that signs in

import { test, expect } from 'vitest';
import { Client, requestCode, needCodeForm, mailFor, bodyOf, enterCode, signedIn, freshMail, sessionCookie, codeFlow, SetupError, type Flow } from './signin';

/** <n> fresh requests, each with the digit runs its code email carries. */
async function sample(n: number, tag: string): Promise<{ flow: Flow; runs: string[] }[]> {
  const out: { flow: Flow; runs: string[] }[] = [];
  for (let i = 0; i < n; i += 10) {
    const batch = await Promise.all(
      Array.from({ length: Math.min(10, n - i) }, async () => {
        const email = freshMail(tag);
        const flow = await requestCode(email);
        needCodeForm(flow);
        const msgs = await mailFor(email);
        if (msgs.length !== 1) throw new SetupError(`${msgs.length} code emails recorded for one request to ${email}`);
        return { flow, runs: bodyOf(msgs[0]).match(/\d{3,}/g) || [] };
      }),
    );
    out.push(...batch);
  }
  return out;
}

test('ROW-008 control the 6 digits read from the email are the code that signs in', async () => {
  const [s] = await sample(1, 'row008');
  if (s.runs.length !== 1) throw new SetupError(`the code email carries ${s.runs.length} runs of digits`);
  await enterCode(s.flow, s.runs[0]);
  expect(await signedIn(s.flow.client), 'ROW-008: the digits read from the code email do not sign in').toBe(true);
});

test('ROW-008 every emailed code is exactly 6 digits', async () => {
  for (const s of await sample(30, 'row008')) {
    expect(s.runs.length, `ROW-008: the code email for ${s.flow.email} carries ${s.runs.length} runs of digits: ${JSON.stringify(s.runs)}`).toBe(1);
    expect(s.runs[0], `ROW-008: the code ${s.runs[0]} is not 6 digits`).toMatch(/^\d{6}$/);
  }
});

test('HOS-008 every code recorded over many requests is exactly 6 digits', async () => {
  for (const s of await sample(40, 'hos008')) {
    const ok = s.runs.length === 1 && /^\d{6}$/.test(s.runs[0]);
    expect(ok, `vid-forbidden-effect: HOS-008\nHOS-008: the code email for ${s.flow.email} carries ${JSON.stringify(s.runs)}, not one 6-digit code`).toBe(true);
  }
});

test('ROW-124 codes span the whole range with leading zeros kept', async () => {
  const all = await sample(150, 'row124');
  const codes = all.map((s) => (s.runs.length === 1 ? s.runs[0] : ''));
  for (const c of codes) expect(c, `ROW-124: a code email carries no single 6-digit code (${c})`).toMatch(/^\d{6}$/);
  const zeroLed = all.filter((s) => s.runs[0].startsWith('0'));
  expect(zeroLed.length, 'ROW-124: none of 150 codes begins with 0 — codes never span 000000 to 099999 or lose their leading zeros').toBeGreaterThan(0);
  for (let pos = 0; pos < 6; pos++) {
    const seen = new Set(codes.map((c) => c[pos]));
    expect(seen.size, `ROW-124: position ${pos + 1} of 150 codes shows only the digits ${[...seen].sort().join('')}`).toBe(10);
  }
  expect(new Set(codes).size, 'ROW-124: more than 5 of 150 codes repeat — codes are not drawn at random from 10^6').toBeGreaterThanOrEqual(145);
  await enterCode(zeroLed[0].flow, zeroLed[0].runs[0]);
  expect(await signedIn(zeroLed[0].flow.client), `ROW-124: the code ${zeroLed[0].runs[0]}, which begins with 0, does not sign in as typed`).toBe(true);
});

/** The fewest bits a value of this length and alphabet can carry. */
function bitsOf(v: string): number {
  const perChar = /^[0-9a-f]+$/i.test(v) ? 4 : /^[0-9]+$/.test(v) ? Math.log2(10) : 6;
  return v.length * perChar;
}

test('ROW-124 session values carry at least 128 random bits', async () => {
  const values: string[] = [];
  for (let i = 0; i < 4; i++) {
    const flow = await codeFlow(freshMail('row124s'), new Client());
    await enterCode(flow, flow.code);
    if (!(await signedIn(flow.client))) throw new SetupError('a sign-in did not succeed (ROW-180): no session value to read');
    const s = await sessionCookie(flow.client);
    if (!s) throw new SetupError('no single cookie whose removal signs the browser out');
    values.push(decodeURIComponent(s.value));
  }
  expect(new Set(values).size, `ROW-124: 4 sign-ins gave repeated session values: ${JSON.stringify(values)}`).toBe(4);
  for (const v of values) expect(bitsOf(v), `ROW-124: the session value ${JSON.stringify(v)} can carry at most ${bitsOf(v).toFixed(0)} bits`).toBeGreaterThanOrEqual(128);
});
