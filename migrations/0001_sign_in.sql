-- Purpose: the sign-in tables: accounts, codes (hashed), sessions (hashed) and the per-address wrong-try counters.
-- D-004, D-012, D-025, D-009, D-010. Additive only (D-016); rolled back by dropping these four tables, which nothing else reads.

-- D-012: an email is stored lowercase, once.
CREATE TABLE accounts (
  email TEXT PRIMARY KEY NOT NULL CHECK (email = lower(email) AND length(email) BETWEEN 3 AND 254),
  created_at INTEGER NOT NULL
);

-- D-009, REQ-024: a code is held only as its HMAC; requester is the HMAC of the requesting network address (D-025).
-- Times are milliseconds since the epoch. A code signs in only while used_at IS NULL, superseded = 0, wrong_tries < 5
-- and the time is at most expires_at.
CREATE TABLE codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL CHECK (email = lower(email)),
  code_hash TEXT NOT NULL CHECK (length(code_hash) = 64),
  requester TEXT NOT NULL CHECK (length(requester) = 64),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at),
  wrong_tries INTEGER NOT NULL DEFAULT 0 CHECK (wrong_tries >= 0),
  superseded INTEGER NOT NULL DEFAULT 0 CHECK (superseded IN (0, 1)),
  used_at INTEGER
);
CREATE INDEX codes_by_email ON codes (email, requester);

-- D-010: a session is held only as the SHA-256 of its token, with a fixed end 30 days after sign-in.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY NOT NULL CHECK (length(token_hash) = 64),
  email TEXT NOT NULL CHECK (email = lower(email)),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at)
);

-- D-025: per-address counters, keyed by an HMAC of the address; a window lasts one hour from its first use.
CREATE TABLE request_counters (
  key TEXT PRIMARY KEY NOT NULL CHECK (length(key) = 64),
  count INTEGER NOT NULL CHECK (count >= 0),
  window_start INTEGER NOT NULL
);
