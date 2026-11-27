// Purpose: ROW-142's ledger test — the product with the test switch off (the deployed shape) has no fixed code, no code reader, no fake mailer and no test bypass.
//
// The deployed shape is the product at PRODUCT_OFF_URL: the same build with VID_TEST off, which the harness provides
// (requested of the test manager); on a staging run it is the staging address. A case errors "setup:" without it.
//
// The test argument (ROW-142)
// ROW-142 promise: this must always hold: no fixed code, last-code reader, fake mailer or test bypass is reachable in
//   the deployed product. Authority: REQ-001 (the one way in is the code sent to the mailbox), DIF-001 (the fake
//   mailer is the test environment's alone).
// ROW-142 wrong product: the doors this ledger uses (/__test/mail, /__test/clock, /__test/fault, /__test/account) wired
//   whatever the switch says; the switch read as "on unless set to 0"; a fixed code such as 000000 or 123456 left in
//   the check for tests.
// ROW-142 given: the switch-off product; when: every door path this ledger knows is called, and a fresh email's code
//   is asked for and then each of 7 fixed codes is entered, each from its own fresh address; then: every door answers
//   404 (or 405), and no fixed code signs in.
// ROW-142 controls: the switch-off product serves the sign-in screen at / (it is up and is this product).
// ROW-142 technique: the attack — every bypass the test side itself knows about, against the deployed shape. A door
//   under a name this ledger does not know cannot be found from outside; that is the grader's to read.
// cases: ROW-142 target=ROW-142 no test door and no fixed code is reachable with the test switch off control=ROW-142 control the switch-off product serves the sign-in screen

import { test, expect } from 'vitest';
import { Client, requestCode, enterCode, signedIn, signInForm, freshMail, SetupError, freshClientAddress } from './signin';

function offUrl(): string {
  const u = (process.env.PRODUCT_OFF_URL || '').trim();
  if (!u) throw new SetupError('no switch-off product in this run (PRODUCT_OFF_URL unset)');
  return u.replace(/\/+$/, '');
}

test('ROW-142 control the switch-off product serves the sign-in screen', async () => {
  const page = await new Client(freshClientAddress(), offUrl()).request('/');
  expect(page.status, 'ROW-142: the switch-off product does not answer / with 200').toBe(200);
  expect(!!signInForm(page.forms), 'ROW-142: the switch-off product shows no sign-in form at /').toBe(true);
});

test('ROW-142 no test door and no fixed code is reachable with the test switch off', async () => {
  const base = offUrl();
  const doors: [string, string][] = [
    ['GET', `/__test/mail?to=${encodeURIComponent(freshMail('row142'))}`],
    ['POST', `/__test/mail/fail?to=${encodeURIComponent(freshMail('row142'))}`],
    ['POST', '/__test/clock?advance=1'],
    ['POST', '/__test/fault?at=none'],
    ['GET', `/__test/account?email=${encodeURIComponent(freshMail('row142'))}`],
    ['GET', '/__test/'],
  ];
  for (const [method, path] of doors) {
    let status: number;
    try {
      status = (await fetch(base + path, { method, headers: { 'CF-Connecting-IP': freshClientAddress() } })).status;
    } catch (e) {
      throw new SetupError(`the switch-off product did not answer: ${(e as Error).message}`);
    }
    expect([404, 405], `ROW-142: ${method} ${path.split('?')[0]} answers ${status} with the test switch off`).toContain(status);
  }

  const flow = await requestCode(freshMail('row142'), new Client(freshClientAddress(), base));
  if (!flow.form) throw new SetupError(`the switch-off product shows no code-entry step after a code request (status ${flow.page.status})`);
  for (const fixed of ['000000', '123456', '111111', '999999', '654321', '000001', '123123']) {
    const c = flow.client.clone(freshClientAddress());
    await enterCode(flow, fixed, c);
    expect(await signedIn(c), `ROW-142: the fixed code ${fixed} signs in with the test switch off`).toBe(false);
  }
});
