// Purpose: ledger tests for a code's 5 wrong tries: ROW-006, ROW-162, ROW-158 and HOS-006.
//
// Wrong codes are fresh 6-digit values that differ from every live code of the email. "From the requesting address"
// is the CF-Connecting-IP the code was requested with (D-027); a try from another address is a fresh address.
//
// The test argument (ROW-006)
// ROW-006 promise: this never happens: a code still signs someone in after 5 wrong tries against it from the network
//   address that requested it. Authority: REQ-002 fail-if (3), A-015 AMENDED, A-055.
// ROW-006 wrong product: no wrong-try count; a count that stops the code only at 6, or only for the address that tried
//   (the code keeps working from elsewhere); a count kept per browser cookie, so a fresh browser starts again.
// ROW-006 given: a fresh email whose code was requested from address A; when: 5 wrong codes are entered from A, then the
//   right code from A, and (a second case) from a fresh address B; then: neither signs in.
// ROW-006 controls: 4 wrong codes from A, then the right one from A, signs in — the boundary is 5, not 4.
// ROW-006 technique: values either side of the limit (4 and 5), and the code tried from outside the counting address.
// cases: ROW-006 target=ROW-006 after 5 wrong tries from the requesting address the right code does not sign in control=ROW-006 control after 4 wrong tries the right code still signs in
//
// The test argument (ROW-162)
// ROW-162 promise: this must always hold: the code box trims surrounding spaces, and input that is not 6 digits is
//   refused without using one of the 5 tries. Authority: REQ-002 (6 digits, 5 wrong tries).
// ROW-162 wrong product: a code compared untrimmed (" 123456 " refused); malformed input counted as a wrong try, so 5
//   typos kill a working code.
// ROW-162 given: a fresh email and code from address A; when: 7 inputs that are not 6 digits (5 and 7 digits, letters,
//   an inner space, a trailing letter, empty, full-width digits) are entered from A, then the right code surrounded
//   by spaces from A; then: the browser is signed in. A second case enters the right code with surrounding spaces at once.
// ROW-162 controls: the malformed inputs themselves do not sign in (asserted after each).
// ROW-162 technique: more malformed inputs than the try limit, so counting even one too many shows.
// cases: ROW-162 target=ROW-162 seven inputs that are not 6 digits use none of the 5 tries control=ROW-162 control a code surrounded by spaces signs in
//
// The test argument (ROW-158)
// ROW-158 promise: this must always hold: a code's wrong-try count survives a restart, eviction or second server
//   instance. Authority: REQ-002 fail-if (3), D-025 (counters in D1 so the limits survive restarts).
// ROW-158 wrong product: the wrong-try count kept in a module variable or the isolate's memory: a restart resets it to 0.
// ROW-158 given: a fresh email and code from address A; when: 3 wrong codes from A, the product restarted (harness
//   PRODUCT_RESTART_URL), 2 more wrong from A, then the right code from a fresh address; then: not signed in.
// ROW-158 controls: 3 wrong, a restart, 1 wrong, then the right code from A signs in — the code itself survives the
//   restart, so the refusal above is the count's. Eviction and a second instance are not reachable in this harness;
//   the restart is the one memory loss it can cause.
// ROW-158 technique: the count split across the memory loss.
// cases: ROW-158 target=ROW-158 the wrong-try count survives a restart of the product control=ROW-158 control a live code survives a restart of the product
//
// The test argument (HOS-006) — a protection row (protects REQ-002; disable: remove the wrong-try counter and its atomic update)
// HOS-006 promise: submit 5 wrong codes then the right one, expect no session; repeat with 50 wrong guesses in
//   parallel, expect at most 5 evaluated.
// HOS-006 wrong product: no counter; or a read-then-write counter, whose parallel updates are lost, so after 50
//   parallel guesses the stored count is below 5 and the code still works.
// HOS-006 given: a fresh email and code from address A; when: 5 wrong codes from A then the right code from A (case 1);
//   50 wrong codes from A all at once, then the right code from a fresh address B (case 2: A is past its hourly
//   limit of 10, so B is the address that can still reach the code); then: no session either time. More than 5
//   evaluated shows as a count that did not reach 5 under the race. The failure message carries
//   vid-forbidden-effect: HOS-006 only when a browser is signed in.
// HOS-006 controls: ROW-006's control (4 wrong then right signs in).
// HOS-006 technique: the attack, sequential and in parallel.
// cases: HOS-006 target=HOS-006 50 wrong guesses in parallel leave the code dead control=ROW-006 control after 4 wrong tries the right code still signs in

import { test, expect } from 'vitest';
import { Client, codeFlow, enterCode, signedIn, freshMail, wrongCode, restartProduct } from './signin';

async function wrongTries(flow: Awaited<ReturnType<typeof codeFlow>>, n: number, from: Client = flow.client) {
  for (let i = 0; i < n; i++) await enterCode(flow, wrongCode(flow.code), from);
}

test('ROW-006 control after 4 wrong tries the right code still signs in', async () => {
  const flow = await codeFlow(freshMail('row006'));
  await wrongTries(flow, 4);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-006: after 4 wrong tries from the requesting address the right code does not sign in').toBe(true);
});

test('ROW-006 after 5 wrong tries from the requesting address the right code does not sign in', async () => {
  const flow = await codeFlow(freshMail('row006'));
  await wrongTries(flow, 5);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-006: after 5 wrong tries from the requesting address the right code, from that address, signed in').toBe(false);
});

test('ROW-006 after 5 wrong tries from the requesting address the right code from elsewhere does not sign in', async () => {
  const flow = await codeFlow(freshMail('row006'));
  await wrongTries(flow, 5);
  const elsewhere = flow.client.clone(new Client().address);
  await enterCode(flow, flow.code, elsewhere);
  expect(await signedIn(elsewhere), 'ROW-006: after 5 wrong tries from the requesting address the right code, from another address, signed in').toBe(false);
});

test('ROW-162 control a code surrounded by spaces signs in', async () => {
  const flow = await codeFlow(freshMail('row162'));
  await enterCode(flow, `  ${flow.code}  `);
  expect(await signedIn(flow.client), 'ROW-162: the right code with surrounding spaces does not sign in (the code box does not trim)').toBe(true);
});

test('ROW-162 seven inputs that are not 6 digits use none of the 5 tries', async () => {
  const flow = await codeFlow(freshMail('row162'));
  const malformed = [flow.code.slice(0, 5), flow.code + '7', 'abcdef', `${flow.code.slice(0, 2)} ${flow.code.slice(2, 5)}`, flow.code.slice(0, 5) + 'a', '', '１２３４５６'];
  for (const m of malformed) {
    await enterCode(flow, m);
    expect(await signedIn(flow.client), `ROW-162: the input ${JSON.stringify(m)}, which is not 6 digits, signed in`).toBe(false);
  }
  await enterCode(flow, ` ${flow.code} `);
  expect(await signedIn(flow.client), `ROW-162: after ${malformed.length} inputs that are not 6 digits the right code no longer signs in — they used up its tries`).toBe(true);
});

test('ROW-158 control a live code survives a restart of the product', async () => {
  const flow = await codeFlow(freshMail('row158'));
  await wrongTries(flow, 3);
  await restartProduct();
  await wrongTries(flow, 1);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'ROW-158: a live code with 4 wrong tries, split across a restart, does not sign in').toBe(true);
});

test('ROW-158 the wrong-try count survives a restart of the product', async () => {
  const flow = await codeFlow(freshMail('row158'));
  await wrongTries(flow, 3);
  await restartProduct();
  await wrongTries(flow, 2);
  const elsewhere = flow.client.clone(new Client().address);
  await enterCode(flow, flow.code, elsewhere);
  expect(await signedIn(elsewhere), 'ROW-158: 3 wrong tries before a restart and 2 after did not stop the code — the count did not survive the restart').toBe(false);
});

test('HOS-006 5 wrong codes then the right one give no session', async () => {
  const flow = await codeFlow(freshMail('hos006'));
  await wrongTries(flow, 5);
  await enterCode(flow, flow.code);
  expect(await signedIn(flow.client), 'vid-forbidden-effect: HOS-006\nHOS-006: 5 wrong codes then the right one gave a session').toBe(false);
});

test('HOS-006 50 wrong guesses in parallel leave the code dead', async () => {
  const flow = await codeFlow(freshMail('hos006'));
  const guesses = new Set<string>();
  while (guesses.size < 50) guesses.add(wrongCode(flow.code));
  await Promise.all([...guesses].map((g) => enterCode(flow, g, flow.client.clone())));
  const elsewhere = flow.client.clone(new Client().address);
  await enterCode(flow, flow.code, elsewhere);
  expect(await signedIn(elsewhere), 'vid-forbidden-effect: HOS-006\nHOS-006: after 50 parallel wrong guesses from the requesting address the right code still gave a session — fewer than 5 were counted').toBe(false);
});
