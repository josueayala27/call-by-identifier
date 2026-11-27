// Purpose: ROW-096's ledger test — from the sign-in screen at /, asking for a code reaches the code-entry step, which leads back to the email step.
//
// | row     | kind         | marker | state | actor     | route |
// |---------|--------------|--------|-------|-----------|-------|
// | ROW-096 | reachability | n/a    | n/a   | anonymous | /     |
//
// The test argument (ROW-096)
// ROW-096 promise: the sign-in screen is the entry point; after a code is requested the code-entry step is reachable
//   from it and leads back to the email step. Authority: REQ-001 (enter an email, ask for a code, enter that code).
// ROW-096 wrong product: a code request that answers with a bare message and no code box; a code-entry step reachable
//   only by typing a URL; a code-entry step with no way back, so a mistyped email strands the person.
// ROW-096 given: a fresh browser (no cookie) at a fresh client address, a fresh email. when: the visitor loads /, types
//   the email and presses the send-code button, then operates the code-entry step's controls other than its submit.
// ROW-096 then: after the press the code-entry step shows a visible code box; one of its other controls, operated,
//   shows the email step again (a visible email box with a send-code button).
// ROW-096 controls: the control case: / shows the email box and send-code button and accepts typing (the entry point).
// ROW-096 technique: operation in the browser (the boundary rule: reachability is operation), the denominator being
//   every link and button of the code-entry step but its submit — no control name is assumed. Test values, asked:
//   the code box is an input named with "code"/"otp" or marked autocomplete=one-time-code; the send-code button is
//   the button named with "code" (ROW-093's test value). No design/ exists, so nothing is measured.
// cases: ROW-096 target=ROW-096 after a code is requested the code-entry step shows and leads back to the email step control=ROW-096 control the sign-in screen at / is the entry point

import { test, expect, type Page } from '@playwright/test';
import { openPage, freshEmail } from './harness';
import { freshClientAddress } from './signin';

const CODE_BOX = 'input[name*="code" i], input[name*="otp" i], input[autocomplete="one-time-code"]';
const SEND_CODE = /code/i; // test value (ROW-093)

async function toCodeStep(page: Page) {
  await page.context().clearCookies();
  await page.context().setExtraHTTPHeaders({ 'CF-Connecting-IP': freshClientAddress() });
  const res = await openPage(page, '/');
  expect(res.status(), 'ROW-096: / does not answer 200').toBe(200);
  await page.getByRole('textbox').first().fill(freshEmail('row096'));
  await page.getByRole('button', { name: SEND_CODE }).first().click();
  await page.waitForLoadState('load');
}

test('ROW-096 control the sign-in screen at / is the entry point', async ({ page }) => {
  await page.context().setExtraHTTPHeaders({ 'CF-Connecting-IP': freshClientAddress() });
  const res = await openPage(page, '/');
  expect(res.status(), 'ROW-096: / does not answer 200').toBe(200);
  await expect(page.getByRole('textbox').first(), 'ROW-096: no email box at /').toBeVisible();
  await expect(page.getByRole('button', { name: SEND_CODE }).first(), 'ROW-096: no send-code button at /').toBeVisible();
});

test('ROW-096 after a code is requested the code-entry step shows and leads back to the email step', async ({ page }) => {
  await toCodeStep(page);
  await expect(page.locator(CODE_BOX).first(), 'ROW-096: pressing the send-code button does not show the code-entry step (no code box)').toBeVisible();

  // Every link and button on the code-entry step except the one that submits the code.
  const candidates = async () => {
    const all = page.locator('a[href], button, input[type="submit"], input[type="button"], [role="button"], [role="link"]');
    const n = await all.count();
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const el = all.nth(i);
      if (!(await el.isVisible())) continue;
      const submitsCode = await el.evaluate((e, sel) => {
        const f = (e as HTMLButtonElement).form;
        const isSubmit = (e as HTMLButtonElement).type === 'submit';
        return !!f && isSubmit && !!f.querySelector(sel);
      }, CODE_BOX);
      if (!submitsCode) out.push(i);
    }
    return { all, out };
  };

  const first = await candidates();
  expect(first.out.length, 'ROW-096: the code-entry step has no control other than its submit — no way back to the email step').toBeGreaterThan(0);

  let back = false;
  for (let k = 0; k < Math.min(first.out.length, 5) && !back; k++) {
    if (k > 0) {
      await toCodeStep(page);
      if (!(await page.locator(CODE_BOX).first().isVisible())) break;
    }
    const { all, out } = await candidates();
    if (k >= out.length) break;
    await all.nth(out[k]).click();
    await page.waitForLoadState('load');
    const emailBox = page.locator('input[type="email"], input[name*="email" i]').first();
    const send = page.getByRole('button', { name: SEND_CODE }).first();
    back = (await emailBox.isVisible().catch(() => false)) && (await send.isVisible().catch(() => false)) &&
      !(await page.locator(CODE_BOX).first().isVisible().catch(() => false));
  }
  expect(back, 'ROW-096: no control of the code-entry step leads back to the email step').toBe(true);
});
