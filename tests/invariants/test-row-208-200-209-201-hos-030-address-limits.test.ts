// Purpose: ledger tests for wrong tries per network address: ROW-208, HOS-030, ROW-200, ROW-209 and ROW-201.
//
// "Network address" is CF-Connecting-IP, IPv4 whole, IPv6 per /64 (D-027). A wrong try from address X on email W is made
// on W's code-entry step (W's code asked for at another address Y, so the try counts against no code: A-055) with a
// fresh wrong 6-digit value. Every code request comes from its own fresh address, so REQ-038's 10 code emails per
// address and hour (a later row) never stand in the way.
//
// The test argument (ROW-208)
// ROW-208 promise: this never happens: wrong tries from one network address make a code requested from another network
//   address stop working — network address means the edge-reported client address, IPv6 counted per /64. Authority:
//   REQ-002 fail-if (7), A-055, D-027.
// ROW-208 wrong product: the wrong-try count kept per code whoever tries — anyone can kill a person's code by typing 5
//   wrong codes for their email; or IPv6 counted per whole address set apart only per /48.
// ROW-208 given: a fresh email whose code was asked for at A; when: 5 wrong codes are entered from B (another IPv4, or
//   another IPv6 /64); then: A's code, entered from A, signs in.
// ROW-208 controls: ROW-006's (5 wrong from A do stop it) — here, the 5 tries from B are refused (not signed in).
// ROW-208 technique: the neighbouring address as the attacker.
// cases: ROW-208 target=ROW-208 wrong tries from another address leave the code working control=ROW-208 control the wrong tries from the other address are refused
//
// The test argument (HOS-030) — a protection row (protects REQ-002; disable: remove the per-address scoping of wrong-try counts)
// HOS-030 promise: from address B submit 5 wrong codes for an email whose live code was requested from address A, then
//   submit A's code from A, expect it signs in.
// HOS-030 wrong product: wrong-try counts not scoped to the requesting address.
// HOS-030 given/when/then: as ROW-208's IPv4 case; the failure message carries vid-forbidden-effect: HOS-030 only when
//   A's code does not sign in.
// cases: HOS-030 target=HOS-030 5 wrong codes from another address leave the victim's code working control=ROW-208 control the wrong tries from the other address are refused
//
// The test argument (ROW-200)
// ROW-200 promise: this never happens: an 11th wrong try within an hour from one network address is checked against a
//   code — network address means the edge-reported client address, IPv6 counted per /64. Authority: REQ-037 fail-if (1)
//   ("further tries are refused without being checked"), A-050 ("at most 10 wrong code tries an hour").
// ROW-200 wrong product: no per-address limit; a limit that refuses the 11th try only after checking it (so it still
//   counts against the code, or its answer depends on the code); a limit kept per whole IPv6 address; a fixed hourly
//   window that starts at the address's first try and resets whole an hour later, so 10 tries just before the reset
//   and 10 more just after are all checked within a few seconds.
// ROW-200 given: address X has made 10 wrong tries on 10 other emails; X asks for a code for email E; when: X enters 5
//   more wrong codes on E's step (tries 11 to 15); then: E's code, entered from a fresh address Z, signs in — the 5
//   tries were never checked, or they would have stopped the code they were typed against (A-055: X asked for it).
// ROW-200 given (the hour, rolling): from X one wrong try at t = 0; the clock moved 3590 s; 9 wrong tries (10 within
//   the hour); the clock moved 11 s more (t = 3601: the first try has left the hour, 9 remain in it); one wrong try
//   (the 10th within the hour 3590..3601); when: X asks for E's code and enters 5 wrong codes on it; then: E's code
//   still signs in from Z. A window that reset at t = 3600 checks those 5 and stops E's code.
// ROW-200 given (the answer): X past its 10th try; E's code asked for elsewhere; when: X enters a wrong code on E's step
//   and then E's right code; then: the two answers are the same status and the same page (hidden values and nonces set
//   aside) and neither signs in — an answer that depends on the code is the trace of a check.
// ROW-200 controls: without the 10 earlier tries, 5 wrong from the requesting address do stop the code (ROW-006); E's
//   code from Z signs in (ROW-209's control).
// ROW-200 technique: what "checked" leaves behind — a count against the code, made visible by the code's life, and an
//   answer that would differ by the code — at the limit, and across the hour's edge with the clock door. A product
//   that compares the 11th try and throws the result away, leaving no count and no different answer, is beyond any
//   outside test (only timing would show it); that remainder is the grader's.
// cases: ROW-200 target=ROW-200 tries past the 10th from one address are not checked against a code control=ROW-209 control the code refused at the limited address signs in from another address
//
// The test argument (ROW-209)
// ROW-209 promise: this never happens: after 10 wrong tries within an hour from one network address, a further try from
//   that address signs someone in, even with a working code — network address means the edge-reported client address,
//   IPv6 counted per /64. Authority: REQ-037 fail-if (3), A-058.
// ROW-209 wrong product: the limit refuses only wrong codes (a right code still passes); the limit counted per email, so
//   a working code for a new email signs in; a fixed hourly window that resets whole an hour after its first use, so
//   wrong tries made just before the reset no longer count a few seconds later.
// ROW-209 given: X (an IPv4, or hosts ::1 to ::a of one /64) has made 10 wrong tries on 10 emails; E's code was asked
//   for at another address; when: X (or host ::ff of the /64) enters E's right code; then: not signed in.
// ROW-209 given (the hour, rolling), two ways a fixed window opens: (a) one wrong try from X at t = 0, the clock moved
//   3540 s, 9 wrong tries, the clock moved 61 s (t = 3601, 9 wrong tries in the last hour), one more wrong try (10 in
//   the last hour); (b) X signs in with its own code at t = 0, the clock moved 3540 s, 10 wrong tries, the clock moved
//   61 s (t = 3601, 10 wrong tries in the last hour); when: X enters E's right code; then: not signed in.
// ROW-209 controls: the same code then entered from a fresh address Z signs in (A-058: it still works elsewhere).
// ROW-209 technique: the limit's boundary at the 11th try, with the right code as the try; the hour's edge moved with
//   the clock door.
// cases: ROW-209 target=ROW-209 after 10 wrong tries from one address a working code from it does not sign in control=ROW-209 control the code refused at the limited address signs in from another address
//
// The test argument (ROW-201)
// ROW-201 promise: this never happens: the wrong-try refusal differs between emails with and without an account.
//   Authority: REQ-037 fail-if (2).
// ROW-201 wrong product: "wrong code" for an email that has an account and "no such account" (or another status, or a
//   different page) for one that has none; the same at the hourly limit.
// ROW-201 given: E1 has an account (signed in once), E2 has none (code asked for, never entered); both have a live code
//   asked for at other addresses; when: from one address X a wrong code on E1, then on E2 (tries 9 and 10, after 8 on
//   other emails), then once more on each (tries 11 and 12, at the limit); then: each pair of responses has the same
//   status and the same page, the emails themselves and hidden-field values set aside.
//   A second case: at the limit, each email's working code is entered from X; the two refusals are the same.
// ROW-201 controls: the account-holder E1's sign-in succeeded (a setup error otherwise).
// ROW-201 technique: a relation between two runs — the same try for the two kinds of email gives the same answer.
// cases: ROW-201 target=ROW-201 the wrong-try refusal is the same for emails with and without an account control=ROW-209 control the code refused at the limited address signs in from another address

import { test, expect } from 'vitest';
import {
  Client, codeFlow, enterCode, signedIn, freshMail, freshV6Net, v6Host, wrongCode, advanceClock, PAST_RESEND_SECONDS,
  SetupError, type Page,
} from './signin';

type CF = Awaited<ReturnType<typeof codeFlow>>;

/** <n> wrong tries, one on each of <n> fresh emails, from the addresses <from(i)>. */
async function wrongTriesElsewhere(n: number, from: (i: number) => string, tag: string) {
  const flows = await Promise.all(Array.from({ length: n }, () => codeFlow(freshMail(tag))));
  for (let i = 0; i < n; i++) await enterCode(flows[i], wrongCode(flows[i].code), flows[i].client.clone(from(i)));
}

async function tryFrom(flow: CF, code: string, address: string): Promise<boolean> {
  const c = flow.client.clone(address);
  await enterCode(flow, code, c);
  return signedIn(c);
}

test('ROW-208 control the wrong tries from the other address are refused', async () => {
  const flow = await codeFlow(freshMail('row208'));
  const b = new Client().address;
  for (let i = 0; i < 5; i++) expect(await tryFrom(flow, wrongCode(flow.code), b), 'ROW-208: a wrong code from the other address signed in').toBe(false);
});

test('ROW-208 wrong tries from another address leave the code working', async () => {
  const flow = await codeFlow(freshMail('row208'));
  const b = new Client().address;
  for (let i = 0; i < 5; i++) await tryFrom(flow, wrongCode(flow.code), b);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-208: 5 wrong tries from another address stopped the code asked for at the requesting address').toBe(true);
});

test('ROW-208 wrong tries from another IPv6 /64 leave the code working', async () => {
  const flow = await codeFlow(freshMail('row208v6'), new Client(v6Host(freshV6Net(), 1)));
  const other = freshV6Net();
  for (let i = 0; i < 5; i++) await tryFrom(flow, wrongCode(flow.code), v6Host(other, i + 1));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-208: 5 wrong tries from another IPv6 /64 stopped the code').toBe(true);
});

test('HOS-030 5 wrong codes from another address leave the victim\'s code working', async () => {
  const flow = await codeFlow(freshMail('hos030'));
  const b = new Client().address;
  for (let i = 0; i < 5; i++) await tryFrom(flow, wrongCode(flow.code), b);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'vid-forbidden-effect: HOS-030\nHOS-030: 5 wrong codes from another address stopped the victim\'s code').toBe(true);
});

async function row200(x: (i: number) => string, xRequest: string) {
  await wrongTriesElsewhere(10, x, 'row200w');
  const e = await codeFlow(freshMail('row200'), new Client(xRequest));
  for (let i = 0; i < 5; i++) await enterCode(e, wrongCode(e.code), e.client.clone(x(10 + i)));
  return tryFrom(e, e.code, new Client().address);
}

test('ROW-200 tries past the 10th from one address are not checked against a code', async () => {
  const x = new Client().address;
  expect(await row200(() => x, x), 'ROW-200: tries 11 to 15 from one address were checked against the code it asked for — the code stopped working').toBe(true);
});

test('ROW-200 tries past the 10th from one IPv6 /64 are not checked against a code', async () => {
  const net = freshV6Net();
  expect(await row200((i) => v6Host(net, i + 1), v6Host(net, 0x100)), 'ROW-200: tries 11 to 15 from one IPv6 /64 were checked against the code it asked for').toBe(true);
});

test('ROW-209 control the code refused at the limited address signs in from another address', async () => {
  const x = new Client().address;
  await wrongTriesElsewhere(10, () => x, 'row209w');
  const e = await codeFlow(freshMail('row209'));
  await tryFrom(e, e.code, x);
  expect(await tryFrom(e, e.code, new Client().address), 'ROW-209: the working code does not sign in from a fresh address').toBe(true);
});

test('ROW-209 after 10 wrong tries from one address a working code from it does not sign in', async () => {
  const x = new Client().address;
  await wrongTriesElsewhere(10, () => x, 'row209w');
  const e = await codeFlow(freshMail('row209'));
  expect(await tryFrom(e, e.code, x), 'ROW-209: after 10 wrong tries from one address, a working code from that address signed in').toBe(false);
});

test('ROW-209 after 10 wrong tries from one IPv6 /64 a working code from it does not sign in', async () => {
  const net = freshV6Net();
  await wrongTriesElsewhere(10, (i) => v6Host(net, i + 1), 'row209w');
  const e = await codeFlow(freshMail('row209'));
  expect(await tryFrom(e, e.code, v6Host(net, 0xff)), 'ROW-209: after 10 wrong tries from hosts of one IPv6 /64, a working code from another host of it signed in').toBe(false);
});

/** The page with the two emails and every hidden field's value set aside, whitespace collapsed. */
function shape(p: Page, emails: string[]): string {
  let h = p.html;
  for (const e of emails) h = h.split(e).join('<EMAIL>').split(encodeURIComponent(e)).join('<EMAIL>');
  h = h.replace(/(<input\b[^>]*type=["']?hidden["']?[^>]*\bvalue=)("[^"]*"|'[^']*'|[^\s>]+)/gi, '$1""');
  h = h.replace(/(<input\b[^>]*\bvalue=)("[^"]*"|'[^']*'|[^\s>]+)([^>]*type=["']?hidden)/gi, '$1""$3');
  h = h.replace(/(\bnonce=)("[^"]*"|'[^']*'|[^\s>]+)/gi, '$1""');
  return h.replace(/\s+/g, ' ').trim();
}

test('ROW-201 the wrong-try refusal is the same for emails with and without an account', async () => {
  // E1 gets an account; then, 61 s later, a second live code from another address so a code-entry step exists.
  const e1 = freshMail('row201a');
  const first = await codeFlow(e1);
  await enterCode(first, first.code);
  if (!(await signedIn(first.client))) throw new SetupError(`${e1} could not sign in (ROW-180), so it has no account to compare`);
  await advanceClock(PAST_RESEND_SECONDS);
  const withAccount = await codeFlow(e1);
  const without = await codeFlow(freshMail('row201b'));
  const emails = [withAccount.email, without.email];

  const x = new Client().address;
  await wrongTriesElsewhere(8, () => x, 'row201w');
  const under = [
    await enterCode(withAccount, wrongCode(withAccount.code), withAccount.client.clone(x)),
    await enterCode(without, wrongCode(without.code), without.client.clone(x)),
  ];
  expect(under[0].status, 'ROW-201: a wrong try answers with another status for an email with an account than for one without').toBe(under[1].status);
  expect(shape(under[0], emails), 'ROW-201: a wrong try shows another page for an email with an account than for one without').toBe(shape(under[1], emails));

  const atLimit = [
    await enterCode(withAccount, wrongCode(withAccount.code), withAccount.client.clone(x)),
    await enterCode(without, wrongCode(without.code), without.client.clone(x)),
  ];
  expect(atLimit[0].status, 'ROW-201: at the hourly limit the refusal has another status for an email with an account than for one without').toBe(atLimit[1].status);
  expect(shape(atLimit[0], emails), 'ROW-201: at the hourly limit the refusal shows another page for an email with an account than for one without').toBe(shape(atLimit[1], emails));
});

/** One wrong try from <address> on each of <n> fresh emails whose codes were asked for elsewhere (counted against no code). */
const wrongTries = (n: number, address: string, tag: string) => wrongTriesElsewhere(n, () => address, tag);

test('ROW-200 tries past the 10th within an hour are not checked when the hour crosses a fixed window\'s end', async () => {
  const x = new Client().address;
  await wrongTries(1, x, 'row200r'); // t = 0
  await advanceClock(3590);
  await wrongTries(9, x, 'row200r'); // t = 3590: 10 wrong tries within the hour
  await advanceClock(11); // t = 3601: the first try has left the hour; 9 remain in it
  await wrongTries(1, x, 'row200r'); // the 10th within the hour 3590..3601
  const e = await codeFlow(freshMail('row200r'), new Client(x));
  for (let i = 0; i < 5; i++) await enterCode(e, wrongCode(e.code), e.client.clone(x));
  expect(
    await tryFrom(e, e.code, new Client().address),
    'ROW-200: 10 wrong tries from one address 11 s before and 6 more after the end of an hour counted from its first try — tries 11 to 16 within an hour were checked against the code it asked for (the code stopped working)',
  ).toBe(true);
});

test('ROW-200 past the 10th try the answer is the same for the right code and a wrong one', async () => {
  const x = new Client().address;
  await wrongTries(10, x, 'row200a');
  const e = await codeFlow(freshMail('row200a'));
  const w = e.client.clone(x);
  const wrong = wrongCode(e.code);
  const wrongPage = await enterCode(e, wrong, w);
  const r = e.client.clone(x);
  const rightPage = await enterCode(e, e.code, r);
  expect(await signedIn(r), 'ROW-200: past its 10th wrong try, the address signed in with the right code — the try was checked').toBe(false);
  expect(rightPage.status, 'ROW-200: past the 10th try, the right code answers with another status than a wrong code — the try was checked').toBe(wrongPage.status);
  // the typed values themselves (an echo in the code box) are set aside with the email
  expect(shape(rightPage, [e.email, e.code, wrong]), 'ROW-200: past the 10th try, the right code shows another page than a wrong code — the try was checked').toBe(shape(wrongPage, [e.email, e.code, wrong]));
});

test('ROW-209 a working code from the address does not sign in when its 10 wrong tries in the hour cross a fixed window\'s end', async () => {
  const x = new Client().address;
  await wrongTries(1, x, 'row209r'); // t = 0
  await advanceClock(3540);
  await wrongTries(9, x, 'row209r'); // t = 3540
  await advanceClock(61); // t = 3601: 9 wrong tries in the last hour
  await wrongTries(1, x, 'row209r'); // 10 wrong tries in the last hour
  const e = await codeFlow(freshMail('row209r'));
  expect(await tryFrom(e, e.code, x), 'ROW-209: 10 wrong tries from one address within the last hour, across the end of an hour counted from its first try, and a working code from that address signed in').toBe(false);
});

test('ROW-209 a working code from the address does not sign in when a right code opened its hour', async () => {
  const x = new Client().address;
  const own = await codeFlow(freshMail('row209o'), new Client(x));
  await enterCode(own, own.code);
  if (!(await signedIn(own.client))) throw new SetupError('the address\'s own sign-in did not succeed (ROW-180)');
  await advanceClock(3540);
  await wrongTries(10, x, 'row209o'); // t = 3540
  await advanceClock(61); // t = 3601: 10 wrong tries in the last hour
  const e = await codeFlow(freshMail('row209o'));
  expect(await tryFrom(e, e.code, x), 'ROW-209: 10 wrong tries from one address within the last hour, in an hour opened by a right code, and a working code from that address signed in').toBe(false);
});

test('ROW-201 at the hourly limit a working code is refused alike for emails with and without an account', async () => {
  const e1 = freshMail('row201c');
  const first = await codeFlow(e1);
  await enterCode(first, first.code);
  if (!(await signedIn(first.client))) throw new SetupError(`${e1} could not sign in (ROW-180), so it has no account to compare`);
  await advanceClock(PAST_RESEND_SECONDS);
  const withAccount = await codeFlow(e1);
  const without = await codeFlow(freshMail('row201d'));
  const emails = [withAccount.email, without.email, withAccount.code, without.code];
  const x = new Client().address;
  await wrongTries(10, x, 'row201c');
  const a = withAccount.client.clone(x);
  const b = without.client.clone(x);
  const pages = [await enterCode(withAccount, withAccount.code, a), await enterCode(without, without.code, b)];
  if (await signedIn(a) || await signedIn(b)) throw new SetupError('a working code signed in from an address at its limit: ROW-209\'s, not this row\'s');
  expect(pages[0].status, 'ROW-201: at the hourly limit a working code is refused with another status for an email with an account than for one without').toBe(pages[1].status);
  expect(shape(pages[0], emails), 'ROW-201: at the hourly limit a working code is refused with another page for an email with an account than for one without').toBe(shape(pages[1], emails));
});
