// Purpose: ledger tests for which newer code cancels an earlier one: ROW-007, ROW-196, HOS-007 and HOS-029.
//
// Every second request for the same email first moves the product's clock 61 s (POST /__test/clock), so the
// 60-second rule of REQ-023 (a later row) never stands between the two requests. A failed send is made through the
// test-switch door POST /__test/mail/fail?to=<email> (requested). "Same network address" for IPv6 is the same /64 (D-027).
//
// The test argument (ROW-007)
// ROW-007 promise: this never happens: an earlier code still signs someone in after a newer one was sent for the same
//   email at the request of the same network address — network address means the edge-reported client address, IPv6
//   counted per /64. Authority: REQ-002 fail-if (4), A-015 AMENDED, A-049, D-027.
// ROW-007 wrong product: every code kept live until it expires; or cancelling keyed on the browser cookie, or on the
//   whole IPv6 address, so a second host of the same /64 (or a second browser at one address) leaves the first code live.
// ROW-007 given: a fresh email; when: browser 1 at address A asks for code 1, the clock moves 61 s, browser 2 at A asks
//   for code 2 (sent), then code 1 is entered on browser 1; then: not signed in. The IPv6 case: browser 1 at
//   <net>::1, browser 2 at <net>::2 of the same /64.
// ROW-007 controls: code 2 then signs in on browser 2 — the newer code was sent and works.
// ROW-007 technique: the newer code is the near miss of the earlier one; the /64 is the boundary of "same address".
// cases: ROW-007 target=ROW-007 a newer code sent at the same address stops the earlier code control=ROW-007 control the newer code signs in
//
// The test argument (ROW-196)
// ROW-196 promise: this never happens: a request from another network address, or a request whose email failed to send,
//   makes an earlier working code stop working — network address means the edge-reported client address, IPv6 counted
//   per /64. Authority: REQ-002 fail-if (6), A-049, A-054, D-027.
// ROW-196 wrong product: a new request for an email cancels every earlier code whoever asked (anyone can lock a person
//   out by asking for codes for their email); or earlier codes are cancelled before the send is known to succeed.
// ROW-196 given: a fresh email whose code was asked for at address A; when: (1) after 61 s a request for the same email
//   comes from address B (or another IPv6 /64) and is sent; (2) after 61 s the mailer is made to fail for the email and
//   A asks again; then: the earlier code, entered on A's browser, signs in.
// ROW-196 controls: in (1) B's code also arrived (the request reached a send); in (2) no newer code was recorded (the
//   send failed).
// ROW-196 technique: the neighbouring address, and the failed send, as the two causes that must not cancel.
// cases: ROW-196 target=ROW-196 a request from another address does not stop an earlier working code control=ROW-196 control the other address's own code also arrived
//
// The test argument (HOS-007) — a protection row (protects REQ-002; disable: remove the kill of earlier codes on a new request)
// HOS-007 promise: from one network address request a code, request a second that is sent, submit the first, expect no session.
// HOS-007 wrong product: earlier codes never killed on a new request.
// HOS-007 given/when/then: as ROW-007's IPv4 case; the failure message carries vid-forbidden-effect: HOS-007 only when
//   the first code gives a session.
// HOS-007 controls: ROW-007's control.
// cases: HOS-007 target=HOS-007 the first code after a second sent request from one address gives no session control=ROW-007 control the newer code signs in
//
// The test argument (HOS-029) — a protection row (protects REQ-002; disable: remove the same-address and sent-only condition on cancelling codes)
// HOS-029 promise: from a second network address request a code for the victim's email, then submit the victim's earlier
//   code, expect it still signs in; and with the mailer failing, request again from the victim's address and expect the
//   earlier code still works.
// HOS-029 wrong product: cancelling with neither condition — any request, from anywhere, sent or not, kills the code.
// HOS-029 given/when/then: as ROW-196's two causes; the failure message carries vid-forbidden-effect: HOS-029 only when
//   the victim's earlier code no longer signs in.
// HOS-029 controls: ROW-196's control.
// cases: HOS-029 target=HOS-029 another address's request and a failed send leave the victim's earlier code working control=ROW-196 control the other address's own code also arrived

import { test, expect } from 'vitest';
import {
  Client, codeFlow, requestCode, enterCode, signedIn, freshMail, freshV6Net, v6Host, mailFor, advanceClock,
  failNextMail, PAST_RESEND_SECONDS, SetupError,
} from './signin';

/** Code 1 at <a1>, then 61 s later code 2 at <a2>, for one email. */
async function twoCodes(a1: string, a2: string, tag: string) {
  const email = freshMail(tag);
  const first = await codeFlow(email, new Client(a1));
  await advanceClock(PAST_RESEND_SECONDS);
  const second = await codeFlow(email, new Client(a2));
  return { email, first, second };
}

test('ROW-007 control the newer code signs in', async () => {
  const a = new Client().address;
  const { second } = await twoCodes(a, a, 'row007');
  await enterCode(second, second.code);
  expect(await signedIn(second.client), 'ROW-007: the newer code, sent at the same address, does not sign in').toBe(true);
});

test('ROW-007 a newer code sent at the same address stops the earlier code', async () => {
  const a = new Client().address;
  const { first } = await twoCodes(a, a, 'row007');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'ROW-007: the earlier code still signed in after a newer one was sent at the same address').toBe(false);
});

test('ROW-007 a newer code sent from the same IPv6 /64 stops the earlier code', async () => {
  const net = freshV6Net();
  const { first } = await twoCodes(v6Host(net, 1), v6Host(net, 2), 'row007v6');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'ROW-007: the earlier code still signed in after a newer one was sent from another host of the same IPv6 /64').toBe(false);
});

test('HOS-007 the first code after a second sent request from one address gives no session', async () => {
  const a = new Client().address;
  const { first } = await twoCodes(a, a, 'hos007');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'vid-forbidden-effect: HOS-007\nHOS-007: the first code gave a session after a second code was sent at the same address').toBe(false);
});

test('ROW-196 control the other address\'s own code also arrived', async () => {
  const { email, second } = await twoCodes(new Client().address, new Client().address, 'row196');
  expect((await mailFor(email)).length, 'ROW-196: the request from the second address sent no code email').toBe(2);
  await enterCode(second, second.code);
  expect(await signedIn(second.client), 'ROW-196: the second address\'s own code does not sign in').toBe(true);
});

test('ROW-196 a request from another address does not stop an earlier working code', async () => {
  const { first } = await twoCodes(new Client().address, new Client().address, 'row196');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'ROW-196: a code request from another address stopped the earlier working code').toBe(true);
});

test('ROW-196 a request from another IPv6 /64 does not stop an earlier working code', async () => {
  const { first } = await twoCodes(v6Host(freshV6Net(), 1), v6Host(freshV6Net(), 1), 'row196v6');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'ROW-196: a code request from another IPv6 /64 stopped the earlier working code').toBe(true);
});

/** Code 1 at A; 61 s later the mailer fails for the email and A asks again. Returns the first flow. */
async function failedResend(tag: string) {
  const a = new Client().address;
  const email = freshMail(tag);
  const first = await codeFlow(email, new Client(a));
  await advanceClock(PAST_RESEND_SECONDS);
  await failNextMail(email);
  await requestCode(email, new Client(a));
  const msgs = await mailFor(email);
  if (msgs.length !== 1) throw new SetupError(`the failing mailer still recorded a code email for ${email} (${msgs.length} recorded)`);
  return first;
}

test('ROW-196 a request whose email failed to send does not stop an earlier working code', async () => {
  const first = await failedResend('row196f');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'ROW-196: a code request whose email failed to send stopped the earlier working code').toBe(true);
});

test('HOS-029 another address\'s request and a failed send leave the victim\'s earlier code working', async () => {
  const victim = await twoCodes(new Client().address, new Client().address, 'hos029');
  await enterCode(victim.first, victim.first.code);
  expect(await signedIn(victim.first.client), 'vid-forbidden-effect: HOS-029\nHOS-029: a code request from a second address stopped the victim\'s earlier code').toBe(true);

  const first = await failedResend('hos029f');
  await enterCode(first, first.code);
  expect(await signedIn(first.client), 'vid-forbidden-effect: HOS-029\nHOS-029: a failed send from the victim\'s address stopped the victim\'s earlier code').toBe(true);
});

