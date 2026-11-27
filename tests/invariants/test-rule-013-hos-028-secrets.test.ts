// Purpose: ledger tests for secret reads: RULE-013 (every secret read refuses to run when the secret is missing or short) and HOS-028.
//
// The product is started by the harness once more for each secret the Worker reads, with that secret missing and with it
// short — PRODUCT_SECRET_VARIANTS, a JSON list [{"secret":"<NAME>","state":"missing"|"short","role":"code-hashing"|…,
// "url":"http://…"}], each with the test switch on (requested of the test manager). A case errors "setup:" without it.
//
// The test argument (RULE-013)
// RULE-013 promise: every secret read refuses to run when the secret is missing or short. Authority: REQ-024 (codes
//   stored only hashed), D-009 (HMAC-SHA-256 under a server secret), D-025 (counter keys under a server secret).
// RULE-013 wrong product: env.SECRET ?? '' — an HMAC under an empty or default key, so stored code hashes and counter
//   hashes are computable by anyone; a length check missing, so a 1-character key is accepted.
// RULE-013 given: one product per (secret, missing|short); when: a fresh email asks for a code there and, when a code was
//   emailed, enters it; then: nobody is signed in (refused at the request or at the entry, either counts).
// RULE-013 controls: the main product signs in with the same steps (ROW-180) — the steps reach the secret.
// RULE-013 technique: one generated case per secret read the harness starts; the test prints `covers: RULE-013 <n>`,
//   n the number of distinct secrets whose missing and short starts it refused on. Test value, asked: "short" is a
//   value of 8 characters (no spec number).
// cases: RULE-013 target=RULE-013 every secret read refuses to run when the secret is missing or short control=RULE-013 control the same sign-in steps sign in on the product with its secrets
//
// The test argument (HOS-028) — a protection row (protects RULE-013; disable: remove the secret presence check)
// HOS-028 promise: start the Worker with the code-hashing secret unset, request and enter a code, expect sign-in refused.
// HOS-028 wrong product: the presence check removed — the code hashed under an empty key and the sign-in succeeds.
// HOS-028 given/when/then: the variant with role code-hashing, state missing; the steps above; no session. The failure
//   message carries vid-forbidden-effect: HOS-028 only when a session is made.
// cases: HOS-028 target=HOS-028 with the code-hashing secret unset sign-in is refused control=RULE-013 control the same sign-in steps sign in on the product with its secrets

import { test, expect } from 'vitest';
import { Client, requestCode, enterCode, signedIn, freshMail, mailFor, codeIn, SetupError, freshClientAddress, productUrl } from './signin';

type Variant = { secret: string; state: 'missing' | 'short'; role?: string; url: string };

function variants(): Variant[] {
  const raw = (process.env.PRODUCT_SECRET_VARIANTS || '').trim();
  if (!raw) throw new SetupError('no product started with a secret missing or short in this run (PRODUCT_SECRET_VARIANTS unset)');
  try {
    const v = JSON.parse(raw) as Variant[];
    if (!Array.isArray(v)) throw new Error('not a list');
    return v;
  } catch (e) {
    throw new SetupError(`PRODUCT_SECRET_VARIANTS is not a JSON list: ${(e as Error).message}`);
  }
}

/** Asks for a code and enters it at <base>; true when a session results. */
async function signsIn(base: string): Promise<boolean> {
  const email = freshMail('rule013');
  const flow = await requestCode(email, new Client(freshClientAddress(), base));
  if (!flow.form) return false;
  const msgs = await mailFor(email, base).catch((e) => {
    if (String(e.message).startsWith('setup:') && /answered 5\d\d/.test(String(e.message))) return [];
    throw e;
  });
  const code = msgs.length ? codeIn(msgs[msgs.length - 1]) : undefined;
  if (!code) return false;
  await enterCode(flow, code);
  return signedIn(flow.client);
}

test('RULE-013 control the same sign-in steps sign in on the product with its secrets', async () => {
  expect(await signsIn(productUrl()), 'RULE-013: the sign-in steps do not sign in on the product with its secrets').toBe(true);
});

test('RULE-013 every secret read refuses to run when the secret is missing or short', async () => {
  const vs = variants();
  const refusedBoth = new Map<string, Set<string>>();
  const breaches: string[] = [];
  for (const v of vs) {
    if (!refusedBoth.has(v.secret)) refusedBoth.set(v.secret, new Set());
    if (await signsIn(v.url)) breaches.push(`${v.secret} ${v.state}`);
    else refusedBoth.get(v.secret)!.add(v.state);
  }
  const covered = [...refusedBoth.values()].filter((s) => s.has('missing') && s.has('short')).length;
  console.log(`covers: RULE-013 ${covered}`);
  expect(breaches, `RULE-013: with these secrets missing or short the product still signed someone in: ${breaches.join(', ')}`).toEqual([]);
  expect(covered, 'RULE-013: no secret read was covered with it both missing and short').toBeGreaterThan(0);
});

test('HOS-028 with the code-hashing secret unset sign-in is refused', async () => {
  const v = variants().find((x) => x.role === 'code-hashing' && x.state === 'missing');
  if (!v) throw new SetupError('no product started with the code-hashing secret unset (PRODUCT_SECRET_VARIANTS has no role code-hashing, state missing)');
  expect(await signsIn(v.url), 'vid-forbidden-effect: HOS-028\nHOS-028: with the code-hashing secret unset, a code was requested, entered and signed in').toBe(false);
});
