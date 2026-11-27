ticket: #3

Skeleton ticket S1: the walking skeleton.

Decisions:
- the entry is a Node script in src/worker (entry.mjs) that skips the migrations step until migrations/ holds a .sql file, binding name DB; the sign-in form posts to / with no handler yet, so no door opens before its row; pnpm allows build scripts for esbuild and workerd only
- the Worker exports no SwitchboardObject and declares no D1 or Durable Object binding yet | why: those adapters are outside this ticket's modules (src/worker, src/http); the step that brings them in adds the bindings and the export
- the sign-in form has no post handler in this ticket | why: no route opens before the step with a row behind it; the code-request step adds it
