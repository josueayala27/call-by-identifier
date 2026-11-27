# call-by-identifier — ARCHITECTURE

The seam table. One row per module. Updated in the same commit as any seam
change (law in CLAUDE.md). This table is EXECUTED, not descriptive: it is the
import court's rule source (checks/imports.sh reads it at every commit). A
module with no row cannot be imported; a row that lies fails the build.

Import court: enforce

Hexagonal (owner hint): `src/core/*` is the pure inside — domain rules and the
ports it needs, no Cloudflare or Hono import. `src/adapters/*` implement the
ports against D1, the email service and the Durable Object runtime.
`src/http` is the driving adapter (Hono routes, pages). `src/worker` is the
composition root: it wires adapters into the core and exports the Worker and
the Durable Object class. `src/client` is the browser bundle.

Import specifiers are `package.json` `imports` entries (`#core/identity`, …),
one per module, mirrored in `tsconfig.json` `paths`.

## Column contract (machine-read — keep the shapes exact)

- **Module** — the module's repo path; `/src/` segments in real file paths
  are collapsed when matching.
- **Public surface** — leads with the module's import specifier(s) in
  backticks; importing any path deeper than a declared specifier is a
  violation.
- **Dependents** — comma-separated Module paths that may import this module,
  or `all`, or `none`.

| Module | Responsibility | Owned tables/data | Public surface | Dependents |
|---|---|---|---|---|
| src/core/identity | Sign-in rules: code issue and check (6 digits, 10 min, once, 5 wrong tries from the requesting address, a newer sent code cancels older codes of the same address only), request and wrong-try limits per network address (D-027), the daily total and its alert, sessions (30 days, sign-out this browser), lowercase email; defines its ports (AccountStore, CodeStore, SessionStore, Mailer, RequestThrottle, Clock, Random) | none (pure; data reached through ports) | `#core/identity` — use cases `requestCode`, `verifyCode`, `resolveSession`, `signOut`; port and type definitions | src/adapters/d1, src/adapters/mail, src/adapters/switchboard, src/http, src/worker, tests/invariants |
| src/core/calling | Call rules: online/free, the single "not available" answer, call states (ringing, connected, ended) and end reasons, ring timeout 30 s, connect timeout 15 s, drop 10 s, collisions, newest-live-tab ringing, the client↔switchboard message protocol | none (pure) | `#core/calling` — `Switchboard` state reducer, message protocol types and codecs | src/adapters/switchboard, src/client, tests/invariants |
| src/adapters/d1 | D1 implementations of AccountStore, CodeStore, SessionStore, RequestThrottle (keyed-hash counters, D-025); migrations | tables `accounts`, `codes`, `sessions`, `request_counters`, `daily_totals` | `#adapters/d1` — `createD1Stores(db)` | src/worker, tests/invariants |
| src/adapters/mail | Mailer port over Cloudflare Email Service; a fake for tests | none | `#adapters/mail` — `createEmailServiceMailer(binding)`, `createFakeMailer()` | src/worker, tests/invariants |
| src/adapters/switchboard | The `Switchboard` Durable Object: WebSocket Hibernation sockets per tab, presence, call signalling — all in memory, never in Durable Object storage | in-memory live state only (online, busy, calls) | `#adapters/switchboard` — `SwitchboardObject` class | src/worker, tests/invariants |
| src/http | Hono app: sign-in pages and form posts, session cookie, the call page, the WebSocket upgrade route, static client bundle; English UI | none | `#http` — `createApp(deps)` | src/worker, tests/invariants |
| src/client | Browser bundle: WebSocket to the switchboard, WebRTC audio peer connection, microphone permission, call UI state | none | `#client` — built bundle only (served as a static asset) | none |
| src/worker | Composition root: reads bindings and secrets, builds adapters, injects into core and http; exports the Worker `fetch` and the Durable Object class | none | `#worker` — Worker default export, `SwitchboardObject` re-export | tests/invariants |

External boundaries (each a provider seam row at ratification 3):

- **Cloudflare Email Service** — sends the sign-in code email; talked to by
  `src/adapters/mail`.
- **STUN server `stun.cloudflare.com`** — lets two browsers find a direct
  path for voice; talked to by `src/client`.
- **TURN relay (Cloudflare Realtime TURN)** — `later` with REQ-028; talked to
  by `src/client` when it lands.

Laws:

- A module without a row here should not be committed to — add the row in the
  same commit.
- Cross-module access goes through the public-surface column only; reaching
  into another module's tables or internals is a defect — and, since v0.6, a
  rejected commit.
- The dependents column is the blast-radius map: a fix in module X re-grades
  X plus its declared dependents, not the whole product (/vid fix law).

## Where it runs

```vid-hosting
platform: cloudflare
region: global
staging: the platform's own (a workers.dev address)
production: call-by-identifier.josueayala.me
sending: no-reply@call-by-identifier.josueayala.me (domain call-by-identifier.josueayala.me)
spend-cap: 5 USD a month (Workers Paid plan)
access: cli-login cloudflare
dns-access: cli-login cloudflare
owner-only: wrangler login; setting the OPERATOR_EMAIL variable to the operator's own address; enabling Cloudflare Email Service sending for call-by-identifier.josueayala.me; setting the code-hashing secret value with wrangler secret put
providers: cloudflare-email-service: live-restricted on staging; stun.cloudflare.com: live-restricted on staging; cloudflare-realtime-turn: fake on staging (later)
```
