Ticket #5, part 1 of 1, writing 87fa717be9f9.

# Step ticket S2: A person signs in with the code emailed to them, and codes cannot be guessed, reused or taken over

## Header

- number: 5
- kind: step
- step: S2
- stage: 1
- plan: 97ca0dde8697
- base: 663a11e6f7ccdb68bc22392e397f920d5be45505
- export: f2c578aa0fa62b0dda999c62d92d54e6085c8d4e
- rows: ROW-001 ROW-002 ROW-004 ROW-005 ROW-006 ROW-007 ROW-008 ROW-096 ROW-114 ROW-117 ROW-118 ROW-124 ROW-126 ROW-142 ROW-146 ROW-158 ROW-162 ROW-179 ROW-180 ROW-196 ROW-200 ROW-201 ROW-204 ROW-207 ROW-208 ROW-209 ROW-212 RULE-013 DIF-001 SEAM-001 HOS-001 HOS-002 HOS-004 HOS-005 HOS-006 HOS-007 HOS-008 HOS-028 HOS-029 HOS-030

## The step

> step S2 | name: A person signs in with the code emailed to them, and codes cannot be guessed, reused or taken over | modules: src/core/identity, src/adapters/d1, src/adapters/mail, src/http | builds-on: S1 | rows: ROW-001 ROW-002 ROW-004 ROW-005 ROW-006 ROW-007 ROW-008 ROW-096 ROW-114 ROW-117 ROW-118 ROW-124 ROW-126 ROW-142 ROW-146 ROW-158 ROW-162 ROW-179 ROW-180 ROW-196 ROW-200 ROW-201 ROW-204 ROW-207 ROW-208 ROW-209 ROW-212 RULE-013 DIF-001 SEAM-001 HOS-001 HOS-002 HOS-004 HOS-005 HOS-006 HOS-007 HOS-008 HOS-028 HOS-029 HOS-030 | lane: devagent
> step S1 | name: The walking skeleton: the app deploys, a signed-out visitor sees the sign-in screen, and the test setup runs | modules: src/worker, src/http | builds-on: - | rows: ROW-093 | lane: devagent | kind: skeleton
> shared: src/worker
>
> | Module | Responsibility | Owned tables/data | Public surface | Dependents |
> |---|---|---|---|---|
> | src/core/identity | Sign-in rules: code issue and check (6 digits, 10 min, once, 5 wrong tries from the requesting address, a newer sent code cancels older codes of the same address only), request and wrong-try limits per network address (D-027), the daily total and its alert, sessions (30 days, sign-out this browser), lowercase email; defines its ports (AccountStore, CodeStore, SessionStore, Mailer, RequestThrottle, Clock, Random) | none (pure; data reached through ports) | `#core/identity` — use cases `requestCode`, `verifyCode`, `resolveSession`, `signOut`; port and type definitions | src/adapters/d1, src/adapters/mail, src/adapters/switchboard, src/http, src/worker, tests/invariants |
> | src/adapters/d1 | D1 implementations of AccountStore, CodeStore, SessionStore, RequestThrottle (keyed-hash counters, D-025); migrations | tables `accounts`, `codes`, `sessions`, `request_counters`, `daily_totals` | `#adapters/d1` — `createD1Stores(db)` | src/worker, tests/invariants |
> | src/adapters/mail | Mailer port over Cloudflare Email Service; a fake for tests | none | `#adapters/mail` — `createEmailServiceMailer(binding)`, `createFakeMailer()` | src/worker, tests/invariants |
> | src/http | Hono app: sign-in pages and form posts, session cookie, the call page, the WebSocket upgrade route, static client bundle; English UI | none | `#http` — `createApp(deps)` | src/worker, tests/invariants |

## Rows

> ROW-001 | behavior | REQ-001 | anonymous | n/a | this never happens: a person is signed in without entering the code sent to their email | REQ-001 | owed: spec-only — first stage | origin: REQ-001
- ROW-001 marks: none
> ROW-002 | behavior | REQ-001 | anonymous | n/a | this never happens: a working code entered in time does not sign the person in, while their network address is under its hourly wrong-try limit | REQ-001 | owed: spec-only — first stage | origin: REQ-001
- ROW-002 marks: none
> ROW-004 | behavior | REQ-002 | anonymous | n/a | this never happens: a code signs someone in more than 10 minutes after it was sent | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-004 marks: none
> ROW-005 | behavior | REQ-002 | anonymous | n/a | this never happens: a code signs someone in a second time | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-005 marks: none
> ROW-006 | behavior | REQ-002 | anonymous | n/a | this never happens: a code still signs someone in after 5 wrong tries against it from the network address that requested it | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-006 marks: none
> ROW-007 | behavior | REQ-002 | anonymous | n/a | this never happens: an earlier code still signs someone in after a newer one was sent for the same email at the request of the same network address — network address means the edge-reported client address, IPv6 counted per /64 | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-007 marks: none
> ROW-008 | behavior | REQ-002 | anonymous | n/a | this never happens: a code is not 6 digits | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-008 marks: none
> ROW-096 | reachability | / | anonymous | n/a | the sign-in screen is the entry point; after a code is requested the code-entry step is reachable from it and leads back to the email step | REQ-001 | owed: spec-only — first stage | origin: REQ-001
- ROW-096 marks: reachability
> ROW-114 | behavior | REQ-001 | anonymous | n/a | this must always hold: the email box refuses commas, line breaks, display names, several @ and more than 254 characters; the code email has exactly one recipient, equal to the normalised address; and this must always hold: only one bare address is accepted: semicolons, spaces and angle brackets are refused, apostrophes accepted | REQ-001 | owed: spec-only — first stage | origin: domain
- ROW-114 marks: none
> ROW-117 | behavior | REQ-002 | anonymous | n/a | this must always hold: parallel wrong guesses against one code evaluate at most 5; one code entered twice at once yields one session; parallel first sign-ins make one account; parallel code requests from one network address leave one working code | REQ-002 | owed: spec-only — first stage | origin: domain
- ROW-117 marks: none
> ROW-118 | behavior | REQ-001 | anonymous | n/a | this must always hold: a code issued to one email never signs in as another email | REQ-001 | owed: spec-only — first stage | origin: domain
- ROW-118 marks: none
> ROW-124 | behavior | REQ-002 | anonymous | n/a | this must always hold: codes are drawn from a cryptographic random source, every code from 000000 to 999999 can occur and keeps its leading zeros, and session values carry at least 128 random bits; and this must always hold: the composition root binds randomness to the cryptographic source; no Math.random in src | REQ-002 | owed: spec-only — first stage | origin: domain
- ROW-124 marks: none
> ROW-126 | behavior | REQ-002 | anonymous | n/a | this must always hold: a storage error while checking or counting a code signs nobody in | REQ-002 | owed: spec-only — first stage | origin: domain
- ROW-126 marks: none
> ROW-142 | behavior | REQ-001 | anonymous | n/a | this must always hold: no fixed code, last-code reader, fake mailer or test bypass is reachable in the deployed product | REQ-001 | owed: spec-only — first stage | origin: domain
- ROW-142 marks: none
> ROW-146 | behavior | REQ-001 | anonymous | n/a | this must always hold: asking for a code creates no account; only entering the code does | REQ-001 | owed: spec-only — first stage | origin: domain
- ROW-146 marks: none
> ROW-158 | behavior | REQ-002 | anonymous | n/a | this must always hold: a code's wrong-try count survives a restart, eviction or second server instance | REQ-002 | owed: spec-only — first stage | origin: domain
- ROW-158 marks: none
> ROW-162 | behavior | REQ-002 | anonymous | n/a | this must always hold: the code box trims surrounding spaces, and input that is not 6 digits is refused without using one of the 5 tries | REQ-002 | owed: spec-only — first stage | origin: domain
- ROW-162 marks: none
> ROW-179 | behavior | REQ-001 | anonymous | n/a | control of ROW-114: a plain valid email receives exactly one code email | REQ-001 | owed: spec-only — first stage | origin: domain
- ROW-179 marks: none
> ROW-180 | behavior | REQ-002 | anonymous | n/a | control of ROW-117: a single correct code entered once signs the person in | REQ-002 | owed: spec-only — first stage | origin: domain
- ROW-180 marks: none
> ROW-196 | behavior | REQ-002 | anonymous | n/a | this never happens: a request from another network address, or a request whose email failed to send, makes an earlier working code stop working — network address means the edge-reported client address, IPv6 counted per /64 | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-196 marks: none
> ROW-200 | behavior | REQ-037 | anonymous | n/a | this never happens: an 11th wrong try within an hour from one network address is checked against a code — network address means the edge-reported client address, IPv6 counted per /64 | REQ-037 | owed: spec-only — first stage | origin: REQ-037
- ROW-200 marks: none
> ROW-201 | behavior | REQ-037 | anonymous | n/a | this never happens: the wrong-try refusal differs between emails with and without an account | REQ-037 | owed: spec-only — first stage | origin: REQ-037
- ROW-201 marks: none
> ROW-204 | behavior | sign-in screen | anonymous | n/a | this never happens: an email holding any non-ASCII or invisible character is accepted at sign-in or in the call box | REQ-039 | owed: spec-only — first stage | origin: REQ-039
- ROW-204 marks: none
> ROW-207 | behavior | REQ-039 | anonymous | n/a | control of ROW-204: a plain ASCII email with dots, plus and apostrophe is accepted | REQ-039 | owed: spec-only — first stage | origin: REQ-039
- ROW-207 marks: none
> ROW-208 | behavior | REQ-002 | anonymous | n/a | this never happens: wrong tries from one network address make a code requested from another network address stop working — network address means the edge-reported client address, IPv6 counted per /64 | REQ-002 | owed: spec-only — first stage | origin: REQ-002
- ROW-208 marks: none
> ROW-209 | behavior | REQ-037 | anonymous | n/a | this never happens: after 10 wrong tries within an hour from one network address, a further try from that address signs someone in, even with a working code | REQ-037 | owed: spec-only — first stage | origin: REQ-037
- ROW-209 marks: none
> ROW-212 | behavior | code request response | anonymous | n/a | at the code request response: this never happens: an email holding any non-ASCII or invisible character is accepted — network address means the edge-reported client address, IPv6 counted per /64 | REQ-039 | owed: spec-only — first stage | origin: REQ-039
- ROW-212 marks: none
> rule | RULE-013 | every secret read refuses to run when the secret is missing or short | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-024
- RULE-013 marks: rule
> difference | DIF-001 | the code email sender | a fake mailer that records the one recipient and the body in memory | Cloudflare Email Service binding sending from no-reply@call-by-identifier.josueayala.me | the fake records exactly what the adapter hands to the binding, so the product's choice of recipient and body is still tested | paying-step: staging — one real code email to a test inbox through the binding, SPF, DKIM and DMARC passing
- DIF-001 marks: owed-staging
> seam | SEAM-001 | Cloudflare Email Service | sends the sign-in code email | chosen: D-008 | credentials: not-yet | probe: unreachable-risk(credentials not-yet) | evidence: owed | quirks: none yet
- SEAM-001 marks: seam
> hostility | HOS-001 | on the code-entry screen, submit no code, an empty code and a code of another email, expect no session cookie and no signed-in screen | protects: REQ-001 | disable: remove the code check in verifyCode | owed: guard-first — the protection of REQ-001 does not exist yet; paid in the slice that builds it
- HOS-001 marks: protection
> hostility | HOS-002 | on the code-entry screen, submit the correct code within 10 minutes, expect a session; with the check bypassed the session is refused | protects: REQ-001 | disable: remove the session creation after a valid code | owed: guard-first — the protection of REQ-001 does not exist yet; paid in the slice that builds it
- HOS-002 marks: protection
> hostility | HOS-004 | on the code-entry screen, submit the code 10 minutes and 1 second after it was sent, expect no session | protects: REQ-002 | disable: remove the expiry comparison | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-004 marks: protection
> hostility | HOS-005 | submit a correct code a second time after it signed in once, expect no second session | protects: REQ-002 | disable: remove single-use consumption | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-005 marks: protection
> hostility | HOS-006 | submit 5 wrong codes then the right one, expect no session; repeat with 50 wrong guesses in parallel, expect at most 5 evaluated | protects: REQ-002 | disable: remove the wrong-try counter and its atomic update | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-006 marks: protection
> hostility | HOS-007 | from one network address request a code, request a second that is sent, submit the first, expect no session | protects: REQ-002 | disable: remove the kill of earlier codes on a new request | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-007 marks: protection
> hostility | HOS-008 | read every code the fake mailer recorded over many requests, expect each is exactly 6 digits | protects: REQ-002 | disable: remove the 6-digit code generator | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-008 marks: protection
> hostility | HOS-028 | start the Worker with the code-hashing secret unset, request and enter a code, expect sign-in refused | protects: RULE-013 | disable: remove the secret presence check | owed: guard-first — the protection of RULE-013 does not exist yet; paid in the slice that builds it
- HOS-028 marks: protection
> hostility | HOS-029 | from a second network address request a code for the victim's email, then submit the victim's earlier code, expect it still signs in; and with the mailer failing, request again from the victim's address and expect the earlier code still works | protects: REQ-002 | disable: remove the same-address and sent-only condition on cancelling codes | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-029 marks: protection
> hostility | HOS-030 | from address B submit 5 wrong codes for an email whose live code was requested from address A, then submit A's code from A, expect it signs in | protects: REQ-002 | disable: remove the per-address scoping of wrong-try counts | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
- HOS-030 marks: protection

## Requirements

> REQ-001 | functional | T0 | Entering an email and asking for a code sends a sign-in code to that email; entering that code while it still works signs the person in, unless their network address has reached its hourly wrong-try limit, and the first sign-in with an email makes its account. | fail-if: (1) a person is signed in without entering the code sent to their email; (2) a working code entered in time does not sign the person in, while their network address is under its hourly wrong-try limit; (3) a first-time email that enters its code has no account and cannot call or be called | serves: the one way into the product, owned by whoever controls the mailbox | authority: authoritative | source: seed, A-001, A-058 | covers: DIM-identity/verification | phase: pilot | feature: FEAT-01 | plain: You sign in by entering the code sent to your email, and your account is made the first time you do. | arms: 1 retained, 2 withdrawn A-058, 3 retained
> REQ-002 | functional | T0 | A sign-in code has 6 digits, works for 10 minutes and only once; a typed code is checked against each live code of the email, and after 5 wrong tries from the network address that requested a code that code stops working; a new code that is actually sent makes every earlier code for that email requested from the same network address stop working. | fail-if: (1) a code signs someone in more than 10 minutes after it was sent; (2) a code signs someone in a second time; (3) a code still signs someone in after 5 wrong tries against it from the network address that requested it; (4) an earlier code still signs someone in after a newer one was sent for the same email at the request of the same network address; (5) a code is not 6 digits; (6) a request from another network address, or a request whose email failed to send, makes an earlier working code stop working; (7) wrong tries from one network address make a code requested from another network address stop working | serves: keeps anyone but the mailbox owner from guessing or reusing a code, and keeps others from cancelling it | authority: authoritative | source: A-015, A-049, A-054, A-055 | covers: DIM-otp-code, DIM-identity/signin_reauth, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: A code has 6 digits, works once for 10 minutes, dies after 5 wrong tries from its own address, and only your own newer code kills it. | arms: 1 retained, 2 retained, 3 withdrawn A-055, 4 withdrawn A-049, 5 retained
> REQ-024 | nfr | T1 | All page loads and call setup traffic use HTTPS; the session is kept in a cookie that page scripts cannot read; sign-in codes are stored only in hashed form. | fail-if: (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | serves: a stated security floor for sessions and codes | authority: provisional | confirms_via: owner-decision/no | source: A-034 | covers: DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: Pages and call setup go over HTTPS, the session cookie is hidden from scripts, and codes are stored only hashed. | cross-cutting: page delivery, call setup channel, session cookie, code storage
> REQ-037 | functional | T1 | One network address gets at most 10 wrong code tries an hour across all emails; further tries are refused without being checked, and the person is told to try again later. | fail-if: (1) an 11th wrong try within an hour from one network address is checked against a code; (2) the refusal differs between emails with and without an account; (3) after 10 wrong tries within an hour from one network address, a further try from that address signs someone in, even with a working code | serves: slow guessing across many accounts from one place stops | authority: authoritative | source: A-050 | covers: DIM-otp-code, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: One network address gets at most 10 wrong code tries an hour, whatever emails it tries.
> REQ-039 | functional | T1 | Only plain ASCII email addresses are accepted wherever an email is typed. | fail-if: (1) an email holding any non-ASCII or invisible character is accepted at sign-in or in the call box | serves: lookalike letters cannot impersonate a known caller | authority: authoritative | source: A-052 | covers: DIM-data-integrity/record_identity, DIM-lookup-disclosure | phase: pilot | feature: FEAT-01 | plain: Only plain ASCII email addresses are accepted. | cross-cutting: sign-in screen, code request response, call input screen, call request response

The answers they cite:

> A-001 AMENDED | human | 2026-11-26 | Q: Who can sign in? | A: Anyone with a plain ASCII email address; the account is made the first time they sign in with a code. | settles: MECH-02 | importance: priority
> A-058 | human | 2026-11-26 | Q: When a shared network address has reached 10 wrong tries in the hour, is a correct code from that address refused? | A: Accepted as recommended: yes; the address limit wins, a correct code from that address is refused until the hour passes and still works from another address. | settles: REQ-001, REQ-037 | importance: priority
> A-015 AMENDED | human | 2026-11-26 | Q: How does the sign-in code work? | A: 6 digits, valid for 10 minutes, usable once; after 5 wrong tries the code stops working and a new one must be requested; a new code that is actually sent cancels every earlier code for that email requested from the same network address. | settles: MECH-01 | importance: priority
> A-049 | human | 2026-11-26 | Q: Should a new code cancel earlier ones only when requested from the same network address? | A: Accepted as recommended: yes; a new code cancels earlier codes for that email only when requested from the same network address. | settles: REQ-002 | importance: priority
> A-054 | human | 2026-11-26 | Q: Does a code email that fails to send cancel the earlier working code? | A: Accepted as recommended: no; only a code actually sent cancels earlier ones. | settles: REQ-002 | importance: priority
> A-055 | human | 2026-11-26 | Q: When one email has several live codes, which code does a wrong try count against? | A: A typed code is checked against each live code of the email; a wrong try counts only against the codes requested from the network address that typed it. | settles: REQ-002 | importance: priority
> A-034 | model_proposed | 2026-11-26 | Q: What is the security floor? | A: All page loads and call setup traffic over HTTPS; the session is kept in a cookie page scripts cannot read; sign-in codes are stored only in hashed form. | settles: REQ-024 | shown: pause-3 2043172081
> A-050 | human | 2026-11-26 | Q: Should one network address be limited in wrong code tries? | A: Accepted as recommended: at most 10 wrong code tries an hour per network address, across all emails. | settles: REQ-037
> A-052 | human | 2026-11-26 | Q: Which emails are accepted? | A: Accepted as recommended: only plain ASCII email addresses. | settles: REQ-039

## Decisions

> - **D-001** Runtime is Cloudflare Workers in strict TypeScript; Pages Functions, Vercel and Node servers are rejected
> - **D-002** HTTP framework is Hono, with hono/jsx for server-rendered pages
> - **D-003** Hexagonal layout: src/core (pure rules + ports) ← src/adapters (D1, mail, switchboard) ← src/http (Hono) ← src/worker (composition root); core imports no Cloudflare or Hono module
> - **D-004** Accounts, sessions and codes live in Cloudflare D1, reached only through prepared SQL statements in src/adapters/d1; no ORM
> - **D-008** The sign-in code email is sent through the Cloudflare Email Service Worker binding from no-reply@call-by-identifier.josueayala.me
> - **D-009** Sign-in codes are 6 digits drawn with crypto.getRandomValues by rejection sampling, stored only as HMAC-SHA-256 (RFC 2104) under a server secret held as a Worker secret, compared in constant time
> - **D-010** Sessions are opaque 256-bit random tokens in a cookie marked HttpOnly, Secure, SameSite=Lax, stored in D1 only as their SHA-256 hash, with an absolute 30-day expiry and no refresh; sign-out deletes this browser's session only
> - **D-012** Emails are lowercased at the edge of the core and stored under a CHECK constraint `email = lower(email)` with a UNIQUE index
> - **D-013** UI is server-rendered Hono JSX plus one vanilla TypeScript client bundle and plain CSS with design tokens; no SPA framework, no Tailwind; English only
> - **D-014** Visual direction is a quiet, neutral, monochrome interface in the manner of Notion and Vercel: system sans font, generous white space, thin borders, one accent
> - **D-015** Tests: Vitest with @cloudflare/vitest-pool-workers for the Worker, D1 and the Durable Object; Playwright Chromium with fake media devices for two-browser call flows; all run in Docker through (ViD's records)
> - **D-016** Database changes are additive only (expand, then contract in a later release), applied with wrangler d1 migrations without a maintenance window
> - **D-017** Platform check: the Workers Paid plan (5 USD a month) covers Workers, D1 and Durable Objects within this product's volume; Cloudflare Pages Functions, Vercel and Fly.io rejected
> - **D-018** Production serves at call-by-identifier.josueayala.me; staging at the platform's own workers.dev address
> - **D-019** On the test site the email service is live-restricted and STUN is live; the TURN relay stays fake until REQ-028
> - **D-020** No log line, error report or metric carries an email, a network address or a call id together with anything that identifies the other person; call-related logs carry neither email
> - **D-021** Package manager is pnpm, with Node 22 for tooling only
> - **D-025** The code request counters, the per-address wrong-try counters and the per-code requesting-address hash are stored in D1 (tables `request_counters` and `daily_totals`, and a column on `codes`), as keyed HMAC-SHA-256 hashes under a server secret kept apart from the database; counters live one hour, the daily total one day and holds no email or address; who is online, busy or in a call stays in the switchboard's memory
> - **D-026** A cron trigger runs the cleanup every 15 minutes: it deletes used, expired, superseded and locked codes, ended sessions, counters older than one hour and daily totals older than one day
> - **D-027** "Network address" in every per-address rule is the client address Cloudflare's edge reports (CF-Connecting-IP), IPv4 whole and IPv6 counted per /64; no forwarding header is read
> - **D-028** The operator alert goes to the address in the Worker variable OPERATOR_EMAIL, set by the owner; at most one alert is sent per day
> - **D-029** the entry is a Node script in src/worker (entry.mjs) that skips the migrations step until migrations/ holds a .sql file, binding name DB; the sign-in form posts to / with no handler yet, so no door opens before its row; pnpm allows build scripts for esbuild and workerd only
> - **D-030** the Worker exports no SwitchboardObject and declares no D1 or Durable Object binding yet
> - **D-031** the sign-in form has no post handler in this ticket

## Rules that bear on these rows

> rule | RULE-008 | every response path carries the security headers, static assets and the assets configuration included | (ViD's records) | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-024
> rule | RULE-013 | every secret read refuses to run when the secret is missing or short | (ViD's records) | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-024
> rule | RULE-014 | every field the product collects from a person (the email) is acted on beyond validation and display | sites: every form field and request field the product stores | 1 | owed: spec-only — ticket | origin: plan REQ-001

## Laws

> ## Import law
>
> The seam table's public-surface and dependents columns are executed by
> (ViD's records) at every commit: a module is entered only through its
> declared import specifier, only by its declared dependents; relative imports
> across module paths are always violations. The dependents column is the
> blast-radius map — a fix in module X re-grades X plus its declared
> dependents, not the whole product.
>
> ## Design law (when design/ exists)
>
> design/ is the second half of the spec, ratified by the owner in a
> /vid design sitting: PRD.md says what the product DOES; design/ says what
> it IS — the source of truth for the visible surface.
>
> - **Transcription law.** Every CSS rule in the app derives from a cited
>   canvas section, property-for-property; the only permitted substitution is
>   hex→token. **No invented visual values**: a color, radius, spacing, or
>   type value that exists in neither the canvases nor design/tokens.css does
>   not exist in the app. Small judgment deltas (an added `gap`,
>   `height`→`min-height`) are develop's to make and grade's to judge — the
>   law is traceability, the grader is the fidelity check.
> - Citations are **sub-screen, marker unit** — never the filename. Every rule
>   block sits under a comment citing its marker
>   (`/* Result cards (P02/populated — REQ-030) */`); markup wears the
>   transcribed classes AND, for a state, every element identifier its
>   canvas section carries (`data-element="<role>"`, v0.9.2 3.4, R20) on
>   the element that plays that role, inside the marker's section — the
>   identifiers are what the surface instrument measures, every property
>   the canvas declares on the element, so an identifier the page lacks is
>   a failing case (`missing element`), never a deferral; templates/
>   components cite their markers
>   (`Design: design/screens/<file> (P02/populated …)`). (ViD's records)
>   enforces the rule-block side at every commit; (ViD's records) joins
>   every pack marker to a citation — an uncited marker is a gap.
> - design/tokens.css is extracted VERBATIM at ratification and carries its
>   provenance header. Colors enter the product only through it: app source
>   references tokens, and conformance rejects new raw hex outside design/.
>   design/ itself is imported verbatim from the owner — exempt from the hex
>   court and from Purpose: headers; it is spec, not source.
> - design/ is a protected path (VID_ROLE=fix) with ledger standing, and the
>   standing is mechanical: MODIFYING or DELETING anything under design/ is a
>   law change (standalone commit, hook-enforced); additions are free — the
>   ratification import stays one law commit. A visual correction lands as
>   the design law commit first (its Decisions: trailer naming the owner
>   correction), immediately followed by the code commit citing the same
>   markers — adjacent, so the two never diverge beyond one commit.
> - The design binds the builder and never absolves it: a designed screen is
>   spec, not evidence. Built-vs-designed divergence, and screens existing
>   only in design/, are grader findings.
> - A discovered PRD/design contradiction is a product question — ask
>   immediately, never pick a winner silently.
>

## Non-goals

> NG-001 | non_goal | - | No video and no group calls. | authority: authoritative | source: thesis, A-004
> NG-002 | non_goal | - | No contacts, call history, missed-call records, chat, profiles, names or avatars. | authority: authoritative | source: seed, thesis
> NG-003 | non_goal | - | No notifications outside the open app and no blocking or reporting. | authority: authoritative | source: thesis
> NG-004 | non_goal | - | No account settings or deletion screens, passwords, other sign-in methods, or session refresh. | authority: authoritative | source: thesis, A-016
> NG-005 | non_goal | - | No encryption layer of the product's own. | authority: authoritative | source: seed, A-005

## Engines

- primary: chromium

The primary alone is asked: no row has yet failed in one engine and passed in another.

## Regression rows

- ROW-093

## Faulted rows

- ROW-180: make this row's fail-if true, and nothing else
- ROW-200: make this row's fail-if true, and nothing else
- HOS-001: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the code check in verifyCode
- HOS-002: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the session creation after a valid code
- HOS-004: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the expiry comparison
- HOS-005: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove single-use consumption
- HOS-006: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the wrong-try counter and its atomic update
- HOS-007: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the kill of earlier codes on a new request
- HOS-008: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the 6-digit code generator
- HOS-028: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the secret presence check
- HOS-029: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the same-address and sent-only condition on cancelling codes
- HOS-030: make this row's fail-if true, and nothing else; its disable: note, quoted:
> disable: remove the per-address scoping of wrong-try counts

## Rows a ruling reached

none

## Grading checklist and records

> # call-by-identifier — GRADING CHECKLIST
>
> > Owner-curated, versioned, injected VERBATIM into every grading brief
> > (§7.2). This is the residue that stays human: absent guards leave no
> > artifact — no orphan, no site list, no divergent knob — so no census can
> > find them; only domain knowledge names them in advance. Every accepted
> > absent-guard finding adds one line here: this run's blind spot becomes the
> > next run's standard question. Seeded at init from the interview and the
> > plugin's seed library (seed/checklist.md); lines the owner marks general
> > at run end are promoted back into the seed (§7.3). A seeded line that
> > fires nothing across two runs is dropped (the complexity law).
>
> ## Standing lines (every project)
>
> - **Harness attacks.** Check that the test harness itself has not been
>   defeated: assertion-neutralising equality overrides (`__eq__` and its
>   analogues), early process exit before assertions run (`sys.exit(0)` and
>   its analogues), test-framework monkey-patching, skipped or filtered tests
>   counted as run. Measured hidden-test hack rates of 12–13% make "the suite
>   exited 0" an attackable claim.
> - **Example-only evidence.** A computational promise — a calculation, a
>   ranking, a match, a decision — proved only by published, named examples
>   is unproved: find the implementation that branches on the fixture and
>   answers correctly for exactly those inputs. Generated or independently
>   sampled inputs are the standard (exact fixture-named assertions can be
>   satisfied by branching on the fixture names, with no engine built).
> - **Probe fixture realism.** Tidy stand-in fixtures carry none of the
>   hostile properties of real input: check that a hostility probe's input
>   is hostile in every field the product stores or renders, not only the
>   one the probe asserts on, and that filenames, addresses and markup look
>   like the real thing (hostile markup planted in the description alone
>   leaves every other field between a hostile feed and stored script).
> - **Assertion strength on Tier-0.** A Tier-0 row whose test asserts only
>   that something EXISTS — an element is present, a record count is at
>   least one, a status is in a set spanning success and redirect — is a
>   finding: name the value or behaviour the assertion should have pinned
>   (the ladder: existence → type → status → value → behaviour; presence
>   assertions can outnumber real visibility assertions many times over).
>
> ## Domain lines
>
> - **Fences (non-goals): building any of these is a defect.** Video or group calls (NG-001); contacts, call history, missed-call records, chat, profiles, names or avatars (NG-002); notifications outside the open app, blocking or reporting (NG-003); account settings or deletion screens, passwords, other sign-in methods, session refresh (NG-004); an encryption layer of the product's own (NG-005, CON-001). | scope: domain: calling
> - **English only.** Is every word the interface shows in English (CON-002)? | scope: domain: calling
> - **Same work for every "not available".** Does the not-available answer cost the same work and time for an email with no account, an offline person, a busy person and your own email, or does one case touch the database or the switchboard differently? | scope: domain: calling
> - **One counter.** Are the code-request and wrong-try counters held in exactly one place (the database, as keyed hashes), never in an isolate, a module variable or the switchboard, so the limits hold across every instance and restart? | scope: domain: calling
> - **Flood isolation.** Under a burst of code requests, do heartbeats, rings and drop timers still keep their 10, 15 and 30 second timings? | scope: domain: calling
> - **Microphone constraints.** Does the microphone request ask for audio only and leave the browser's echo cancellation, noise suppression and automatic gain on? | scope: domain: calling
> - **Silent call honesty.** Is "in call" shown only once the other person's audio is received and playing, never at a connection state alone? | scope: domain: calling

The records, deliberately not tested:

none

## Golden sets

none

## History

none: no row of this ticket has an earlier attempt

## Test lessons

none

## Known, ruled by the owner

none

## Further reading

The spec repository, https://github.com/josueayala27/call-by-identifier-spec, at the export f2c578aa0fa62b0dda999c62d92d54e6085c8d4e; each of its files, by its path there:

> ARCHITECTURE.md
> BASELINE.md
> DECISIONS.md
> GRADING-CHECKLIST.md
> PRD.md
> TEST-DIFFERENCES.md

## Roles

DevAgent's roles; each report names the role that made it:

- DM, DevAgent's manager: claims the ticket, starts DevAgent's agents and keeps them apart, and integrates their work.
- TA, test author: writes each row's tests from the row and its fail-if, before any product code, and commits them alone.
- TM, test manager: keeps the test environments, runs every test run reported to ViD, and plants each fault.
- AN, test analyst: finds why a run failed when the cause is not plain.
- BU, builder: writes the product code until the row tests and the regression rows pass.
- FX, fixer: fixes the failing rows of an open pull request, and builds fix tickets.
- GR, grader: gives each row its verdict, and writes each needed fault's change.
- SR, second reviewer: sorts GR's breached and unclear lines, once a ticket.
- MR, merger: does DevAgent's own review of the code, asks for ViD's decision, and merges once ViD accepts.
- DP, deployer: deploys on ViD's okay, and reports each deploy.

The independence rules, which ViD takes DevAgent's word it keeps:

1. TA, TM and GR are never BU or FX. TA and TM may be one agent.
2. GR is a separate agent, never TA or TM, in a fresh context: it reads the code, the tests and the results, never the reasoning of BU, FX, TA or TM. A GR writing a break at a later head is not told an earlier decision or a fix. GR reads the ticket without the why: of each decision, and a fix ticket also without its failed: lines and its History: the rows, the code and the results alone.
3. BU and FX never write, change or weaken a test.
4. Only TM's test runs are reported. DP reports deploys, and the deploy steps that are no row.
5. TA never weakens a test below its row's promise. It may correct a test that asks more than the promise; the row is then retested.
6. DM, AN, MR and DP may be any of DevAgent's agents, but each report names its role.
7. SR is a fresh agent, never the GR, BU, FX or TA of the ticket. It is given no earlier sorting, no fix history, no spend or time, no count either way, and no push to find problems, clear them, finish a ticket or keep it open.
8. DevAgent reads the spec repository's main alone: its other branches hold ViD's records, and are no part of the spec.

## Asks

- T1 (TA): write at least one test per row, per transition for a journey, its name matching the row's id.
- T2 (TA, then TM): TA commits those tests alone, before any product code; TM runs them in the primary engine. This is the red proof.
- T3 (TM): at the pull request's head, run every row and every regression row, in each asked engine.
- T4 (GR, then TM): at the same head, GR writes each needed fault's change: make this row's fail-if true, and nothing else; a later head may plant a row's earlier patch again. TM plants it and runs the faulted row's test and the control's, in the primary engine; TM picks each control, a row or another case of the faulted row that passed at this head's T3. The needed faults: the faulted rows', each row with no red's, each retested row's.
- T5 (GR, SR): at the ticket's first head alone, two fresh GRs, each in its own blind copy, grade each row against its fail-if, the grading checklist and the test differences, a screen row also against the design, and their lines are combined. SR sorts what the grade leaves, once. No later head has a grade or a sort.

- Set up the data its modules own, as their rows above say, where no earlier ticket has.
- RULE-013: the report gives the number of places its test covered; zero places means the row fails.
- DIF-001: a test difference: the test environment uses its test value as the stand-in, and the report names it.
- SEAM-001: the seam's probe: its test makes one real action through the service, on staging.
- HOS-001: its test's failure message carries the line vid-forbidden-effect: HOS-001. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-002: its test's failure message carries the line vid-forbidden-effect: HOS-002. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-004: its test's failure message carries the line vid-forbidden-effect: HOS-004. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-005: its test's failure message carries the line vid-forbidden-effect: HOS-005. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-006: its test's failure message carries the line vid-forbidden-effect: HOS-006. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-007: its test's failure message carries the line vid-forbidden-effect: HOS-007. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-008: its test's failure message carries the line vid-forbidden-effect: HOS-008. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-028: its test's failure message carries the line vid-forbidden-effect: HOS-028. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-029: its test's failure message carries the line vid-forbidden-effect: HOS-029. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- HOS-030: its test's failure message carries the line vid-forbidden-effect: HOS-030. A protection row names something that must never happen, and the line marks evidence of that thing alone.
- Deploy-owed rows take part in T1 and T5 only: DIF-001 SEAM-001.

Questions: a product question goes as a comment on this issue, its pull request or a run ask, its first line beginning Question: and naming the rows or step it concerns. Label the issue blocked only when the work cannot go on without the answer; otherwise build on your default, and say the default in the question.

Decisions: the pull request's body holds a section that begins with the line Decisions:, then one line a technical decision of the branch, "- what was chosen | why: the reason", or the one line Decisions: none. A decision is a choice that picked between plausible alternatives, constrains later code, or would surprise a competent newcomer. A hand-rolled security mechanism (cryptography, one-time codes, session tokens, signing) is always one, and names the standard it implements; so is a change to stored data, naming what it changes and how it is rolled back. A new or extended lifecycle, the states a stored record moves through, is a question on this ticket before it is built. A line that bears on many areas of the product ends with | scope: project. Keep the section current from the first head on; ViD records it when the pull request merges. A pull request whose body lacks the section is not accepted: its decision reads not yet until the section is there.

A decision line beginning analyst due asks for DevAgent's test analyst on the cases that could not run.

Results: every report in ViD's results format, by name: ViD results format 1.

Work on any branch, from the base above; open one pull request into main whose body begins ticket: #, then this issue's number.

