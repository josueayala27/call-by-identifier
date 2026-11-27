// Purpose: the sign-in use cases: ask for a code, enter a code, and read who a session belongs to.

import { networkAddress } from './address';
import { deriveKeys, newCode, newSessionToken, sameHash, sha256Hex } from './crypto';
import { normaliseEmail } from './email';
import type { IdentityDeps } from './ports';

/** REQ-002: a code works for 10 minutes after it was sent. */
export const CODE_LIFETIME_MS = 10 * 60 * 1000;
/** REQ-037: one network address gets at most 10 wrong code tries an hour. */
export const WRONG_TRIES_PER_ADDRESS = 10;
export const WRONG_TRY_WINDOW_MS = 60 * 60 * 1000;
/** REQ-003, D-010: a session lasts 30 days from sign-in, never extended. */
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

const SENDER_PURPOSE = 'code-requester';
const WRONG_TRY_PURPOSE = 'wrong-tries';

export type RequestCodeResult =
  | { kind: 'sent'; email: string }
  | { kind: 'invalid-email' }
  | { kind: 'not-sent'; email: string };

/**
 * REQ-001: sends a sign-in code to the typed email. REQ-002: the code is 6 digits and works 10 minutes; once its email
 * is sent, every earlier code of that email requested from the same network address stops working — a failed send
 * stops nothing (A-049, A-054). ROW-146: no account is made here.
 * Throws when the server secret is missing or short (RULE-013) or storage fails; nothing is then promised.
 */
export async function requestCode(deps: IdentityDeps, input: { email: string; clientAddress: string | null }): Promise<RequestCodeResult> {
  const email = normaliseEmail(input.email);
  if (!email) return { kind: 'invalid-email' };
  const keys = await deriveKeys(deps.secrets.signingSecret());
  const code = newCode(deps.random);
  const codeHash = await keys.codeHash(email, code);
  const requester = await keys.addressHash(SENDER_PURPOSE, networkAddress(input.clientAddress));
  try {
    await deps.mailer.send({
      to: email,
      subject: 'Your sign-in code',
      text: `Your sign-in code is ${code}.\n\nIt works for 10 minutes, and only once. If you did not ask for it, you can ignore this email.\n`,
    });
  } catch {
    return { kind: 'not-sent', email };
  }
  const now = deps.clock.now();
  await deps.codes.addSent({ email, codeHash, requester, createdAt: now, expiresAt: now + CODE_LIFETIME_MS });
  return { kind: 'sent', email };
}

export type VerifyCodeResult =
  | { kind: 'signed-in'; email: string; sessionToken: string; expiresAt: number }
  | { kind: 'malformed' }
  | { kind: 'wrong' }
  | { kind: 'address-limited' };

/**
 * REQ-001, REQ-002, REQ-037: checks a typed code against each live code of the email.
 * - ROW-162: the code is trimmed; anything but 6 digits is refused without using a try.
 * - ROW-200, ROW-209: past 10 wrong tries an hour from one network address, a try is refused unchecked, right or wrong.
 * - ROW-006, ROW-208, A-055: a wrong try counts only against the codes requested from the address that typed it; at 5
 *   a code stops working.
 * - ROW-005, ROW-117: a right code is used atomically, once; the first sign-in makes the account (REQ-001 fail-if (3)).
 * Any storage error throws before a session exists, so it signs nobody in (ROW-126).
 */
export async function verifyCode(
  deps: IdentityDeps,
  input: { email: string; code: string; clientAddress: string | null },
): Promise<VerifyCodeResult> {
  const email = normaliseEmail(input.email);
  const code = input.code.trim();
  if (!email || !/^[0-9]{6}$/.test(code)) return { kind: 'malformed' };
  const keys = await deriveKeys(deps.secrets.signingSecret());
  const address = networkAddress(input.clientAddress);
  const requester = await keys.addressHash(SENDER_PURPOSE, address);
  const tryKey = await keys.addressHash(WRONG_TRY_PURPOSE, address);

  // The address's slot is taken before any code is looked at, so no try past the 10th is ever checked (ROW-200).
  const now = deps.clock.now();
  if (!(await deps.throttle.take(tryKey, WRONG_TRIES_PER_ADDRESS, WRONG_TRY_WINDOW_MS, now))) return { kind: 'address-limited' };

  const typed = await keys.codeHash(email, code);
  const live = await deps.codes.live(email, now);
  const match = live.find((c) => sameHash(c.codeHash, typed));
  if (!match) {
    await deps.codes.countWrongTry(email, requester, now);
    return { kind: 'wrong' };
  }
  // A right code is no wrong try: its slot is given back.
  await deps.throttle.giveBack(tryKey, now);
  if (!(await deps.codes.consume(match.id, now))) return { kind: 'wrong' };

  await deps.accounts.ensure(email, now);
  const sessionToken = newSessionToken(deps.random);
  const expiresAt = now + SESSION_LIFETIME_MS;
  await deps.sessions.create({ tokenHash: await sha256Hex(sessionToken), email, createdAt: now, expiresAt });
  return { kind: 'signed-in', email, sessionToken, expiresAt };
}

/** The email a session token belongs to while the session runs (REQ-003: 30 days, never extended), or null. */
export async function resolveSession(deps: Pick<IdentityDeps, 'sessions' | 'clock'>, token: string | undefined): Promise<string | null> {
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return deps.sessions.find(await sha256Hex(token), deps.clock.now());
}
