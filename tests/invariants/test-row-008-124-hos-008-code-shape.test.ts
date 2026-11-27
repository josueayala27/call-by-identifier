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
//   Authority: REQ-002, D-009 (crypto.getRandomValues, rejection sampling), D-010 (256-bit session tokens), and the
//   owner's answer on #5 (ROW-124): "that clause of ROW-124 is a census and grader matter with no ledger case; the
//   rest of ROW-124 (every code 000000 to 999999 possible, leading zeros kept, sessions of at least 128 random bits)
//   is tested here".
// ROW-124 wrong product: codes from 100000 to 999999 (no leading zero ever); a code stored as a number, so "012345"
//   fails when typed; a counter, a clock or a linear congruential generator behind the codes (full range, few
//   repeats, yet each code follows from the last); a short, guessable or structured session value (an id, an email,
//   a timestamp, 8 bytes, a fixed prefix with a short random tail).
// ROW-124 given: 150 fresh code requests; when: the codes are read; then: some begin with 0, each digit 0-9 appears in
//   each of the 6 positions, at most a few repeat; a code beginning with 0, entered, signs in.
// ROW-124 given: 60 code requests made one after another; when: the codes are read in sending order; then: no
//   structure ties a code to the one before — the ascents are those of a random order (not a clock or a counter), no
//   digit position and no low binary digit repeats with a period of 20 or less (an LCG modulo 10^6 or 2^k does), and
//   successive codes are not correlated.
// ROW-124 given: 8 sign-ins; then: 8 distinct session values (the cookie whose removal signs out), each of at least 128
//   bits by length and alphabet once the prefix and suffix all 8 share are set aside (a fixed label is no random
//   bit), none holding the email, the code or the current time in seconds or milliseconds.
// ROW-124 controls: ROW-008's control. Not observed here, by the owner's answer: the composition-root clause ("no
//   Math.random in src") is a census and grader matter. The clause "drawn from a cryptographic random source" is
//   observed only through what a weak source leaves in the codes (the structure above); a statistically good but
//   non-cryptographic generator (Math.random's xorshift128+) leaves nothing a sample of codes shows, so that part
//   is the grader's as well — asked as a question (requests-5.txt).
// ROW-124 technique: generated inputs and relations between successive outputs; the chance a right product fails any
//   case is under 1e-4 (no leading 0 in 150: 0.9^150; each structure bound sits 4 or more standard deviations out).
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

/** <n> codes requested one after another, in sending order. */
async function sequential(n: number, tag: string): Promise<string[]> {
  const codes: string[] = [];
  for (let i = 0; i < n; i++) {
    const [s] = await sample(1, tag);
    if (s.runs.length !== 1 || !/^\d{6}$/.test(s.runs[0])) throw new SetupError(`a code email carries no single 6-digit code (${JSON.stringify(s.runs)}): ROW-008's`);
    codes.push(s.runs[0]);
  }
  return codes;
}

/** The share of places i where seq[i] equals seq[i + p]. */
function periodShare<T>(seq: T[], p: number): number {
  let same = 0;
  for (let i = 0; i + p < seq.length; i++) if (seq[i] === seq[i + p]) same++;
  return same / (seq.length - p);
}

test('ROW-124 successive codes show no counter, clock or short-period structure', async () => {
  const codes = await sequential(60, 'row124q');
  const n = codes.map(Number);
  // A random order of 60 values has 29.5 ascents (sd 2.25); a clock or a counter has nearly 59, its mirror nearly 0.
  let ascents = 0;
  for (let i = 1; i < n.length; i++) if (n[i] > n[i - 1]) ascents++;
  expect(ascents, `ROW-124: ${ascents} of 59 successive codes rise — the codes follow a clock or a counter: ${codes.join(' ')}`).toBeGreaterThanOrEqual(15);
  expect(ascents, `ROW-124: ${ascents} of 59 successive codes rise — the codes follow a clock or a counter: ${codes.join(' ')}`).toBeLessThanOrEqual(44);
  // Digit positions: a random digit repeats p places later 10% of the time; a short-period digit (an LCG's last
  // digits) nearly always.
  for (let pos = 0; pos < 6; pos++) {
    const digits = codes.map((c) => c[pos]);
    for (let p = 1; p <= 20; p++) {
      const share = periodShare(digits, p);
      expect(share, `ROW-124: digit ${pos + 1} of successive codes repeats with period ${p} in ${(share * 100).toFixed(0)}% of places: ${digits.join('')}`).toBeLessThan(0.5);
    }
  }
  // Low binary digits: random half the time; an LCG modulo 2^k repeats them with a short period.
  for (const m of [2, 4, 8, 16]) {
    const low = n.map((x) => x % m);
    for (let p = 1; p <= 20; p++) {
      const share = periodShare(low, p);
      const bound = m === 2 ? 0.9 : 0.75;
      expect(share, `ROW-124: the codes modulo ${m} repeat with period ${p} in ${(share * 100).toFixed(0)}% of places: ${low.join(',')}`).toBeLessThan(bound);
    }
  }
  // Successive codes: correlation of a random pair sequence of 59 is 0 with sd 0.13.
  const xs = n.slice(0, -1), ys = n.slice(1);
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  const r = sxy / Math.sqrt(sxx * syy || 1);
  expect(Math.abs(r), `ROW-124: successive codes are correlated (r = ${r.toFixed(2)}): ${codes.join(' ')}`).toBeLessThan(0.55);
  expect(new Set(codes).size, `ROW-124: 60 successive codes hold repeats: ${codes.join(' ')}`).toBeGreaterThanOrEqual(58);
});

/** The fewest bits a value of this length and alphabet can carry. */
function bitsOf(v: string): number {
  const perChar = /^[0-9a-f]+$/i.test(v) ? 4 : /^[0-9]+$/.test(v) ? Math.log2(10) : 6;
  return v.length * perChar;
}

test('ROW-124 session values carry at least 128 random bits', async () => {
  const values: string[] = [];
  const seen: { email: string; code: string }[] = [];
  for (let i = 0; i < 8; i++) {
    const flow = await codeFlow(freshMail('row124s'), new Client());
    await enterCode(flow, flow.code);
    if (!(await signedIn(flow.client))) throw new SetupError('a sign-in did not succeed (ROW-180): no session value to read');
    const s = await sessionCookie(flow.client);
    if (!s) throw new SetupError('no single cookie whose removal signs the browser out');
    values.push(decodeURIComponent(s.value));
    seen.push({ email: flow.email, code: flow.code });
  }
  expect(new Set(values).size, `ROW-124: 8 sign-ins gave repeated session values: ${JSON.stringify(values)}`).toBe(8);
  for (const v of values) expect(bitsOf(v), `ROW-124: the session value ${JSON.stringify(v)} can carry at most ${bitsOf(v).toFixed(0)} bits`).toBeGreaterThanOrEqual(128);
  // What all 8 values share at their start or end is no random bit: it is set aside before the bits are counted.
  let pre = 0;
  while (pre < values[0].length && values.every((v) => v[pre] === values[0][pre])) pre++;
  let suf = 0;
  while (suf < values[0].length - pre && values.every((v) => v.length - suf - 1 >= pre && v[v.length - suf - 1] === values[0][values[0].length - suf - 1])) suf++;
  for (const v of values) {
    const varying = v.slice(pre, v.length - suf);
    expect(bitsOf(varying), `ROW-124: the session value ${JSON.stringify(v)} varies from sign-in to sign-in only in ${JSON.stringify(varying)}, at most ${bitsOf(varying).toFixed(0)} bits`).toBeGreaterThanOrEqual(128);
  }
  const now = Date.now();
  const times = [String(now).slice(0, 9), String(Math.floor(now / 1000)).slice(0, 7)];
  values.forEach((v, i) => {
    const low = v.toLowerCase();
    expect(low.includes(seen[i].email.split('@')[0].toLowerCase()), `ROW-124: the session value ${JSON.stringify(v)} holds the email`).toBe(false);
    expect(v.includes(seen[i].code), `ROW-124: the session value ${JSON.stringify(v)} holds the code ${seen[i].code}`).toBe(false);
    for (const t of times) expect(v.includes(t), `ROW-124: the session value ${JSON.stringify(v)} holds the current time (${t}…)`).toBe(false);
  });
});
