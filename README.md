# call-by-identifier

A tiny web app for one-to-one voice calls. Sign in with a one-time code sent to
your email, type another person's email, and call them. The call rings only
when that person is signed in, has the app open and is not on a call; they
accept or decline. Nothing about calls is kept. Built with Hono on Cloudflare
Workers, D1 and a Durable Object, in a hexagonal layout.

The spec is ratified (PRD.md, BASELINE.md, ARCHITECTURE.md, DECISIONS.md,
INVENTORY.md). There is no code yet: how to run it, how to test it
(`sh checks/test.sh`) and the preview command arrive with the code skeleton.

## Before you put this online

Not a framework. A sticky note. With /vid deploy, items 1, 2, 4 and 5 are
enforced structurally — the rest still matter.

1. Restore one backup before you trust backups — actually run the restore, once, end to end.
2. Redirect a week of outbound email to your own inbox first; read what the product sends.
3. Try one real feed/integration end-to-end before switching them all on.
4. Rotate any secret an agent ever saw — every key that was ever pasted into a session.
5. Agents never hold prod credentials. Deploys happen from your hands, not from a session.
6. Put a spending cap on every paid API and on the hosting account.
7. Check each Tier-0 row in BASELINE.md by hand once, in the real environment.
8. Keep a copy of PRD.md and DECISIONS.md somewhere off the server.
9. First week: read the logs daily. Boring logs are the goal.
10. When something is wrong, run /vid:vid-fix and answer its questions — don't patch by hand.
