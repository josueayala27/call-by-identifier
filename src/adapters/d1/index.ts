// Purpose: the #adapters/d1 surface: D1 implementations of the identity ports (codes, accounts, sessions, counters).

import type { AccountStore, CodeStore, LiveCode, RequestThrottle, SessionStore } from '#core/identity';

/** The code-store condition under which a code can still sign in (REQ-002): unused, not superseded, under 5 wrong tries, in time. */
const LIVE = 'used_at IS NULL AND superseded = 0 AND wrong_tries < 5 AND expires_at >= ?';

export function createD1Stores(db: D1Database): {
  codes: CodeStore;
  accounts: AccountStore;
  sessions: SessionStore;
  throttle: RequestThrottle;
} {
  const codes: CodeStore = {
    async addSent(c) {
      // One batch is one transaction: the new code goes in, then every earlier code of this email from this address is
      // superseded — "earlier" is every lower id, so parallel requests leave exactly the newest live (ROW-007, ROW-117).
      await db.batch([
        db
          .prepare('INSERT INTO codes (email, code_hash, requester, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
          .bind(c.email, c.codeHash, c.requester, c.createdAt, c.expiresAt),
        db
          .prepare(
            'UPDATE codes SET superseded = 1 WHERE email = ?1 AND requester = ?2 AND superseded = 0 AND id < (SELECT max(id) FROM codes WHERE email = ?1 AND requester = ?2)',
          )
          .bind(c.email, c.requester),
      ]);
    },
    async live(email, now) {
      const r = await db
        .prepare(`SELECT id, code_hash, requester FROM codes WHERE email = ? AND ${LIVE} ORDER BY id`)
        .bind(email, now)
        .all<{ id: number; code_hash: string; requester: string }>();
      return r.results.map((x): LiveCode => ({ id: x.id, codeHash: x.code_hash, requester: x.requester }));
    },
    async consume(id, now) {
      const r = await db.prepare(`UPDATE codes SET used_at = ? WHERE id = ? AND ${LIVE} RETURNING id`).bind(now, id, now).all();
      return r.results.length === 1;
    },
    async countWrongTry(email, requester, now) {
      // Atomic increment in the database: parallel wrong tries are never lost (HOS-006, ROW-117).
      await db
        .prepare(`UPDATE codes SET wrong_tries = wrong_tries + 1 WHERE email = ? AND requester = ? AND ${LIVE}`)
        .bind(email, requester, now)
        .run();
    },
  };

  const accounts: AccountStore = {
    async ensure(email, now) {
      // The primary key makes parallel first sign-ins one account (ROW-117).
      await db.prepare('INSERT INTO accounts (email, created_at) VALUES (?, ?) ON CONFLICT (email) DO NOTHING').bind(email, now).run();
    },
  };

  const sessions: SessionStore = {
    async create(s) {
      await db
        .prepare('INSERT INTO sessions (token_hash, email, created_at, expires_at) VALUES (?, ?, ?, ?)')
        .bind(s.tokenHash, s.email, s.createdAt, s.expiresAt)
        .run();
    },
    async find(tokenHash, now) {
      const r = await db
        .prepare('SELECT email FROM sessions WHERE token_hash = ? AND expires_at > ?')
        .bind(tokenHash, now)
        .first<{ email: string }>();
      return r?.email ?? null;
    },
  };

  const throttle: RequestThrottle = {
    async take(key, limit, windowMs, now) {
      // One statement: a new window starts when the old one has ended; otherwise a slot is taken only under the limit.
      const r = await db
        .prepare(
          `INSERT INTO request_counters (key, count, window_start) VALUES (?1, 1, ?2)
           ON CONFLICT (key) DO UPDATE SET
             count = CASE WHEN window_start <= ?2 - ?3 THEN 1 ELSE count + 1 END,
             window_start = CASE WHEN window_start <= ?2 - ?3 THEN ?2 ELSE window_start END
           WHERE window_start <= ?2 - ?3 OR count < ?4
           RETURNING count`,
        )
        .bind(key, now, windowMs, limit)
        .all();
      return r.results.length === 1;
    },
    async giveBack(key) {
      await db.prepare('UPDATE request_counters SET count = count - 1 WHERE key = ? AND count > 0').bind(key).run();
    },
  };

  return { codes, accounts, sessions, throttle };
}
