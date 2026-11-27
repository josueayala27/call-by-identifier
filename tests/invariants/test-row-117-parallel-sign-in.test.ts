// Purpose: ROW-117's ledger tests — sign-in holds under parallel requests: wrong guesses, one code twice, first sign-ins, code requests.
//
// The account count is read through the test-switch door GET /__test/account?email= (a measuring tool; asked).
//
// The test argument (ROW-117)
// ROW-117 promise: this must always hold: parallel wrong guesses against one code evaluate at most 5; one code entered
//   twice at once yields one session; parallel first sign-ins make one account; parallel code requests from one
//   network address leave one working code. Authority: REQ-002 (5 tries, once, the newer sent code cancels), REQ-001
//   AMENDED fail-if (3) (the first sign-in makes the account), D-012 (UNIQUE email).
// ROW-117 wrong product: read-then-write updates — the try count loses increments under 50 parallel guesses; "used" set
//   after the session is made, so two simultaneous entries both sign in; "find account, else insert" racing into two
//   accounts or a failed sign-in on the UNIQUE index; each of 5 parallel requests cancelling only the codes it saw,
//   leaving several live.
// ROW-117 given/when/then, one case per clause:
//   (1) 50 wrong guesses at once from the requesting address; then the right code from a fresh address does not sign
//       in (a count below 5 would leave it working);
//   (2) one code entered at once by two copies of the browser; exactly one is signed in;
//   (3) one fresh email, two live codes asked from two addresses (61 s apart, past REQ-023's minute), both entered at
//       once; both sign in and the email has exactly 1 account;
//   (4) 5 requests at once for one email from one address; every code recorded is tried at once, each from its own
//       fresh address; exactly one signs in.
// ROW-117 controls: ROW-180 (one code once signs in); in (3) and (4) at least one sign-in succeeds.
// ROW-117 technique: the race itself, with Promise.all on the real HTTP path.
// cases: ROW-117 target=ROW-117 one code entered twice at once yields one session control=ROW-117 control one code entered once signs in

import { test, expect } from 'vitest';
import {
  Client, codeFlow, requestCode, enterCode, signedIn, freshMail, wrongCode, mailFor, codeIn, accountCount, advanceClock,
  PAST_RESEND_SECONDS, SetupError, type Flow,
} from './signin';

test('ROW-117 control one code entered once signs in', async () => {
  const flow = await codeFlow(freshMail('row117'));
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-117: one code entered once does not sign in').toBe(true);
});

test('ROW-117 parallel wrong guesses against one code evaluate at most 5', async () => {
  const flow = await codeFlow(freshMail('row117'));
  const guesses = new Set<string>();
  while (guesses.size < 50) guesses.add(wrongCode(flow.code));
  await Promise.all([...guesses].map((g) => enterCode(flow, g, flow.client.clone())));
  const elsewhere = flow.client.clone(new Client().address);
  await enterCode(flow, flow.code, elsewhere);
  expect(await signedIn(elsewhere), 'ROW-117: after 50 parallel wrong guesses the code still signs in — fewer than 5 were counted').toBe(false);
});

test('ROW-117 one code entered twice at once yields one session', async () => {
  const flow = await codeFlow(freshMail('row117'));
  const a = flow.client.clone();
  const b = flow.client.clone();
  await Promise.all([enterCode(flow, flow.code, a), enterCode(flow, flow.code, b)]);
  const signed = [await signedIn(a), await signedIn(b)].filter(Boolean).length;
  expect(signed, `ROW-117: one code entered twice at once gave ${signed} sessions`).toBe(1);
});

test('ROW-117 parallel first sign-ins make one account', async () => {
  const email = freshMail('row117');
  const one = await codeFlow(email);
  await advanceClock(PAST_RESEND_SECONDS);
  const two = await codeFlow(email);
  expect(await accountCount(email), 'ROW-117: the email has an account before any code was entered').toBe(0);
  await Promise.all([enterCode(one, one.code), enterCode(two, two.code)]);
  expect([await signedIn(one.client), await signedIn(two.client)], 'ROW-117: two first sign-ins at once with two live codes did not both sign in').toEqual([true, true]);
  expect(await accountCount(email), 'ROW-117: two first sign-ins at once did not make exactly one account').toBe(1);
});

test('ROW-117 parallel code requests from one network address leave one working code', async () => {
  const email = freshMail('row117');
  const address = new Client().address;
  const flows: Flow[] = await Promise.all(Array.from({ length: 5 }, () => requestCode(email, new Client(address))));
  const withForm = flows.find((f) => f.form);
  if (!withForm) throw new SetupError('none of the 5 parallel code requests showed the code-entry step');
  const codes = [...new Set((await mailFor(email)).map(codeIn).filter((c): c is string => !!c))];
  if (!codes.length) throw new SetupError(`no code email recorded for ${email}`);
  const tries = codes.map((c) => ({ c, client: withForm.client.clone(new Client().address) }));
  await Promise.all(tries.map((t) => enterCode(withForm, t.c, t.client)));
  let signed = 0;
  for (const t of tries) if (await signedIn(t.client)) signed++;
  expect(signed, `ROW-117: ${codes.length} codes were sent for 5 parallel requests from one address and ${signed} of them signed in`).toBe(1);
});
