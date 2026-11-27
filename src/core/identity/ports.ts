// Purpose: the identity core's ports: what sign-in needs from storage, mail, time, randomness and the server secret.

/** Milliseconds since the epoch. The only source of "now" for every rule (RULE-007). */
export interface Clock {
  now(): number;
}

/** Fills the array with random bytes. The composition root binds it to the cryptographic source (ROW-124). */
export interface Random {
  fill(bytes: Uint8Array): void;
}

/** The server secret that keys every stored hash (D-009, D-025). Throws when the secret is missing or short (RULE-013). */
export interface SecretSource {
  signingSecret(): string;
}

/** One outgoing code email: one bare recipient, the normalised address (ROW-114). */
export type CodeMail = { to: string; subject: string; text: string };

/** Sends an email; rejects when the email was not sent. */
export interface Mailer {
  send(mail: CodeMail): Promise<void>;
}

/** A live code as the check reads it. */
export type LiveCode = { id: number; codeHash: string; requester: string };

/** Sign-in codes, stored only as keyed hashes (REQ-024, D-009). */
export interface CodeStore {
  /**
   * Stores a code whose email was sent, and in the same atomic step stops every earlier code of that email
   * requested from the same network address (REQ-002 fail-if (4), (6)).
   */
  addSent(c: { email: string; codeHash: string; requester: string; createdAt: number; expiresAt: number }): Promise<void>;
  /** The codes of an email still able to sign in at <now>: unused, not superseded, under 5 wrong tries, not expired. */
  live(email: string, now: number): Promise<LiveCode[]>;
  /** Marks the code used if it is still live; true only for the one caller that used it (ROW-005, ROW-117). */
  consume(id: number, now: number): Promise<boolean>;
  /** Counts one wrong try against every live code of the email requested from <requester> (A-055). */
  countWrongTry(email: string, requester: string, now: number): Promise<void>;
}

/** Accounts, made at the first sign-in (REQ-001 fail-if (3), ROW-146). */
export interface AccountStore {
  ensure(email: string, now: number): Promise<void>;
}

/** Sessions, stored only as the SHA-256 of their token (D-010). */
export interface SessionStore {
  create(s: { tokenHash: string; email: string; createdAt: number; expiresAt: number }): Promise<void>;
  /** The email of a session still running at <now>, or null. */
  find(tokenHash: string, now: number): Promise<string | null>;
}

/** Per-address counters kept in storage under keyed hashes (D-025). */
export interface RequestThrottle {
  /**
   * Takes one slot of the key's window atomically: true when the key had fewer than <limit> uses in its current
   * window (a window ends <windowMs> after its first use), false otherwise (nothing changes then).
   */
  take(key: string, limit: number, windowMs: number, now: number): Promise<boolean>;
  /** Gives back one slot taken by take(). */
  giveBack(key: string, now: number): Promise<void>;
}

export type IdentityDeps = {
  clock: Clock;
  random: Random;
  secrets: SecretSource;
  mailer: Mailer;
  codes: CodeStore;
  accounts: AccountStore;
  sessions: SessionStore;
  throttle: RequestThrottle;
};
