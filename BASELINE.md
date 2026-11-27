# call-by-identifier — BASELINE

One page: what the stack IS, what it is NOT, and the rows that must never break.

## Stack

| Layer | Choice | FORBIDDEN alternatives (named) |
|---|---|---|
| Runtime | Cloudflare Workers, TypeScript (strict) | Node.js servers, Vercel Functions, AWS Lambda, Cloudflare Pages Functions |
| HTTP framework | Hono (with `hono/jsx` for server-rendered pages) | Express, Fastify, Koa, itty-router, Next.js |
| Architecture | Hexagonal: `src/core` (pure domain + ports) ← `src/adapters` (D1, mail, switchboard) ← `src/http` (Hono) ← `src/worker` (composition root) | Layered MVC, ORM-model-centric design, logic in route handlers |
| Accounts, sessions, codes, request counters, daily total | Cloudflare D1 (SQLite) through prepared SQL statements in `src/adapters/d1` | Prisma, Drizzle ORM, TypeORM, Sequelize, Neon/Postgres, Supabase, Firebase, Workers KV for accounts |
| Live state (online, busy, calls) | One Durable Object (`Switchboard`), in memory only, WebSocket Hibernation API; never written to Durable Object storage | Durable Object storage, D1, KV, Redis, Socket.IO, Pusher, Ably |
| Voice | Browser WebRTC (`RTCPeerConnection`), audio only, peer to peer; STUN `stun.cloudflare.com` | Video tracks, SFU/media servers, any encryption layer of the product's own (A-005), Twilio, Agora |
| Email | Cloudflare Email Service (Worker binding), sender `no-reply@call-by-identifier.josueayala.me` | Nodemailer, SendGrid, Mailgun, SMTP from the Worker |
| Client UI | Server-rendered Hono JSX + one vanilla TypeScript client bundle; plain CSS with design tokens | React, Vue, Svelte, Tailwind CSS, any SPA framework |
| Validation | Zod via `@hono/zod-validator` | Hand-rolled request parsing, Yup, Joi |
| Crypto | Web Crypto API (`crypto.getRandomValues`, HMAC-SHA-256, SHA-256) | bcrypt, jsonwebtoken (JWT sessions), Math.random for secrets |
| Tests | Vitest + `@cloudflare/vitest-pool-workers`; Playwright (Chromium, fake media devices) for browser call flows | Jest, Mocha, Cypress, Puppeteer |
| Tooling | pnpm, Wrangler, Node 22 (tooling only) | npm/yarn lockfiles, global installs |

## Module seams & data ownership

The seam table lives in ARCHITECTURE.md. Ownership law: each table/data store
is written by exactly one module; everyone else goes through that module's
public surface.

## Tier-0 rows

| Rule | Meaning |
|---|---|
| REQ-001 — the code is the only way in | Nobody is signed in without entering the code sent to their email; the first sign-in makes the account. |
| REQ-002 — codes cannot be guessed or reused | 6 digits, 10 minutes, once, dead after 5 wrong tries from its requesting address; only a newer code actually sent to the same address's request cancels it. |
| REQ-005 — only signed-in people call or are called | Signed-out visitors can neither ring anyone nor be rung; only the person called can answer. |
| REQ-007 — the call box reveals nothing | Unknown, offline and busy all give the same "not available"; no screen or response says whether an email has an account. |
| REQ-014 — no sound before Accept | No audio passes before the person called presses Accept, nor after a decline, cancel or hang-up. |
| REQ-021 — no call history anywhere | After a call ends no record, list or log — server, relay or error logs included — names a person in connection with it or links the two. |
| INV-001 — one call at a time | Each person is in at most one ringing or connected call; audio passes only in a connected call. |
| No credentials in the repo | No secret value (HMAC key, API token) in any committed file or test environment; names only. |

## Test environment

The ledger runs ONLY inside Docker: `sh checks/test.sh` → docker compose -f
docker-compose.test.yml. Workers code runs under `@cloudflare/vitest-pool-workers`
(local workerd, local D1, local Durable Objects); browser call flows run under
Playwright Chromium with fake microphone devices. No test process ever receives
real credentials; the mail adapter is faked in tests.

## Owner hints (verbatim)

- Design: i want something like notion/vercel
- Architecture/stack: arquitecture hexagonal please, and tech stack hono

## Machine blocks

Parsed by checks/conformance.sh at every commit. Extensions space- or
newline-separated. Forbidden terms one per line: dependency/import names that
must never appear in staged source additions — pick tokens that will not
legitimately occur in code or config otherwise.

```vid-allowed-extensions
.md .yml .yaml .sh .json .jsonc .lock .toml .ts .tsx .js .mjs .sql .css .html .svg .png .ico .txt
```

```vid-forbidden
'express'
"express"
fastify
itty-router
@prisma
drizzle-orm
typeorm
sequelize
mongoose
@neondatabase
@supabase
firebase
react-dom
socket.io
pusher-js
nodemailer
@sendgrid
tailwindcss
jsonwebtoken
bcrypt
twilio
agora-rtc
storage.put
storage.sql
storage.kv
```
