// Purpose: ledger tests for what the code store does on error and when an account is made: ROW-126 and ROW-146.
//
// Both read or move what no page can show, through test-switch doors (requested; a case errors "setup:" without them):
// POST /__test/fault?at=codes|codes-write|none (every code-store operation, or every code-store write, fails until
// at=none) and GET /__test/account?email= (a measuring tool; asked, as no spec decision names one yet).
//
// The test argument (ROW-126)
// ROW-126 promise: this must always hold: a storage error while checking or counting a code signs nobody in.
//   Authority: REQ-002 (a code works once, dies after 5 wrong tries), REQ-001 AMENDED fail-if (1).
// ROW-126 wrong product: a check that treats a failed read as "no attempts yet" and goes on; a sign-in that ignores a
//   failed write of "used" or of the try count and still makes the session (fail-open).
// ROW-126 given: a fresh email and its right code; when: the code store fails on every operation (case 1), or on every
//   write only (case 2), and the right code is entered; then: not signed in.
// ROW-126 controls: with the fault cleared, the same right code signs in — the code was live, so the refusal was the
//   error's.
// ROW-126 technique: fault injection at the one storage seam, then the right code — the only input that could sign in.
// cases: ROW-126 target=ROW-126 a storage error while checking a code signs nobody in control=ROW-126 control with the storage error cleared the same code signs in
//
// The test argument (ROW-146)
// ROW-146 promise: this must always hold: asking for a code creates no account; only entering the code does.
//   Authority: REQ-001 AMENDED (the first sign-in with an email makes its account), A-001 AMENDED.
// ROW-146 wrong product: an account row inserted at the code request (so anyone can create accounts for others' emails);
//   or at a wrong code.
// ROW-146 given: a fresh email; when: a code is asked for, then a wrong code entered; then: 0 accounts each time; after
//   the right code: 1.
// ROW-146 controls: the right code makes exactly 1 account (the door counts what it should).
// ROW-146 technique: before and after, on the one record.
// cases: ROW-146 target=ROW-146 asking for a code or entering a wrong one creates no account control=ROW-146 control entering the code creates the account

import { test, expect, afterEach } from 'vitest';
import { codeFlow, enterCode, signedIn, freshMail, wrongCode, storageFault, accountCount } from './signin';

let faulted = false;
afterEach(async () => {
  if (faulted) {
    faulted = false;
    await storageFault('none');
  }
});

test('ROW-126 control with the storage error cleared the same code signs in', async () => {
  const flow = await codeFlow(freshMail('row126'));
  faulted = true;
  await storageFault('codes');
  await enterCode(flow, flow.code);
  await storageFault('none');
  faulted = false;
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-126: with the storage error cleared, the live code does not sign in').toBe(true);
});

test('ROW-126 a storage error while checking a code signs nobody in', async () => {
  const flow = await codeFlow(freshMail('row126'));
  faulted = true;
  await storageFault('codes');
  await enterCode(flow, flow.code);
  const signed = await signedIn(flow.client);
  expect(signed, 'ROW-126: the right code signed in while every code-store operation failed').toBe(false);
});

test('ROW-126 a storage error while counting a code signs nobody in', async () => {
  const flow = await codeFlow(freshMail('row126'));
  faulted = true;
  await storageFault('codes-write');
  await enterCode(flow, flow.code);
  const signed = await signedIn(flow.client);
  expect(signed, 'ROW-126: the right code signed in while every code-store write (the count, the use) failed').toBe(false);
});

test('ROW-146 control entering the code creates the account', async () => {
  const flow = await codeFlow(freshMail('row146'));
  await enterCode(flow, flow.code);
  expect(await accountCount(flow.email), 'ROW-146: entering the code did not make exactly one account').toBe(1);
});

test('ROW-146 asking for a code or entering a wrong one creates no account', async () => {
  const flow = await codeFlow(freshMail('row146'));
  expect(await accountCount(flow.email), 'ROW-146: asking for a code created an account').toBe(0);
  await enterCode(flow, wrongCode(flow.code));
  expect(await accountCount(flow.email), 'ROW-146: entering a wrong code created an account').toBe(0);
});
