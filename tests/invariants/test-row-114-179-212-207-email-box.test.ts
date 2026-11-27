// Purpose: ledger tests for what the email box accepts and where the code email goes: ROW-114, ROW-179, ROW-212 and ROW-207.
//
// "Accepted" (test value, asked): the code request answers with the code-entry step, or the fake mailer (DIF-001)
// records a code email to any address the input holds. "Refused" is neither. Each request is a fresh email from a
// fresh address. The normalised address is the input in lowercase (A-020, D-012).
//
// The test argument (ROW-114)
// ROW-114 promise: this must always hold: the email box refuses commas, line breaks, display names, several @ and more
//   than 254 characters; the code email has exactly one recipient, equal to the normalised address; and this must
//   always hold: only one bare address is accepted: semicolons, spaces and angle brackets are refused, apostrophes
//   accepted. Authority: REQ-001 (the code goes to *that* email), A-020 (lowercase), RFC 5321's 254-character path.
// ROW-114 wrong product: the input handed to the mail binding as typed — "a@x,b@y" mails two people, "a@x\r\nBcc: c@y"
//   injects a recipient, "Name <a@x>" is passed through; mixed case kept in the recipient; a 255-character address accepted.
// ROW-114 given: fresh inputs with each forbidden shape, every address inside them fresh; when: each is sent as the code
//   request; then: no code-entry step and no code email to any address inside it. And: "Mixed.Case+Tag@Example.Test"
//   and an address with an apostrophe each get exactly one email with exactly one recipient, the lowercase form.
// ROW-114 controls: ROW-179's case (a plain address gets its one email) — the mailer door works and requests reach it.
// ROW-114 technique: decoys — each refused input holds real fresh addresses that a wrong product would mail.
// cases: ROW-114 target=ROW-114 commas, line breaks, display names, several @, semicolons, spaces and angle brackets are refused control=ROW-179 a plain valid email receives exactly one code email
//
// The test argument (ROW-179)
// ROW-179 promise: control of ROW-114: a plain valid email receives exactly one code email. Authority: REQ-001.
// ROW-179 wrong product: a request that sends nothing, or two emails, or one email to two recipients.
// ROW-179 given: a fresh plain address; when: a code is asked for it; then: the code-entry step shows and the mailer
//   holds exactly one message for it, whose recipients are exactly that address.
// ROW-179 controls: none further — it is the control.
// cases: ROW-179 target=ROW-179 a plain valid email receives exactly one code email control=ROW-179 a plain valid email receives exactly one code email
//
// The test argument (ROW-212)
// ROW-212 promise: at the code request response: this never happens: an email holding any non-ASCII or invisible
//   character is accepted — network address means the edge-reported client address, IPv6 counted per /64.
//   Authority: REQ-039 fail-if (1), A-052. (The address clause names no behaviour here; the requests use fresh addresses.)
// ROW-212 wrong product: a check that only looks for spaces; an address NFKC-folded or stripped of invisible characters
//   and then mailed (the cleaned address receives the code); IDN domains accepted.
// ROW-212 given: 16 inputs, each a fresh plain address with one character inserted at a random place strictly inside it, drawn from
//   letters that look Latin (é, Cyrillic а, Greek ο, full-width ＠), invisible ones (zero-width space and joiner,
//   soft hyphen, no-break space, BOM, right-to-left override) and ASCII control characters (tab, 0x01, 0x7F);
//   when: each is sent as the code request; then: refused — no code-entry step, and no email to it or to its
//   cleaned form.
// ROW-212 given (the edges): by the owner's answer on #5 (ROW-204, ROW-212: "Refused, never trimmed … a no-break space
//   is non-ASCII at the edges as anywhere else"), 10 characters (no-break space, zero-width space and joiner, BOM,
//   soft hyphen, right-to-left override, line separator, ideographic space, é, Cyrillic а), each placed at the very
//   start and at the very end of a fresh plain address; when: each is sent; then: refused — no code-entry step, and no
//   email to it or to its trimmed form. Wrong product: a Unicode-aware trim (String.prototype.trim removes a no-break
//   space, a BOM, a line separator and an ideographic space) before the ASCII check.
// ROW-212 controls: two of the same addresses without the inserted character are accepted.
// ROW-212 technique: a property over generated inputs, plus the named examples.
// cases: ROW-212 target=ROW-212 emails holding a non-ASCII or invisible character are refused at the code request control=ROW-212 control the same addresses without the added character are accepted
//
// The test argument (ROW-207)
// ROW-207 promise: control of ROW-204: a plain ASCII email with dots, plus and apostrophe is accepted. Authority: REQ-039, A-052.
// ROW-207 wrong product: an over-tight pattern ([a-z0-9]+@…) that refuses real addresses such as o'brien.x+tag@….
// ROW-207 given: "first.o'brien+tag-<fresh>@example.test"; when: a code is asked for it; then: the code-entry step
//   shows and exactly one code email goes to it.
// cases: ROW-207 target=ROW-207 a plain ASCII email with dots, plus and apostrophe is accepted control=ROW-179 a plain valid email receives exactly one code email

import { test, expect } from 'vitest';
import { randomInt } from 'node:crypto';
import { requestCode, mailFor, fresh, freshMail } from './signin';

async function refused(input: string, inside: string[]): Promise<string | null> {
  const flow = await requestCode(input);
  if (flow.form) return `the code-entry step was shown for ${JSON.stringify(input)}`;
  for (const a of inside) {
    const m = await mailFor(a.toLowerCase());
    if (m.length) return `a code email went to ${a} for the input ${JSON.stringify(input)}`;
  }
  return null;
}

async function oneEmailTo(row: string, input: string, normalised: string): Promise<void> {
  const flow = await requestCode(input);
  expect(!!flow.form, `${row}: the code request for ${JSON.stringify(input)} shows no code-entry step`).toBe(true);
  const msgs = await mailFor(normalised);
  expect(msgs.length, `${row}: ${msgs.length} code emails recorded for ${normalised}, not 1`).toBe(1);
  const rcpt = [...msgs[0].to, ...(msgs[0].cc || []), ...(msgs[0].bcc || [])];
  expect(rcpt, `${row}: the code email for ${JSON.stringify(input)} goes to ${JSON.stringify(rcpt)}, not only ${normalised}`).toEqual([normalised]);
}

test('ROW-179 a plain valid email receives exactly one code email', async () => {
  const e = freshMail('row179');
  await oneEmailTo('ROW-179', e, e);
});

test('ROW-207 a plain ASCII email with dots, plus and apostrophe is accepted', async () => {
  const e = `first.o'brien+tag-${fresh()}@example.test`;
  await oneEmailTo('ROW-207', e, e);
});

test('ROW-114 commas, line breaks, display names, several @, semicolons, spaces and angle brackets are refused', async () => {
  const a = () => freshMail('row114');
  const cases: [string, string[]][] = [];
  { const x = a(), y = a(); cases.push([`${x},${y}`, [x, y]]); }
  { const x = a(), y = a(); cases.push([`${x}, ${y}`, [x, y]]); }
  { const x = a(), y = a(); cases.push([`${x}\n${y}`, [x, y]]); }
  { const x = a(), y = a(); cases.push([`${x}\r\nBcc: ${y}`, [x, y]]); }
  { const x = a(); cases.push([`Row Tester <${x}>`, [x]]); }
  { const x = a(); cases.push([`"Row Tester" ${x}`, [x]]); }
  { const x = a(); cases.push([`<${x}>`, [x]]); }
  { const x = a(), y = a(); cases.push([`${x};${y}`, [x, y]]); }
  { const l = `row114-${fresh()}`; cases.push([`${l}@x@example.test`, [`${l}@x@example.test`, `${l}@x`, `x@example.test`]]); }
  { const l = `row114-${fresh()}`; cases.push([`${l} space@example.test`, [`${l} space@example.test`, `${l}space@example.test`, `space@example.test`]]); }
  for (const [input, inside] of cases) {
    const why = await refused(input, inside);
    expect(why, `ROW-114: ${why}`).toBeNull();
  }
});

test('ROW-114 an address over 254 characters is refused', async () => {
  const domain = `${'d'.repeat(60)}.${'e'.repeat(60)}.${'f'.repeat(60)}.example.test`; // 195 characters
  const local = `row114-${fresh()}`.padEnd(59, 'x'); // 59 characters
  const input = `${local}@${domain}`;
  expect(input.length, 'test value: the address is 255 characters').toBe(255);
  const why = await refused(input, [input]);
  expect(why, `ROW-114: ${why}`).toBeNull();
});

test('ROW-114 the code email has one recipient, the lowercase address, and apostrophes are accepted', async () => {
  const tag = fresh();
  await oneEmailTo('ROW-114', `Mixed.Case+Tag-${tag}@Example.Test`, `mixed.case+tag-${tag}@example.test`);
  const ap = `o'neil-${fresh()}@example.test`;
  await oneEmailTo('ROW-114', ap, ap);
});

const HOSTILE = ['é', 'а', 'ο', '＠', '​', '‍', '­', ' ', '﻿', '‮', '\t', '\u0001', '\u007f'];

function insertAt(base: string, ch: string): string {
  // a place strictly inside the address (never first or last, so no trimming rule can remove it), never displacing the @
  const at = base.indexOf('@');
  const spots = [...Array(base.length).keys()].filter((i) => i > 0 && (ch !== '＠' || i !== at + 1));
  const i = spots[randomInt(0, spots.length)];
  return base.slice(0, i) + ch + base.slice(i);
}

test('ROW-212 emails holding a non-ASCII or invisible character are refused at the code request', async () => {
  const inputs: [string, string][] = [];
  for (const ch of HOSTILE) inputs.push([insertAt(freshMail('row212'), ch), ch]);
  inputs.push([`row212-${fresh()}@exämple.test`, 'ä']);
  inputs.push([`row212-${fresh()}@example.tеst`, 'е']);
  inputs.push([`rоw212-${fresh()}@example.test`, 'о']);
  for (const [input, ch] of inputs) {
    const cleaned = input.split(ch).join('').normalize('NFKD').replace(/[^\x21-\x7e]/g, '');
    const why = await refused(input, [input, cleaned]);
    expect(why, `ROW-212: (inserted U+${ch.codePointAt(0)!.toString(16).padStart(4, '0')}) ${why}`).toBeNull();
  }
});

test('ROW-212 control the same addresses without the added character are accepted', async () => {
  for (let i = 0; i < 2; i++) {
    const e = freshMail('row212');
    const flow = await requestCode(e);
    expect(!!flow.form, `ROW-212: the plain address ${e} is not accepted at the code request`).toBe(true);
  }
});

const EDGE = ['\u00a0', '\u200b', '\u200d', '\ufeff', '\u00ad', '\u202e', '\u2028', '\u3000', 'é', 'а'];

test('ROW-212 emails with a non-ASCII or invisible character at their start or end are refused at the code request', async () => {
  for (const ch of EDGE) {
    for (const where of ['start', 'end'] as const) {
      const plain = freshMail('row212e');
      const input = where === 'start' ? ch + plain : plain + ch;
      const why = await refused(input, [input, plain]);
      expect(why, `ROW-212: (U+${ch.codePointAt(0)!.toString(16).padStart(4, '0')} at the ${where}) ${why}`).toBeNull();
    }
  }
});
