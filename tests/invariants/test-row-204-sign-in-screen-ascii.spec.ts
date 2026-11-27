// Purpose: ROW-204's ledger test — the sign-in screen accepts no email holding a non-ASCII or invisible character.
//
// | row     | kind     | marker | state | actor     | route |
// |---------|----------|--------|-------|-----------|-------|
// | ROW-204 | behavior | n/a    | n/a   | anonymous | /     |
//
// The test argument (ROW-204)
// ROW-204 promise: this never happens: an email holding any non-ASCII or invisible character is accepted at sign-in or
//   in the call box. Authority: REQ-039 fail-if (1), A-052.
// ROW-204 wrong product: a sign-in screen that relies on the browser's own email field, which converts an IDN domain
//   ("exämple") to its punycode form and sends it — the server sees plain ASCII and sends the code; a screen that
//   strips a zero-width space before sending.
// ROW-204 given: a fresh browser at a fresh address. when: the visitor types into the email box an address holding one
//   such character (a Latin-looking letter, an IDN domain, a zero-width space, a no-break space inside, a soft hyphen)
//   and presses the send-code button. then: the code-entry step does not show (no visible code box).
// ROW-204 given (the edges): by the owner's answer on #5 (ROW-204, ROW-212: refused, never trimmed), a no-break space,
//   a zero-width space, a BOM and an ideographic space typed at the very start or the very end of a fresh address;
//   then: the code-entry step does not show.
// ROW-204 controls: a plain ASCII address with dots, plus and apostrophe, typed the same way, reaches the code-entry step.
// ROW-204 technique: operation in the browser — the screen as a person meets it; the request's own refusal is ROW-212's.
//   The call box half waits for the call box (a later step): no case of it here, named in the hand-back.
// cases: ROW-204 target=ROW-204 an email holding a non-ASCII or invisible character typed on the sign-in screen is not accepted control=ROW-204 control a plain ASCII email typed on the sign-in screen reaches the code-entry step

import { test, expect, type Page } from '@playwright/test';
import { openPage, fresh } from './harness';
import { freshClientAddress } from './signin';

const CODE_BOX = 'input[name*="code" i], input[name*="otp" i], input[autocomplete="one-time-code"]';
const SEND_CODE = /code/i; // test value (ROW-093)

async function typeAndSend(page: Page, email: string) {
  await page.context().clearCookies();
  await page.context().setExtraHTTPHeaders({ 'CF-Connecting-IP': freshClientAddress() });
  const res = await openPage(page, '/');
  expect(res.status(), 'ROW-204: / does not answer 200').toBe(200);
  await page.getByRole('textbox').first().fill(email);
  await page.getByRole('button', { name: SEND_CODE }).first().click();
  await page.waitForLoadState('load');
  return page.locator(CODE_BOX).first().isVisible().catch(() => false);
}

test('ROW-204 control a plain ASCII email typed on the sign-in screen reaches the code-entry step', async ({ page }) => {
  expect(await typeAndSend(page, `first.o'brien+tag-${fresh()}@example.test`), 'ROW-204: a plain ASCII email typed on the sign-in screen does not reach the code-entry step').toBe(true);
});

test('ROW-204 an email holding a non-ASCII or invisible character typed on the sign-in screen is not accepted', async ({ page }) => {
  const inputs = [
    `row204-${fresh()}@exämple.test`,
    `rоw204-${fresh()}@example.test`,
    `row204​-${fresh()}@example.test`,
    `row204 x-${fresh()}@example.test`,
    `row204­-${fresh()}@example.test`,
    `row204-${fresh()}@example.tеst`,
  ];
  for (const e of inputs) {
    expect(await typeAndSend(page, e), `ROW-204: the sign-in screen accepted ${JSON.stringify(e)} (the code-entry step showed)`).toBe(false);
  }
});

test('ROW-204 an email with a non-ASCII or invisible character at its start or end typed on the sign-in screen is not accepted', async ({ page }) => {
  const inputs = [
    `\u00a0row204e-${fresh()}@example.test`,
    `row204e-${fresh()}@example.test\u00a0`,
    `\u200brow204e-${fresh()}@example.test`,
    `row204e-${fresh()}@example.test\ufeff`,
    `\u3000row204e-${fresh()}@example.test`,
  ];
  for (const e of inputs) {
    expect(await typeAndSend(page, e), `ROW-204: the sign-in screen accepted ${JSON.stringify(e)} (the code-entry step showed)`).toBe(false);
  }
});
