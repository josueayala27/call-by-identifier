ticket: #5

Step ticket S2: a person signs in with the code emailed to them.

Decisions:
- One server secret, SIGNIN_SECRET (at least 32 characters), keys every stored hash; the code key and the address key are derived from it by HMAC-SHA-256 (RFC 2104) with a label each | why: D-009 and D-025 both need a key apart from the database; one Worker secret is one thing to set and rotate, and the labels keep the two hash families apart
- Codes are stored as HMAC-SHA-256 of "<email>\n<code>", drawn by rejection sampling over a uint32 from crypto.getRandomValues, compared in constant time; session tokens are 32 random bytes (hex), stored as SHA-256 | why: hand-rolled one-time codes and session tokens, implementing D-009 and D-010 (RFC 2104 HMAC, FIPS 180-4 SHA-256)
- New stored data: migration 0001 adds tables accounts, codes, sessions, request_counters (times in ms; email CHECK lowercase); rolled back by dropping the four tables, which nothing else reads | why: D-004, D-012, D-025
- A new code is stored only after its email is sent, and in the same D1 batch supersedes every lower-id live code of that email from the same requesting address | why: A-049 and A-054; lower id as "earlier" makes parallel requests leave exactly one live code (ROW-117)
- A wrong try takes a slot of the address's hourly counter before any code is looked at, and a right code gives its slot back | why: a try past the 10th must never be checked (ROW-200), even under parallel tries
- The email box is a text box (inputmode=email), not type=email | why: Chromium turns an IDN typed into an email box into punycode before sending, so only the server's ASCII rule can refuse it (ROW-204)
- The sign-in steps both post to / and are told apart by a hidden step field; the code-entry step carries the email in a hidden field and links back to / | why: no new route; D-029 already sends the email form to /
- The test switch's stand-ins (fake mailer record, clock offset, armed code-store fault) live in one module-scope object in src/worker, built only when VID_TEST=1 | why: DIF-001 keeps the fake in memory across requests; the deployed product never builds it
- wrangler.jsonc keeps a placeholder D1 database_id (all zeros); the real id is set by the deployer at the first hosted deploy | why: the ledger runs on local D1; the id is the host's
