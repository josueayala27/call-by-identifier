// Purpose: ROW-002's ledger test — a working code entered in time signs the person in while their address is under its hourly wrong-try limit.
//
// The test argument (ROW-002)
// ROW-002 promise: this never happens: a working code entered in time does not sign the person in, while their network
//   address is under its hourly wrong-try limit. Authority: REQ-001 AMENDED fail-if (2), A-058 (the limit is 10 wrong
//   tries an hour per address, REQ-037).
// ROW-002 wrong product: a per-address limit that bites early (at 5, or at 9, or counting the code request itself as a
//   try); a refusal of any right code from an address that typed any wrong code before.
// ROW-002 given: address X has made 9 wrong tries, each on another fresh email (codes asked for at other addresses);
//   when: X asks for a code for a fresh email and enters it at once; then: X is signed in.
// ROW-002 given (in time): X has made 9 wrong tries; X asks for a code; when: the clock moves 599 s (in time, REQ-002's
//   10 minutes) and X enters it; then: X is signed in.
// ROW-002 given (the hour passes): X has made 10 wrong tries (at its limit); when: the clock moves 3660 s, so none of
//   them is within the last hour, and X asks for a code and enters it; then: X is signed in. Wrong product: a limit
//   that never lifts, or lifts only after a day.
// ROW-002 controls: a fresh address with no wrong tries signs in with its code (ROW-180's path) — the steps work.
// ROW-002 technique: the value just below the limit (9 of 10), the deadline's near side, and the hour's far side.
// cases: ROW-002 target=ROW-002 a working code entered in time signs in after 9 wrong tries from the address control=ROW-002 control a working code entered in time signs in from a fresh address

import { test, expect } from 'vitest';
import { Client, codeFlow, enterCode, signedIn, freshMail, wrongCode, advanceClock } from './signin';

test('ROW-002 control a working code entered in time signs in from a fresh address', async () => {
  const flow = await codeFlow(freshMail('row002'));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-002: a working code entered at once does not sign in').toBe(true);
});

test('ROW-002 a working code entered in time signs in after 9 wrong tries from the address', async () => {
  const x = new Client().address;
  const others = await Promise.all(Array.from({ length: 9 }, () => codeFlow(freshMail('row002w'))));
  for (const o of others) await enterCode(o, wrongCode(o.code), o.client.clone(x));
  const flow = await codeFlow(freshMail('row002'), new Client(x));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-002: after 9 wrong tries (under the limit of 10), a working code entered in time does not sign in').toBe(true);
});

test('ROW-002 a working code entered 599 seconds after sending signs in after 9 wrong tries from the address', async () => {
  const x = new Client().address;
  const others = await Promise.all(Array.from({ length: 9 }, () => codeFlow(freshMail('row002w'))));
  for (const o of others) await enterCode(o, wrongCode(o.code), o.client.clone(x));
  const flow = await codeFlow(freshMail('row002t'), new Client(x));
  await advanceClock(599);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-002: after 9 wrong tries (under the limit of 10), a working code entered 599 s after it was sent does not sign in').toBe(true);
});

test('ROW-002 a working code signs in once the address\'s wrong tries are more than an hour old', async () => {
  const x = new Client().address;
  const others = await Promise.all(Array.from({ length: 10 }, () => codeFlow(freshMail('row002h'))));
  for (const o of others) await enterCode(o, wrongCode(o.code), o.client.clone(x));
  await advanceClock(3660);
  const flow = await codeFlow(freshMail('row002h'), new Client(x));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-002: 10 wrong tries from the address, all more than an hour old, and its working code entered in time does not sign in — the hourly limit never lifted').toBe(true);
});
