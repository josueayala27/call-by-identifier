// Purpose: ledger tests for a code's 10-minute life and single use: ROW-004, ROW-005, HOS-004 and HOS-005.
//
// The clock: these cases move the product's clock through the test-switch door POST /__test/clock?advance=<seconds>
// (a set-up door, requested; a case errors "setup:" without it). Test values, asked: the boundary is read in whole
// seconds — 599 s after sending is "in time", 601 s is "more than 10 minutes".
//
// The test argument (ROW-004)
// ROW-004 promise: this never happens: a code signs someone in more than 10 minutes after it was sent. Authority:
//   REQ-002 fail-if (1), A-015 AMENDED (valid for 10 minutes).
// ROW-004 wrong product: no expiry at all; an expiry of 15 minutes or an hour; an expiry measured from the first entry
//   rather than from sending.
// ROW-004 given: a fresh email and its emailed code; when: the product's clock moves 601 s past the send, then the code
//   is entered; then: the browser is not signed in.
// ROW-004 controls: the same steps with 599 s sign in — the clock door works and the code was live up to the boundary.
// ROW-004 technique: values just either side of the deadline, with the clock's origin at the send.
// cases: ROW-004 target=ROW-004 a code entered 601 seconds after it was sent does not sign in control=ROW-004 control a code entered 599 seconds after it was sent signs in
//
// The test argument (ROW-005)
// ROW-005 promise: this never happens: a code signs someone in a second time. Authority: REQ-002 fail-if (2), A-015
//   AMENDED (usable once).
// ROW-005 wrong product: a code checked but never marked used, so the same submission replayed — by the same browser
//   state or another browser — gets a second session.
// ROW-005 given: a fresh email and its code, entered once (signed in); when: the very same submission is replayed from a
//   copy of the browser taken before the first entry, and from a second browser at another address; then: neither
//   copy is signed in.
// ROW-005 controls: the first entry signed in (asserted in the same case before the replay).
// ROW-005 technique: before/after on one code; the replay is the exact first submission.
// cases: ROW-005 target=ROW-005 a code that signed in once does not sign in a second time control=ROW-005 control the first entry of the code signs in
//
// The test argument (HOS-004) — a protection row (protects REQ-002; disable: remove the expiry comparison)
// HOS-004 promise: on the code-entry screen, submit the code 10 minutes and 1 second after it was sent, expect no session.
// HOS-004 wrong product: the expiry comparison removed — an old code still signs in.
// HOS-004 given/when/then: the product's clock moved 601 s after the send; the code is entered; no session. The failure
//   message carries vid-forbidden-effect: HOS-004 only when the browser is signed in.
// HOS-004 controls: ROW-004's control in this file (599 s signs in).
// HOS-004 technique: the attack, one second past the boundary.
// cases: HOS-004 target=HOS-004 the code entered 10 minutes and 1 second after sending gives no session control=ROW-004 control a code entered 599 seconds after it was sent signs in
//
// The test argument (HOS-005) — a protection row (protects REQ-002; disable: remove single-use consumption)
// HOS-005 promise: submit a correct code a second time after it signed in once, expect no second session.
// HOS-005 wrong product: single-use consumption removed.
// HOS-005 given/when/then: the code signs in once; the same submission from a copy of the pre-entry browser gives no
//   session. The failure message carries vid-forbidden-effect: HOS-005 only when the copy is signed in.
// HOS-005 controls: ROW-005's control (the first entry signs in).
// HOS-005 technique: the replay attack.
// cases: HOS-005 target=HOS-005 a correct code submitted a second time gives no second session control=ROW-005 control the first entry of the code signs in

import { test, expect } from 'vitest';
import { Client, codeFlow, enterCode, signedIn, freshMail, advanceClock, SetupError } from './signin';

test('ROW-004 control a code entered 599 seconds after it was sent signs in', async () => {
  const flow = await codeFlow(freshMail('row004'));
  await advanceClock(599);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-004: a code entered 599 s after it was sent (within 10 minutes) does not sign in').toBe(true);
});

test('ROW-004 a code entered 601 seconds after it was sent does not sign in', async () => {
  const flow = await codeFlow(freshMail('row004'));
  await advanceClock(601);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-004: a code entered 601 s after it was sent signed in').toBe(false);
});

test('HOS-004 the code entered 10 minutes and 1 second after sending gives no session', async () => {
  const flow = await codeFlow(freshMail('hos004'));
  await advanceClock(601);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'vid-forbidden-effect: HOS-004\nHOS-004: the code entered 10 min 1 s after sending gave a session').toBe(false);
});

test('ROW-005 control the first entry of the code signs in', async () => {
  const flow = await codeFlow(freshMail('row005'));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-005: the first entry of the emailed code does not sign in').toBe(true);
});

test('ROW-005 a code that signed in once does not sign in a second time', async () => {
  const flow = await codeFlow(freshMail('row005'));
  const replay = flow.client.clone();
  const elsewhere = flow.client.clone(new Client().address);
  await enterCode(flow, flow.code);
  if (!(await signedIn(flow.client))) throw new SetupError('the first entry of the code did not sign in (ROW-180): the second entry cannot be reached');
  await enterCode(flow, flow.code, replay);
  expect(await signedIn(replay), 'ROW-005: the code that already signed in signed in a second time (same browser state replayed)').toBe(false);
  await enterCode(flow, flow.code, elsewhere);
  expect(await signedIn(elsewhere), 'ROW-005: the code that already signed in signed in a second time (another browser, another address)').toBe(false);
});

test('HOS-005 a correct code submitted a second time gives no second session', async () => {
  const flow = await codeFlow(freshMail('hos005'));
  const replay = flow.client.clone();
  await enterCode(flow, flow.code);
  if (!(await signedIn(flow.client))) throw new SetupError('the first entry of the code did not sign in (ROW-180): the second entry cannot be reached');
  await enterCode(flow, flow.code, replay);
  expect(await signedIn(replay), 'vid-forbidden-effect: HOS-005\nHOS-005: the code that already signed in gave a second session').toBe(false);
});
