// Purpose: ROW-093's ledger test — a signed-out visitor at / sees only the sign-in screen (email box, send-code button).
//
// | row     | kind  | marker | state | actor     | route |
// |---------|-------|--------|-------|-----------|-------|
// | ROW-093 | shell | shell  | n/a   | anonymous | /     |
//
// The test argument (ROW-093)
// ROW-093 promise: a signed-out visitor at / sees only the sign-in screen — an email box and a send-code button — and
//   no call box, no sign-out control, no incoming-call area. Authority: the row itself (INVENTORY ROW-093), serving
//   REQ-001 (the one way in is a code sent to your email) and REQ-005 fail-if (1)-(2) (a signed-out visitor can start
//   no call and cannot be rung).
// ROW-093 wrong product: a page at / that renders the whole app shell for everyone — the sign-in form plus the call box
//   (a second email field with a Call button), a Sign out button, or an Incoming call area (Accept / Decline) — and
//   leaves it to scripts or the server to refuse later; or one that shows the call screen instead of the sign-in form.
// ROW-093 given: a fresh browser context with no cookie (signed out) and a fresh client address (CF-Connecting-IP).
//   when: the visitor loads / once. then: the page's visible controls are exactly one text field (the email box) and
//   one button (send code) in the same form; nothing else — no second field, no other button, no sign-out link,
//   no dialog, no incoming-call wording.
// ROW-093 controls: the control case shows the screen is reached and is the sign-in screen: / answers 200, the email
//   box takes a fresh email typed into it, and the send-code button belongs to the email box's form. A fault that
//   adds a call box, a sign-out control or an incoming-call area to the signed-out page leaves it passing.
// ROW-093 technique: a denominator over every visible control on the page (the accessibility tree's interactive roles),
//   not the box the implementation labelled: a stray control fails wherever it sits. The decoy is the call box itself,
//   a second email field — the near miss of the email box. No design/ exists, so no marker or canvas is measured.
// ROW-093 test values (asked as questions, no spec number or wording exists): the send-code button is recognised by
//   "code" in its accessible name; a sign-out control by /sign ?out|log ?out/ in a name or href; incoming-call wording
//   by the words "incoming", "accept", "decline", "hang up", "is calling" in the visible text.
// cases: ROW-093 target=ROW-093 a signed-out visitor sees no call box, no sign-out control and no incoming-call area control=ROW-093 control the signed-out page at / is the sign-in screen with an email box and a send-code button

import { test, expect, type Page } from '@playwright/test';
import { openPage, freshClientAddress, freshEmail } from './harness';

// Every interactive role a visible control can take; getByRole skips what is hidden from the accessibility tree.
const FIELD_ROLES = ['textbox', 'searchbox', 'combobox', 'spinbutton'] as const;
const OTHER_ROLES = ['checkbox', 'radio', 'switch', 'slider', 'menuitem', 'tab', 'listbox', 'option'] as const;

const SEND_CODE_NAME = /code/i; // test value
const SIGN_OUT = /sign[\s-]?out|log[\s-]?out/i; // test value
const INCOMING_WORDING = /\bincoming\b|\baccept\b|\bdecline\b|\bhang[\s-]?up\b|\bis calling\b/i; // test value

async function loadSignedOut(page: Page) {
  await page.context().clearCookies();
  await page.context().setExtraHTTPHeaders({ 'CF-Connecting-IP': freshClientAddress() });
  return openPage(page, '/');
}

async function names(page: Page, role: Parameters<Page['getByRole']>[0]) {
  const loc = page.getByRole(role);
  const n = await loc.count();
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const el = loc.nth(i);
    const label = await el.evaluate((e) => {
      const x = e as HTMLInputElement;
      const lab = x.labels && x.labels.length ? x.labels[0].textContent : '';
      return e.getAttribute('aria-label') || lab || x.placeholder || (e as HTMLElement).innerText || x.value || '';
    });
    out.push(`${role}:${label.trim()}`);
  }
  return out;
}

test('ROW-093 control the signed-out page at / is the sign-in screen with an email box and a send-code button', async ({ page }) => {
  const res = await loadSignedOut(page);
  expect(res.status(), 'ROW-093: / does not answer 200 for a signed-out visitor').toBe(200);

  const field = page.getByRole('textbox');
  await expect(field.first(), 'ROW-093: no email box on the signed-out page at /').toBeVisible();
  const email = freshEmail('row093');
  await field.first().fill(email);
  await expect(field.first(), 'ROW-093: the email box does not take an email typed into it').toHaveValue(email);

  const send = page.getByRole('button', { name: SEND_CODE_NAME });
  await expect(send.first(), 'ROW-093: no send-code button on the signed-out page at /').toBeVisible();

  const sameForm = await field.first().evaluate((input, button) => {
    const f = (input as HTMLInputElement).form;
    return !!f && (button as HTMLButtonElement).form === f;
  }, await send.first().elementHandle());
  expect(sameForm, 'ROW-093: the send-code button does not submit the email box (they are not in one form)').toBe(true);
});

test('ROW-093 a signed-out visitor sees no call box, no sign-out control and no incoming-call area', async ({ page }) => {
  const res = await loadSignedOut(page);
  expect(res.status(), 'ROW-093: / does not answer 200 for a signed-out visitor').toBe(200);

  // The denominator: every visible control on the page.
  const fields: string[] = [];
  for (const r of FIELD_ROLES) fields.push(...(await names(page, r)));
  const buttons = await names(page, 'button');
  const others: string[] = [];
  for (const r of OTHER_ROLES) others.push(...(await names(page, r)));

  expect(fields.length, `ROW-093: the signed-out page shows ${fields.length} text fields, not the one email box — a call box or other field is shown: ${JSON.stringify(fields)}`).toBe(1);
  expect(buttons.length, `ROW-093: the signed-out page shows ${buttons.length} buttons, not the one send-code button: ${JSON.stringify(buttons)}`).toBe(1);
  await expect(page.getByRole('button').first(), 'ROW-093: the signed-out page\'s one button is not the send-code button').toHaveAccessibleName(SEND_CODE_NAME);
  expect(others, `ROW-093: the signed-out page shows controls beyond the sign-in form: ${JSON.stringify(others)}`).toEqual([]);

  // No sign-out control, as a link either.
  const links = page.getByRole('link');
  const n = await links.count();
  const signOutLinks: string[] = [];
  for (let i = 0; i < n; i++) {
    const l = links.nth(i);
    const text = `${(await l.getAttribute('aria-label')) || ''} ${await l.innerText().catch(() => '')}`;
    const href = (await l.getAttribute('href')) || '';
    if (SIGN_OUT.test(text) || SIGN_OUT.test(href)) signOutLinks.push(`${text.trim()} -> ${href}`);
  }
  expect(signOutLinks, 'ROW-093: the signed-out page shows a sign-out control').toEqual([]);

  // No incoming-call area: no dialog, no incoming-call wording anywhere visible.
  expect(await page.getByRole('dialog').count(), 'ROW-093: the signed-out page shows a dialog').toBe(0);
  expect(await page.getByRole('alertdialog').count(), 'ROW-093: the signed-out page shows an alert dialog').toBe(0);
  const visibleText = await page.locator('body').innerText();
  const incoming = visibleText.match(INCOMING_WORDING);
  expect(incoming?.[0] ?? null, 'ROW-093: the signed-out page shows an incoming-call area').toBeNull();
  const signOutText = visibleText.match(SIGN_OUT);
  expect(signOutText?.[0] ?? null, 'ROW-093: the signed-out page shows sign-out wording').toBeNull();
});
