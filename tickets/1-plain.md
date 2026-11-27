Ticket #1, part 1 of 1, writing fe2752656206.

# Skeleton ticket S1: The walking skeleton: the app deploys, a signed-out visitor sees the sign-in screen, and the test setup runs

## Header

- number: 1
- kind: skeleton
- step: S1
- stage: 1
- plan: 97ca0dde8697
- base: d637b7bf19e9171a48582fa8745ca3a454faa999
- export: 58f607cec86a644120dfd82bef80d1401cf7f2b7
- rows: ROW-093

## The step

> step S1 | name: The walking skeleton: the app deploys, a signed-out visitor sees the sign-in screen, and the test setup runs | modules: src/worker, src/http | builds-on: - | rows: ROW-093 | lane: devagent | kind: skeleton
> shared: src/worker
>
> | Module | Responsibility | Owned tables/data | Public surface | Dependents |
> |---|---|---|---|---|
> | src/http | Hono app: sign-in pages and form posts, session cookie, the call page, the WebSocket upgrade route, static client bundle; English UI | none | `#http` — `createApp(deps)` | src/worker, tests/invariants |
> | src/worker | Composition root: reads bindings and secrets, builds adapters, injects into core and http; exports the Worker `fetch` and the Durable Object class | none | `#worker` — Worker default export, `SwitchboardObject` re-export | tests/invariants |
> | src/core/identity | Sign-in rules: code issue and check (6 digits, 10 min, once, 5 wrong tries from the requesting address, a newer sent code cancels older codes of the same address only), request and wrong-try limits per network address (D-027), the daily total and its alert, sessions (30 days, sign-out this browser), lowercase email; defines its ports (AccountStore, CodeStore, SessionStore, Mailer, RequestThrottle, Clock, Random) | none (pure; data reached through ports) | `#core/identity` — use cases `requestCode`, `verifyCode`, `resolveSession`, `signOut`; port and type definitions | src/adapters/d1, src/adapters/mail, src/adapters/switchboard, src/http, src/worker, tests/invariants |
> | src/adapters/d1 | D1 implementations of AccountStore, CodeStore, SessionStore, RequestThrottle (keyed-hash counters, D-025); migrations | tables `accounts`, `codes`, `sessions`, `request_counters`, `daily_totals` | `#adapters/d1` — `createD1Stores(db)` | src/worker, tests/invariants |
> | src/adapters/mail | Mailer port over Cloudflare Email Service; a fake for tests | none | `#adapters/mail` — `createEmailServiceMailer(binding)`, `createFakeMailer()` | src/worker, tests/invariants |
> | src/adapters/switchboard | The `Switchboard` Durable Object: WebSocket Hibernation sockets per tab, presence, call signalling — all in memory, never in Durable Object storage | in-memory live state only (online, busy, calls) | `#adapters/switchboard` — `SwitchboardObject` class | src/worker, tests/invariants |

## Rows

> ROW-093 | shell | / | anonymous | n/a | a signed-out visitor sees only the sign-in screen (email box and a send-code button): no call box, no sign-out control, no incoming-call area | REQ-001, REQ-005 | owed: spec-only — first stage | origin: REQ-001
- ROW-093 marks: shell

## Requirements

> REQ-001 | functional | T0 | Entering an email and asking for a code sends a sign-in code to that email; entering that code while it still works signs the person in, unless their network address has reached its hourly wrong-try limit, and the first sign-in with an email makes its account. | fail-if: (1) a person is signed in without entering the code sent to their email; (2) a working code entered in time does not sign the person in, while their network address is under its hourly wrong-try limit; (3) a first-time email that enters its code has no account and cannot call or be called | serves: the one way into the product, owned by whoever controls the mailbox | authority: authoritative | source: seed, A-001, A-058 | covers: DIM-identity/verification | phase: pilot | feature: FEAT-01 | plain: You sign in by entering the code sent to your email, and your account is made the first time you do. | arms: 1 retained, 2 withdrawn A-058, 3 retained
> REQ-005 | functional | T0 | Only a signed-in person can call or be called; every signed-in person can do both; only the person called can accept or decline their incoming call. | fail-if: (1) a signed-out visitor can start a call or make anyone's app ring; (2) a person with no session counts as online and can be rung; (3) anyone other than the person called can accept or decline the call; (4) a signed-in, online, free person is refused calling or being called | serves: calls happen only between people who proved their email | authority: authoritative | source: seed, thesis G2, A-001 | covers: DIM-authorization, DIM-identity/tiers | phase: pilot | feature: FEAT-02 | plain: Only signed-in people can call or be called, everyone signed in can do both, and only the person called can answer.

The answers they cite:

> A-001 AMENDED | human | 2026-11-26 | Q: Who can sign in? | A: Anyone with a plain ASCII email address; the account is made the first time they sign in with a code. | settles: MECH-02 | importance: priority
> A-058 | human | 2026-11-26 | Q: When a shared network address has reached 10 wrong tries in the hour, is a correct code from that address refused? | A: Accepted as recommended: yes; the address limit wins, a correct code from that address is refused until the hour passes and still works from another address. | settles: REQ-001, REQ-037 | importance: priority

## Decisions

> - **D-001** Runtime is Cloudflare Workers in strict TypeScript; Pages Functions, Vercel and Node servers are rejected | why: the owner chose Cloudflare as the platform at the technical sitting; Workers is its general compute and runs Hono natively | enforced: BASELINE.md vid-forbidden ((ViD's records)) | scope: project
> - **D-002** HTTP framework is Hono, with hono/jsx for server-rendered pages | why: the owner named Hono as the stack; it is Workers-native and convention-light, so routes stay thin over the core | enforced: BASELINE.md vid-forbidden ((ViD's records)) | scope: project
> - **D-003** Hexagonal layout: src/core (pure rules + ports) ← src/adapters (D1, mail, switchboard) ← src/http (Hono) ← src/worker (composition root); core imports no Cloudflare or Hono module | why: the owner asked for a hexagonal architecture; the seam table makes the direction executable | enforced: (ViD's records) (ARCHITECTURE.md seam table) | scope: project
> - **D-008** The sign-in code email is sent through the Cloudflare Email Service Worker binding from no-reply@call-by-identifier.josueayala.me | why: the owner named the sending address; the platform's own email service keeps one vendor and one log-in | enforced: convention | applies-to: REQ-001, REQ-023, REQ-030, src/adapters/mail | origin: proposal
> - **D-013** UI is server-rendered Hono JSX plus one vanilla TypeScript client bundle and plain CSS with design tokens; no SPA framework, no Tailwind; English only | why: three screens do not earn a framework; A-019 English only | enforced: BASELINE.md vid-forbidden ((ViD's records)) | applies-to: RULE-004, RULE-008, ROW-121, src/http, src/client | origin: proposal
> - **D-014** Visual direction is a quiet, neutral, monochrome interface in the manner of Notion and Vercel: system sans font, generous white space, thin borders, one accent | why: the owner's design hint names Notion and Vercel | enforced: convention | applies-to: src/http, src/client
> - **D-015** Tests: Vitest with @cloudflare/vitest-pool-workers for the Worker, D1 and the Durable Object; Playwright Chromium with fake media devices for two-browser call flows; all run in Docker through (ViD's records) | why: the pool runs real workerd locally, and fake media devices let two browsers place a real WebRTC call in a container | enforced: convention | scope: project | origin: proposal
> - **D-016** Database changes are additive only (expand, then contract in a later release), applied with wrangler d1 migrations without a maintenance window | why: the owner expects no downtime when a release changes D1 | enforced: convention | scope: project
> - **D-017** Platform check: the Workers Paid plan (5 USD a month) covers Workers, D1 and Durable Objects within this product's volume; Cloudflare Pages Functions, Vercel and Fly.io rejected | why: the owner holds the 5 USD plan and chose Cloudflare; presence needs Durable Objects, which need the paid plan | enforced: convention | scope: project | origin: proposal
> - **D-018** Production serves at call-by-identifier.josueayala.me; staging at the platform's own workers.dev address | why: the owner gave the production address; staging was left to ViD | enforced: convention | scope: project | origin: proposal
> - **D-019** On the test site the email service is live-restricted and STUN is live; the TURN relay stays fake until REQ-028 | why: the owner skipped the question; ViD's recommendation stands | enforced: convention | scope: project | origin: proposal
> - **D-020** No log line, error report or metric carries an email, a network address or a call id together with anything that identifies the other person; call-related logs carry neither email | why: REQ-021 forbids any log that names a person in connection with a call or links the two | enforced: convention | applies-to: REQ-021, src/adapters/switchboard, src/http
> - **D-021** Package manager is pnpm, with Node 22 for tooling only | why: one lockfile, fast installs in Docker | enforced: convention | scope: project | origin: proposal
> - **D-026** A cron trigger runs the cleanup every 15 minutes: it deletes used, expired, superseded and locked codes, ended sessions, counters older than one hour and daily totals older than one day | why: REQ-029 bounds how long counters and totals may be kept, and a daily sweep would keep counters up to 25 hours | enforced: convention | applies-to: REQ-029, ROW-107, ROW-074, src/worker, src/adapters/d1 | origin: proposal
> - **D-027** "Network address" in every per-address rule is the client address Cloudflare's edge reports (CF-Connecting-IP), IPv4 whole and IPv6 counted per /64; no forwarding header is read | why: one host holding an IPv6 /64 would otherwise get unlimited guesses and code emails, defeating REQ-002, REQ-037 and REQ-038 | enforced: convention | applies-to: REQ-002, REQ-023, REQ-037, REQ-038, ROW-116, src/http, src/core/identity | origin: proposal
> - **D-028** The operator alert goes to the address in the Worker variable OPERATOR_EMAIL, set by the owner; at most one alert is sent per day | why: A-059 sends the daily-total alert to the operator's own address, which the record must name, and one alert per email past 500 would flood it | enforced: convention | applies-to: REQ-038, REQ-030, src/adapters/mail, src/worker | origin: proposal

## Rules that bear on these rows

> rule | RULE-005 | every state-changing route and the WebSocket upgrade check the Origin and the session before acting | (ViD's records) | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-005
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

## The stack and hosting

The stack, decided at init:

>
> | Layer | Choice | FORBIDDEN alternatives (named) |
> |---|---|---|
> | Runtime | Cloudflare Workers, TypeScript (strict) | Node.js servers, Vercel Functions, AWS Lambda, Cloudflare Pages Functions |
> | HTTP framework | Hono (with `hono/jsx` for server-rendered pages) | Express, Fastify, Koa, itty-router, Next.js |
> | Architecture | Hexagonal: `src/core` (pure domain + ports) ← `src/adapters` (D1, mail, switchboard) ← `src/http` (Hono) ← `src/worker` (composition root) | Layered MVC, ORM-model-centric design, logic in route handlers |
> | Accounts, sessions, codes, request counters, daily total | Cloudflare D1 (SQLite) through prepared SQL statements in `src/adapters/d1` | Prisma, Drizzle ORM, TypeORM, Sequelize, Neon/Postgres, Supabase, Firebase, Workers KV for accounts |
> | Live state (online, busy, calls) | One Durable Object (`Switchboard`), in memory only, WebSocket Hibernation API; never written to Durable Object storage | Durable Object storage, D1, KV, Redis, Socket.IO, Pusher, Ably |
> | Voice | Browser WebRTC (`RTCPeerConnection`), audio only, peer to peer; STUN `stun.cloudflare.com` | Video tracks, SFU/media servers, any encryption layer of the product's own (A-005), Twilio, Agora |
> | Email | Cloudflare Email Service (Worker binding), sender `no-reply@call-by-identifier.josueayala.me` | Nodemailer, SendGrid, Mailgun, SMTP from the Worker |
> | Client UI | Server-rendered Hono JSX + one vanilla TypeScript client bundle; plain CSS with design tokens | React, Vue, Svelte, Tailwind CSS, any SPA framework |
> | Validation | Zod via `@hono/zod-validator` | Hand-rolled request parsing, Yup, Joi |
> | Crypto | Web Crypto API (`crypto.getRandomValues`, HMAC-SHA-256, SHA-256) | bcrypt, jsonwebtoken (JWT sessions), Math.random for secrets |
> | Tests | Vitest + `@cloudflare/vitest-pool-workers`; Playwright (Chromium, fake media devices) for browser call flows | Jest, Mocha, Cypress, Puppeteer |
> | Tooling | pnpm, Wrangler, Node 22 (tooling only) | npm/yarn lockfiles, global installs |
>

The hosting, decided at init:

> platform: cloudflare
> region: global
> staging: the platform's own (a workers.dev address)
> production: call-by-identifier.josueayala.me
> sending: no-reply@call-by-identifier.josueayala.me (domain call-by-identifier.josueayala.me)
> spend-cap: 5 USD a month (Workers Paid plan)
> access: cli-login cloudflare
> dns-access: cli-login cloudflare
> owner-only: wrangler login; setting the OPERATOR_EMAIL variable to the operator's own address; enabling Cloudflare Email Service sending for call-by-identifier.josueayala.me; setting the code-hashing secret value with wrangler secret put
> providers: cloudflare-email-service: live-restricted on staging; stun.cloudflare.com: live-restricted on staging; cloudflare-realtime-turn: fake on staging (later)

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

- ROW-093: its earlier tickets #1; its failing decisions, fix tickets and runs: none.

## Known, ruled by the owner

none

## Further reading

The spec repository, https://github.com/josueayala27/call-by-identifier-spec, at the export 58f607cec86a644120dfd82bef80d1401cf7f2b7; each of its files, by its path there:

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
- T3 (TM): at the pull request's head, run every row in each engine you declare. The head report declares the engines, the primary first, and how many test environments you run.
- T4 (GR, then TM): at the same head, the skeleton's fault: GR writes the change that makes its rows' fail-if true, and nothing else; TM plants it and runs the rows' tests in the primary engine, with no control.
- T5 (GR, SR): at the ticket's first head alone, two fresh GRs, each in its own blind copy, grade each row against its fail-if, the grading checklist and the test differences, a screen row also against the design, and their lines are combined. SR sorts what the grade leaves, once. No later head has a grade or a sort.

There is no T2: the skeleton has no red, so its fault stands in for it.


Questions: a product question goes as a comment on this issue, its pull request or a run ask, its first line beginning Question: and naming the rows or step it concerns. Label the issue blocked only when the work cannot go on without the answer; otherwise build on your default, and say the default in the question.

Decisions: the pull request's body holds a section that begins with the line Decisions:, then one line a technical decision of the branch, "- what was chosen | why: the reason", or the one line Decisions: none. A decision is a choice that picked between plausible alternatives, constrains later code, or would surprise a competent newcomer. A hand-rolled security mechanism (cryptography, one-time codes, session tokens, signing) is always one, and names the standard it implements; so is a change to stored data, naming what it changes and how it is rolled back. A new or extended lifecycle, the states a stored record moves through, is a question on this ticket before it is built. A line that bears on many areas of the product ends with | scope: project. Keep the section current from the first head on; ViD records it when the pull request merges. A pull request whose body lacks the section is not accepted: its decision reads not yet until the section is there.

A decision line beginning analyst due asks for DevAgent's test analyst on the cases that could not run.

Results: every report in ViD's results format, by name: ViD results format 1.

Work on any branch, from the base above; open one pull request into main whose body begins ticket: #, then this issue's number.

