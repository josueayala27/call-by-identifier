// Purpose: ledger tests for signing in with the emailed code: ROW-180, ROW-001, ROW-118, HOS-001 and HOS-002.
//
// The harness contract: Vitest in Node over HTTP to PRODUCT_URL; the client address is CF-Connecting-IP (DIF-003);
// the code is read from the fake mailer through GET /__test/mail (DIF-001, a measuring tool). Shared test values,
// each asked as a question: the code-entry step is the form holding a field named with "code"/"otp" or marked
// autocomplete=one-time-code; "signed in" is / answering 200 with neither the email step nor the code-entry step while a
// cookie-less browser at / sees the email step; the code is the code email body's only run of 3 or more digits.
//
// The test argument (ROW-180)
// ROW-180 promise: control of ROW-117: a single correct code entered once signs the person in. Authority: REQ-002 via
//   REQ-001 AMENDED fail-if (2) — a working code entered in time signs the person in while their address is under its
//   hourly wrong-try limit.
// ROW-180 wrong product: a sign-in that never succeeds (codes compared against the wrong stored form, the request step
//   missing, or no session cookie set) — every refusal row would pass on it.
// ROW-180 given: a fresh email and a fresh client address. when: the browser asks for a code, reads it from the fake
//   mailer and enters it once. then: the browser is signed in; before the entry it was not.
// ROW-180 controls: the code-entry step appears after the request; a cookie-less browser still sees the email step.
// ROW-180 technique: one named example through the forms the product renders, with before/after on the same browser.
// cases: ROW-180 target=ROW-180 a single correct code entered once signs the person in control=ROW-180 control asking for a code shows the code-entry step
//
// The test argument (ROW-001)
// ROW-001 promise: this never happens: a person is signed in without entering the code sent to their email.
//   Authority: REQ-001 AMENDED fail-if (1).
// ROW-001 wrong product: a product that signs the browser in at the code request (a session cookie set with the
//   code-entry step), or that accepts an empty or wrong code.
// ROW-001 given: a fresh email whose code was requested; when: the browser enters nothing, an empty code, or a wrong
//   6-digit code (a fresh value differing from the emailed one); then: the browser is not signed in after each.
// ROW-001 given (near misses): a fresh email's live code; when: 6 codes that differ from it in one digit each (one per
//   position), its digits rotated and reversed, are entered, each from its own fresh address (A-055: such a try counts
//   against no code, so the code stays live for every try); then: none signs in. Wrong product: a comparison of part
//   of the code (5 digits, the digits as a set, a numeric closeness).
// ROW-001 controls: the emailed code, entered after those tries in the same browser, signs it in — so the tries were
//   reached on a live code and refused for being wrong.
// ROW-001 technique: decoy codes beside the one right code; before and after on the same browser.
// cases: ROW-001 target=ROW-001 no code, an empty code or a wrong code does not sign the person in control=ROW-001 control the emailed code entered after the refused tries signs the person in
//
// The test argument (ROW-118)
// ROW-118 promise: this must always hold: a code issued to one email never signs in as another email. Authority:
//   REQ-001 (the one way in is the code sent to *that* email), A-001 AMENDED.
// ROW-118 wrong product: codes checked against every live code in the store, or against the newest code of any email,
//   so A's code entered on B's code-entry step signs in as B.
// ROW-118 given: two fresh emails A and B, each with its own live code, requested from two addresses; when: A's code is
//   entered on B's code-entry step and B's on A's, from a third address (so no wrong try counts against either code);
//   then: neither browser is signed in.
// ROW-118 given (near miss): B is A with one letter of its local part changed, same domain; when and then as above.
//   Wrong product: an email compared on its domain, its length or a prefix.
// ROW-118 controls: B's own code then entered on B's step signs B in.
// ROW-118 technique: the neighbouring entity — the other email's live code is the decoy.
// cases: ROW-118 target=ROW-118 a code issued to one email does not sign in as another email control=ROW-118 control the other email's own code signs it in
//
// The test argument (HOS-001) — a protection row (protects REQ-001; disable: remove the code check in verifyCode)
// HOS-001 promise: on the code-entry screen, submit no code, an empty code and a code of another email, expect no
//   session cookie and no signed-in screen.
// HOS-001 wrong product: verifyCode without its code check — any submission of the code-entry form signs in.
// HOS-001 given: a fresh email with a live code, and another email's live code; when: each of the three submissions is
//   made on the first email's code-entry step; then: no browser is signed in. The failure message carries
//   vid-forbidden-effect: HOS-001 only on a browser that is signed in.
// HOS-001 controls: HOS-002's case, the correct code signing in, in this same file.
// HOS-001 technique: the attack itself, through the real form; one browser per submission.
// cases: HOS-001 target=HOS-001 no code, an empty code and another email's code give no session control=HOS-002 the correct code entered within 10 minutes gives a session
//
// The test argument (HOS-002) — a protection row (protects REQ-001; disable: remove the session creation after a valid code)
// HOS-002 promise: on the code-entry screen, submit the correct code within 10 minutes, expect a session; with the check
//   bypassed the session is refused.
// HOS-002 wrong product: a verifyCode that checks the code but never creates the session (or never sets its cookie).
// HOS-002 given: a fresh email and its emailed code; when: the code is entered at once (well within 10 minutes);
//   then: the browser is signed in. The failure message carries vid-forbidden-effect: HOS-002 only when it is not.
// HOS-002 controls: the code-entry step appeared and the code was read from the mailer (setup errors otherwise).
// HOS-002 technique: the named example, through the real form.
// cases: HOS-002 target=HOS-002 the correct code entered within 10 minutes gives a session control=ROW-180 control asking for a code shows the code-entry step

import { test, expect } from 'vitest';
import { randomInt } from 'node:crypto';
import { Client, requestCode, codeFlow, enterCode, signedIn, latestCode, freshMail, wrongCode, needCodeForm, fresh } from './signin';

test('ROW-180 control asking for a code shows the code-entry step', async () => {
  const flow = await requestCode(freshMail('row180'));
  expect(flow.page.status, 'ROW-180: the code request does not answer below 400').toBeLessThan(400);
  expect(!!flow.form, 'ROW-180: asking for a code shows no code-entry step (no code box)').toBe(true);
});

test('ROW-180 a single correct code entered once signs the person in', async () => {
  const email = freshMail('row180');
  const flow = await requestCode(email);
  expect(!!flow.form, 'ROW-180: asking for a code shows no code-entry step (no code box)').toBe(true);
  const code = await latestCode(email);
  expect(await signedIn(flow.client), 'ROW-180: the browser is signed in before entering any code').toBe(false);
  await enterCode(flow, code);
  expect(await signedIn(flow.client), 'ROW-180: the correct emailed code, entered once, does not sign the person in').toBe(true);
});

test('ROW-001 asking for a code alone does not sign the person in', async () => {
  const flow = await requestCode(freshMail('row001'));
  needCodeForm(flow);
  expect(await signedIn(flow.client), 'ROW-001: asking for a code signed the browser in without any code entered').toBe(false);
});

test('ROW-001 no code, an empty code or a wrong code does not sign the person in', async () => {
  const flow = await codeFlow(freshMail('row001'));
  await enterCode(flow, '', flow.client, { omitCode: true });
  expect(await signedIn(flow.client), 'ROW-001: submitting the code-entry form with no code signed the person in').toBe(false);
  await enterCode(flow, '');
  expect(await signedIn(flow.client), 'ROW-001: an empty code signed the person in').toBe(false);
  await enterCode(flow, wrongCode(flow.code));
  expect(await signedIn(flow.client), 'ROW-001: a wrong 6-digit code signed the person in').toBe(false);
});

test('ROW-001 control the emailed code entered after the refused tries signs the person in', async () => {
  const flow = await codeFlow(freshMail('row001'));
  await enterCode(flow, '', flow.client, { omitCode: true });
  await enterCode(flow, wrongCode(flow.code));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-001: the emailed code, entered after one wrong try, does not sign the person in').toBe(true);
});

test('ROW-118 a code issued to one email does not sign in as another email', async () => {
  const a = await codeFlow(freshMail('row118a'));
  const b = await codeFlow(freshMail('row118b'));
  const onB = b.client.clone(new Client().address);
  await enterCode(b, a.code, onB);
  expect(await signedIn(onB), `ROW-118: ${a.email}'s code, entered on ${b.email}'s code-entry step, signed in`).toBe(false);
  const onA = a.client.clone(new Client().address);
  await enterCode(a, b.code, onA);
  expect(await signedIn(onA), `ROW-118: ${b.email}'s code, entered on ${a.email}'s code-entry step, signed in`).toBe(false);
});

test('ROW-118 control the other email\'s own code signs it in', async () => {
  const a = await codeFlow(freshMail('row118a'));
  const b = await codeFlow(freshMail('row118b'));
  const onB = b.client.clone(new Client().address);
  await enterCode(b, a.code, onB);
  await enterCode(b, b.code);
  expect(await signedIn(b.client), `ROW-118: ${b.email}'s own code does not sign it in after another email's code was tried on its step`).toBe(true);
});

test('HOS-001 no code, an empty code and another email\'s code give no session', async () => {
  const flow = await codeFlow(freshMail('hos001'));
  const other = await codeFlow(freshMail('hos001x'));
  const tries: [string, () => Promise<unknown>, Client][] = [];
  const c1 = flow.client.clone();
  tries.push(['no code field at all', () => enterCode(flow, '', c1, { omitCode: true }), c1]);
  const c2 = flow.client.clone();
  tries.push(['an empty code', () => enterCode(flow, '', c2), c2]);
  const c3 = flow.client.clone();
  tries.push([`${other.email}'s live code`, () => enterCode(flow, other.code, c3), c3]);
  for (const [what, act, client] of tries) {
    await act();
    expect(await signedIn(client), `vid-forbidden-effect: HOS-001\nHOS-001: submitting ${what} on the code-entry step signed the person in`).toBe(false);
  }
});

test('HOS-002 the correct code entered within 10 minutes gives a session', async () => {
  const flow = await codeFlow(freshMail('hos002'));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'vid-forbidden-effect: HOS-002\nHOS-002: the correct code, entered at once, gave no session').toBe(true);
});

test('ROW-001 codes one digit away from the emailed code do not sign the person in', async () => {
  const flow = await codeFlow(freshMail('row001n'));
  const c = flow.code;
  const near = new Set<string>();
  for (let i = 0; i < 6; i++) near.add(c.slice(0, i) + String((Number(c[i]) + 1 + randomInt(0, 9)) % 10) + c.slice(i + 1));
  near.add(c.slice(1) + c[0]);
  near.add(c.split('').reverse().join(''));
  near.delete(c);
  for (const n of near) {
    const other = flow.client.clone(new Client().address);
    await enterCode(flow, n, other);
    expect(await signedIn(other), `ROW-001: ${n}, a near miss of the emailed code ${c}, signed the person in`).toBe(false);
  }
});

test('ROW-118 a code issued to one email does not sign in as a near-identical email', async () => {
  const local = `row118n-${fresh()}`;
  const a = await codeFlow(`${local}a@example.test`);
  const b = await codeFlow(`${local}b@example.test`);
  const onB = b.client.clone(new Client().address);
  await enterCode(b, a.code, onB);
  expect(await signedIn(onB), `ROW-118: ${a.email}'s code, entered on ${b.email}'s code-entry step, signed in`).toBe(false);
  const onA = a.client.clone(new Client().address);
  await enterCode(a, b.code, onA);
  expect(await signedIn(onA), `ROW-118: ${b.email}'s code, entered on ${a.email}'s code-entry step, signed in`).toBe(false);
});
