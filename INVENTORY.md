# call-by-identifier — TEST INVENTORY

> Ratified at init, same standing as PRD.md: the owner ratified these ROWS —
> what will be verified — before any code existed. Mechanically derived from
> three enumerable sets (PRD requirements + Fail-ifs; design pack @screen
> markers via the resolved design-join table; the scaffold's route table via
> the ratified routes extractor), plus the auth-state × surface axis and the
> genus-row proposals (origin: domain). Rows are generated, never authored;
> only exceptions are hand-touched. Additions during development are
> permitted, never silent — checks/inventory.sh fails a commit whose new
> route has no row here, and every change to this block is a law change:
> a standalone commit, nothing else in it (pre-commit, §4.1). Development is
> "make the ledger green": every row below was materialised as a failing
> ledger test at init (proved red — the red gate), or carries
> `owed: <reason>` until its test can exist.

## Row schema

    ROW-NNN | kind | subject | actor/state | marker | obligation | derived-from | test

- `kind` — `surface` · `journey` · `shell` · `behavior` · `reachability`
- `subject` — route (`/account`, in the scaffold's own literal form), screen
  id, or requirement id
- `actor/state` — `anonymous` · `candidate` · `operator:<role>` · `n/a` ·
  `(process)` (v0.9.3 3.2, R3: a machine journey or a trigger row — the
  product acting on what enters at an external input boundary, with no
  person at a browser)
- `marker` — the design pack marker this row binds to (`P03/expired`), or `n/a`
- `obligation` — one falsifiable sentence a fresh-context grader can check
- `derived-from` — `REQ-NNN` and/or a design marker; never "authored"
- a **journey** row's obligation carries the narrative followed by
  `transitions:` — one numbered item per transition, `<actor> at <state>
  · <entry control> · <action> · <next state> · <observable effect>`
  (v0.9.2 3.5, R8); an `(off_screen)` phase stays in the narrative and is
  no transition. The row is paid per transition, in a real browser,
  operating the real control; setup may reach the starting state through
  the API or a fixture and never performs a transition; the verdict pass
  returns one verdict per transition and the row is KEPT only when every
  transition is.
- a **machine journey** (v0.9.3 3.2, R3) is a journey row with actor
  `(process)`: every external input boundary ARCHITECTURE.md declares
  (feeds, uploads, webhooks, scheduled pulls, inbound mail) × every
  observable consequence the PRD promises for what enters there
  (searchable, matched, notified, exported, expired, deleted); its
  `transitions:` are the stages as the PRD states them (enter · parse ·
  store · index · notify · expire), each with its observable effect; paid
  per stage at the boundary's real entry point, the external party played
  by the harness's fake (itself a `difference` row), never a browser.
- **the deployed population** (v0.9.3 3.3, R4): every row of kind
  `journey`, and every row whose actor is `(process)`, is paid by the close
  run's deployed pass — the product's declared processes running on the
  same image, nothing inline — and that report alone is its receipt (a row
  absent from it is red, whatever the inline report says). Scoped runs stay
  inline.
- `test` — path under tests/invariants/, or `owed: <reason>` (owed rows block
  completion — checks/inventory.sh --strict and checks/coverage.sh --strict).
  One owed reason has its own standing (v0.9.1 3.6): `owed: paid by /vid
  deploy gate <1|2|3> — <what the rung observes>` — a row whose obligation
  can only be observed through something the harness substitutes (a DIF
  row's paying step, a seam with `credentials: not-yet`, a deployed
  worker consuming a schedule). Reported as `deploy-owed`, outside the
  owed gaps; completion requires it present and named, never silently
  absent; it is paid only by that rung's evidence and stamped `| paid-at:
  gate-N <date> <deploy log row>` in a law commit. Any other shape in this
  field is a GAP, never silent — a typo'd path must not exit the evidence
  join.

  **Deferral is a closed vocabulary (v0.9.2 3.2, R3).** Under a block
  whose first line inside the fence is `grammar: 0.9.2` — or `grammar:
  0.9.3`, which carries every 0.9.2 rule — an owed reason
  reads `owed: <class> — <detail>`, the class one of the table below and
  the detail naming the missing dependency and its payment point; a legal
  word alone does not pass, and any other reason is a GAP at every commit
  (`unclassed deferral`, checks/inventory.sh). "Materialised when its
  surface exists", "lands with the screen's slice", "in the slice that
  builds the subject" are not classes: they describe a red test — a test
  against a missing route or marker IS a red test, and is written. A
  block without the line keeps the pre-0.9.2 reading (any reason,
  reported).

  | class | when it is legal | detail must name |
  |---|---|---|
  | `guard-first` | a hostility probe or control sibling whose guard does not exist yet | the protection row; paid in the slice that builds it |
  | `census-armed` | a rule row before any site exists; and a rule row during a sanctioned rule-shaped repair (every enumerated site being guarded — citing a test arms the census at once) | for the repair: `sites being guarded, fix <finding id>`; paid by the owed→path flip once every site is guarded |
  | `probe-capture` | a seam probe awaiting the capture | the seam id; paid before the first client line, or at deploy gate 2 (R15) |
  | `golden-set` | the row awaits its ratified golden set | the fixture path to be ratified |
  | `fixture-source` | a fixture from an external source not yet held | the source; when it is expected |
  | `prerequisite` | a fixture or interface contract the harness lacks (a test-author pass's `unwritable: missing prerequisite`) | what is missing; paid at which slice or boundary |
  | `spec-only` | a row ratified at a spec-only init whose test is not written yet (v0.26.10.9); develop's code skeleton writes it, or, in ticket mode, the ticket that carries it | exactly `first stage`; `ticket` for a row appended under ticket mode |
  | `owner-decision` | the existing visible-debt class | `OQ-n` |
  | `reverted` | **legacy** — written by 0.9.2's develop at the two-attempt bound; 0.9.3 never writes it (a row past the bound stays materialised and is held, below) and an upgraded project keeps the rows it has | the verdict's one-line reason, quoted |
  | `paid by /vid deploy gate <1\|2\|3>` | the v0.9.1 deploy-owed form above, verbatim | what the rung observes (its own `deploy-owed=N` and `paid-at:` semantics, never re-classed) |

  The par (v0.9.2 R4): checks/inventory.sh prints `par: rows=R
  materialised=N legitimate=K (by class) deploy-owed=D other=J` under the
  line, and the red gate fails while `J > 0` or `N + K + D ≠ R` — every
  row is materialised or legitimately deferred, and the count of
  legitimate deferrals is printed at the gate. A surface row may be
  deferred ONLY as `prerequisite` naming a harness fixture the state
  needs and the harness lacks; a missing route, a 404 or a missing
  marker is a failing case of the surface instrument, never a deferral.

**A row's verdicts (v0.9.3 3.6, 3.7; R8–R11).** Under `grammar: 0.9.3` a
materialised row is ledger-tested only when its cases pass in the current
receipt AND its latest verdict is KEPT (`checks/coverage.sh --strict`,
per row, whatever the row derives from). KEPT means the promise holds in
the product AND the test observes it. BREACHED carries its class:
`product` (the product violates the Fail-if), `test` (the test cannot
observe the promise — it asserts what was already true, stops before the
effect, binds the wrong boundary) or `harness` (the instrument failed); a
row whose transitions differ takes `product` if any transition's latest
breach is, else `test`, else `harness`. A `test` or `harness` breach costs
no attempt and leaves the row `unverdicted` until a fresh verdict. Rounds,
attempts and holds are computed from the verdict events by
`checks/metrics.sh`, never written: two `product` rounds since the row's
latest KEPT, reissue or amendment hold it (`reason=bound`), two `test`
rounds likewise (`reason=test`), two `harness` rounds with no harness
repair between them (`reason=harness`). A held row stays materialised —
this field unchanged, no law commit — counts `breached`, is left out of
the automatic claim and waits for the owner; an owner answer
(`reissued`), an amendment, or a KEPT from a fix's blind re-grade releases
it. An amended obligation, or a changed `fail-if:` of the item a row
derives from, wipes the row's verdicts and its attempt history
(`checks/hooks/post-commit` records `amended row=ID sha=<commit>`); a
verdict quoted before the amendment does not count.

Every row may carry optional trailing labeled fields, in any order:

- `| origin: REQ-NNN | domain | finding-NNN | derivation <date>` — provenance:
  which requirement, genus-row proposal, grade finding, or re-derivation
  sitting produced the row. `| origin: incorporation <date> D-NNN` — the decision line an incorporation (/vid:vid-incorporate) added; a rule row names its REQs after it.
- `| paid-at: gate-N <date> <deploy log row>` — on a deploy-owed row, the
  rung that paid it (v0.9.1 3.6); written by /vid deploy, never by a
  sandbox run.
- `| proved-red: <commit-sha>` — the commit at which the row's test was
  observed failing (§3.6). Init stamps it for materialised rows; a test added
  later records the parent commit where it was red. A row test with no
  proved-red has the same standing as `owed` — an unproved test is not
  evidence, and checks/inventory.sh counts it accordingly. The stamp is
  joined, not merely present (v0.8.1d): the sha must resolve, the cited
  file must exist at it, and the file there must name the row (its ROW id
  or its `derived-from` REQ id) — a sha at which the test was never red
  is a GAP. Cited test paths resolve against the commit under construction
  (the staged index, then HEAD), never the working tree: the rhythm is
  test (free ledger addition, observed red) → row (law commit, stamped with
  the parent) → code.
- `| golden: tests/invariants/<fixture>` and `| divergence: DIF-NNN` —
  on a row derived from a `derives: golden-set` item: the ratified golden
  set the row's test reads (one line per query: `query | must-appear |
  must-outrank | must-not-appear`, proposed by a fresh-context lens, never
  by the build or tuning context), and the difference row that legalises
  a model or engine divergence on that path. A named DIF must exist and
  carry a `paying-step:` (below) — checks/inventory.sh joins the two.

**Row shapes with no new class (v0.8.1d).** One row per independently
breakable promise of a requirement's complete block — the ROW is the
atomic unit, no sub-ids. A **trigger-existence row** (kind `behavior`,
subject the item, actor `(process)` under `grammar: 0.9.3` — so the
deployed pass pays it) for every time-worded Fail-if. A **volume row** per
list surface once a scale item exists. A **control sibling** of every
guard/never row — the allowed case demonstrably works, effect observed —
an ordinary ROW, `derived-from` the same REQ, obligation opening
`control of ROW-NNN: …`. **Property-form rows** through the public
surface: many-input datasets, and the four invariance relations —
reorder-invariance, rename-invariance of aggregates, repeat-idempotence,
unrelated-state-unchanged — each a falsifiable predicate over the
product's own outputs, never a reference implementation.

**Two tiers.** `tests/invariants/` is the ledger and the only tier rows
cite. `tests/scaffolding/` is the builder's non-law tier: implementation-
keyed instruments, never cited, never evidence, outside the coverage join,
proved-red, the extractors and the deletion tripwire; deletable without a
law commit; never run by the gate. Every fixture file under `tests/`
opens with a one-line `Provenance:` header — `hand-authored`, `captured
from <seam probe>`, or `generated by <generator path under tests/>` — so
a fixture whose expected value the system under test produced (circular)
is visible to the vacuity extractor.

## Census row classes (v0.7 — read by checks/census.sh)

    rule       | RULE-NNN | statement | census-command | tier | test
    difference | DIF-NNN  | knob | test-value | prod-value | why-safe [| paying-step: <rung> — <what re-runs against the real component>]
    exception  | EXC-NNN  | subject | census-class | why-rule-does-not-apply
    suppression| SUP-NNN  | subject | census-class | extractor-gap | fix-by

- A **rule** row's census command is its denominator — it enumerates every
  site the rule applies to; new code that adds a site is automatically in
  scope on the next run. Three forms: a ratified extractor path
  (`checks/extractors/invariant.<name>.sh`); two enumerations
  `<sites-cmd> :: <guarded-cmd>` (orphans = left minus right); or a single
  enumeration (a pure denominator the row's ledger test asserts over). The
  command may contain pipes; the statement field may not. An empty
  population is a FAILURE, never a pass (zero-denominator guard) — except
  while the rule's test is still `owed:`, when orphans AND an empty
  population report `pending` (ratified, not yet armed); materialising the
  test arms the census fail-closed.
- **State-machine variant (v0.8, §6.1).** A rule row whose statement field
  begins `state-machine <field>:` declares a transition table and is the
  landing spot for a lifecycle decision (publication status, alert
  lifecycle, consent):

      rule | RULE-NNN | state-machine <field>: draft>published published>archived | census-command | tier | test

  The declared transitions are the field's whole legal vocabulary
  (space-separated `from>to` pairs; a bare token declares a state with no
  transition, e.g. an initial state nothing transitions into). The census
  command enumerates every site that mutates or guard-reads the field,
  one line per site: `<site> <from>><to>` for a mutation, `<site> <state>`
  for a guard read. The engine convicts any site whose transition is not
  declared or whose state is outside the vocabulary — fail-closed, naming
  the site (grade brief instruction: find a state mutation outside the
  declared table). Zero-denominator, debt-awareness, and the population=1
  flag apply as for any rule row.
- A **difference** row is the only legal way for a knob to differ between
  test and prod. The census prints the full divergence table every run —
  the owner sees exactly what the green ledger did NOT validate. Every
  fake the harness substitutes is a divergence by construction — derived
  at materialisation, never waited for. A DIF that legalises a model or
  engine divergence on a golden-set item's path carries `paying-step:` —
  the deploy rung and the re-run that pays it (the golden set against
  the real component): a deferred test with a named step, never a
  permanent shrug. **The paying step `close run, profile=deployed`**
  (v0.9.3 3.3): a difference whose knob is the inline switch, a scheduler
  stand-in or the absent workers is paid by the close run's deployed pass,
  locally, and its deploy gate-2 sibling stays, narrowed to the platform
  half ("the platform's worker consumes it"); a knob whose real component
  exists only on the platform keeps `paying-step: staging`.
- An **exception** says the rule genuinely does not apply to this subject.
  Exceptions count toward the complexity law's ceremony threshold
  (CLAUDE.md §2): a rule whose exception list exceeds ~15–20% of its
  population is ceremony and is deleted.
- A **suppression** says the rule applies but the extractor cannot yet see
  the site — it never counts toward deletion and stands as a to-do against
  the extractor, printed every run. `census-class` in exception and
  suppression rows names the extractor class (`dead-path`, `divergence`,
  `reachability`, `vacuity`) for extractor orphans, and MUST name the
  specific `RULE-NNN` for a rule row's orphans — the class word is not a
  skeleton key across rules.

## Provider seam rows (v0.8 — read by checks/seams.sh)

    seam | SEAM-NNN | service | purpose | chosen: D-NNN | credentials: <held|not-yet|never> | probe: <owed | probed(YYYY-MM-DD) | unreachable-risk(reason)> | evidence: <contract-test path + captured-response path, or owed> | quirks: <one per ";", or "none yet"> [| module: <module id>] [| place: dev]

- One row per EXTERNAL service the product depends on — payments, mail,
  feeds, search, auth, storage: anything on the other side of the network
  this repo does not own. Two discovery doors (§3.2): init's architecture
  step declares known seams (an external boundary without a row cannot be
  ratified), and checks/seams.sh rejects a staged outbound destination no
  row covers — discovery is mechanical, not remembered.
- **Born owing a probe** — same debt semantics as every other row. Two
  legal exits: pay it (`probe: probed(date)`) or declare
  `unreachable-risk(reason)` with the reason stated. Never silent coverage.
- **The probe (§3.3) comes before the first client line:** the smallest
  real calls that answer the questions — never discover a limit by
  exceeding it (that is load-testing someone else's service; where docs
  are silent, chunk conservatively). Observed shapes, error semantics, and
  identifier-namespace behavior are written into the contract tests the
  evidence field names; the captured response becomes those tests' sample
  data — the surviving, shape-scoped form of fixture provenance. Contract
  tests are ledger additions (free) and are how the probe is paid; the row
  flip `owed → probed(date)` is a law change, standalone.
- Routing per the two-channel rule: a technical quirk is logged in the
  quirks field and pinned by a contract test; a quirk touching product
  meaning ("empty response cannot be distinguished from a broken feed")
  goes to the owner as a product question, never a silent log line.
- Optional `| module: <module id>` names the module of ARCHITECTURE.md's
  module table that talks to the service (its Module column, a dotted
  label read as a path). The project viewer lists the service among that
  module's contracts; no court reads it.
- Optional `| place: dev` (needs `credentials: held`) says the developers
  can reach the service from where they work, with credentials of their
  own, so its one real action is a test of the step that first builds
  against it. Only ticket mode reads it (checks/planner.sh); develop and
  every other court do as without it. Absent, the service is checked on
  the test site, at deploy gate 2.
- Optional trailing `| match: <tokens>` names the greppable tokens that
  identify code touching this seam (client-library import names,
  hostnames, space-separated). Absent, the service field is the match
  token. Pick tokens that will not legitimately occur otherwise — the
  vid-forbidden rule, applied here.
- checks/seams.sh (presence-gated, fail-closed): app-source additions
  matching an OWED seam's tokens are rejected naming the row (tests/ is
  exempt — contract tests are the probe's own artifact); a staged outbound
  destination covered by no seam row demands one before the code lands. A
  destination that is content, not an outbound call (a footer link), takes
  an exception row naming class `seam`.
- The grade brief carries this table with a standing instruction — find a
  behavior of this service the probe did not pin. vid-deploy's "one real
  action per provider seam" gate is these rows' re-verification, not a
  separate concept.

## Hostility rows (v0.8 §4 — read by checks/inventory.sh)

    hostility | HOS-NNN | attempt | protects: <RULE-NNN|REQ-NNN|ROW-NNN> | disable: <toggle> | test [| proved-red: <sha>]

- One row per **Tier-0 protection**, and for a Tier-0 requirement one per
  fail-if arm and, per arm, one per way in that reaches its subject (the
  bounded set, below): the sibling of a ratified Tier-0 rule
  row (`tier` = 0) or Tier-0 requirement, which *attempts the forbidden
  thing* against the locally running app through its real public surface,
  in the same Docker-only harness as every other ledger test. Reads confirm
  a guard is present and correct; only an attempt establishes that it
  holds. The measured class: a correct publication guard defeated by a
  different path erasing the state it read, and a rate-limit bound defeated
  by one rotated client-identity header — both present, both correct, both
  bypassed. The must-never-happen list, executed instead of trusted.
- `attempt` — one falsifiable sentence naming the forbidden thing the probe
  commits, never the guard it hopes to meet ("submit the same form twice
  concurrently, expect exactly one record", not "double-submit is guarded").
- `protects:` — the ratified protection this row is a sibling of: a
  Tier-0 rule row, a Tier-0 requirement, or a Tier-0 ROW (a ratified genus
  protection — the court resolves a ROW target to its REQ). Absent,
  the row is a sibling of nothing and is rejected.
- `disable:` — the named, reversible way that protection is turned OFF so
  the probe can be watched failing. Required; `none` and `n/a` are not
  values. It is a LOCAL mutation performed at materialisation and reverted
  in the same sitting (remove the guard clause, build without it) — never a
  runtime switch that ships. A guard with a production kill-switch is not a
  guard; the toggle is written down so the ritual can be re-run, not so the
  product can be unlocked.
- `test` — path under tests/invariants/, or `owed: <reason>`, as for any row.
- `proved-red:` is **mandatory** here, not optional as it is for a ROW row:
  a cited probe test with no proved-red is a GAP, not debt. A probe never
  observed failing is not evidence, and unlike an ordinary row it is
  evidence with the polarity that reassures.

### The bounded set

Derived mechanically from the ratified Tier-0 protections, never invented:
one probe per Tier-0 rule or invariant; for a Tier-0 requirement, one per
fail-if arm (as `checks/prd.sh` splits them) and, per arm, one per way in
that reaches its subject — the design's screens, each journey's entry
control, every input boundary ARCHITECTURE.md declares — the way in named
in the `attempt` sentence (0.26.10.29.4 phase 3, R3). checks/inventory.sh
prints `NOTE  REQ-n — <a> arms, <p> probes` for a requirement that fewer
rows protect than it has arms, counted as `arm-probes=<n>` on its
`inventory notes:` line; never owed. A fixed
list — explicitly not a fuzzer, not a scanner, no generated or open-ended
input exploration. Probes beyond the ratified protections are ceremony and
are deleted under the complexity law; the way to add one is to ratify the
protection it is the sibling of. The shapes these protections take,
stated as behavior so they carry to any stack:

- concurrent double-submit of the same action → exactly one record
- a replayed one-time link or token → exactly one effect, one timestamp
- a valid session for actor A requesting actor B's resource → refused, with
  an audit entry
- a transition attempted out of a state that forbids it (reject, then
  publish) → refused, whichever path sets the state
- a rotated client-identity header against a rate limit → the bound holds
- refresh mid-flow, expired-form resubmit, stale-state action → no double
  effect
- **dependency failure during the protected operation** (v0.8.1d): the
  seam the operation touches fails mid-way → the forbidden effect does
  not occur and the failure is recorded, never a silent success; the
  `disable:` toggle is the fail-closed handling itself (the measured
  class: an erasure that failed open when its store was down, whose probe
  counted residue through the pointer it had just blanked)
- **concurrency against the protected operation** (v0.8.1d): two
  simultaneous attempts → exactly one effect; the toggle is the
  serialisation guard

### The fail-first ritual (mandatory, §4.2)

A hostility probe passing proves nothing until it has been watched failing:
"refused" is equally green when the attempt was malformed and never reached
the guard at all. At materialisation, in one sitting, per probe:

1. **Prove the runner can go red** — invoke it with a selector naming a test
   that does not exist. Runners commonly exit 0 on a selection that matches
   nothing; wired that way, every probe below is a green that can never go
   red, which is worse than no probe at all. If it exits 0, fix the
   invocation before any probe is trusted.
2. **Disable** the protection by the row's own `disable:` toggle and run the
   probe. It MUST fail, and fail on its assertion about the forbidden effect
   — not on a connection error, a 404, or a fixture fault. A red for the
   wrong reason is the same false assurance in the other direction.
3. **Restore** the protection and run the probe. It MUST pass.
4. **Stamp** `proved-red: <sha>` — the commit at which step 2 was observed.

A probe with no verified failing state is REJECTED at materialisation: the
row stays `owed:` until the ritual is performed. checks/inventory.sh
enforces the mechanical half — a missing `protects:`, a missing or `none`
`disable:` toggle, and a cited test with no `proved-red` are GAPs that fail
the commit; a Tier-0 rule row with no hostility sibling is owed debt that
blocks completion (`--strict`); a ROW a hostility row's `protects:` names
by its ROW id, with no control sibling, is a NOTE, counted on its own line
(`inventory notes: control-siblings=<n>`) and never owed (0.26.10.29.3,
R5). The honesty of steps 1–3 is the builder's,
and the row is what the graders read.

Granularity is **screen × state** — the zero-results, expired, and error
variants are where gaps hide. Mandatory row classes, generated, not
judged: (1) every drawn screen × state, one surface row per applicable auth
state; (2) every requirement with a Fail-if, one behavior row; (3) **the
shell** in each auth state — header, footer, primary nav, error pages, empty
states; (4) reachability — every required surface reachable from an entry
point in its auth state, every default-navigation link resolves, a session
implies a sign-out control, no anonymous-only control shown authenticated or
vice versa; (5) every critical PRD journey end-to-end, one row each.

Browser-class rows (shell, reachability, journeys, the surface
instrument) are ledger tests in the engines the harness contract declares,
inside the container-only harness. **The sizing is law (v0.9.2 3.4,
R7):** ~5 shell rows + ~10 journey rows + one instrument for all screens
— written, for new projects, as a ledger test file per screen (its states
together, up to 5 rows a file; v0.9.8.1 R18), every file through the one
measure module, produced by the surface test-author pass
from the rows, the canvases and the measure module, one case per surface
row (screen × state × auth state), loading each state once per engine,
reading every load-bearing paint property in one evaluate, checking the
state's content, stray controls (the denominator: the whole page minus
the shell) and console errors, then the row's `pins:` hook on that same
loaded page. Surface rows cite their screen's file (its head carries the
row table); a surface test, or a pins hook, written by the builder is a
defect. Other new test files hold one row, or up to 5 related rows.

## Rows

```vid-inventory
grammar: 0.9.3
ROW-001 | behavior | REQ-001 | anonymous | n/a | this never happens: a person is signed in without entering the code sent to their email | REQ-001 | owed: spec-only — first stage | origin: REQ-001
ROW-002 | behavior | REQ-001 | anonymous | n/a | this never happens: a working code entered in time does not sign the person in, while their network address is under its hourly wrong-try limit | REQ-001 | owed: spec-only — first stage | origin: REQ-001
ROW-003 | behavior | REQ-001 | anonymous | n/a | this never happens: a first-time email that enters its code has no account and cannot call or be called | REQ-001 | owed: spec-only — first stage | origin: REQ-001
ROW-004 | behavior | REQ-002 | anonymous | n/a | this never happens: a code signs someone in more than 10 minutes after it was sent | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-005 | behavior | REQ-002 | anonymous | n/a | this never happens: a code signs someone in a second time | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-006 | behavior | REQ-002 | anonymous | n/a | this never happens: a code still signs someone in after 5 wrong tries against it from the network address that requested it | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-007 | behavior | REQ-002 | anonymous | n/a | this never happens: an earlier code still signs someone in after a newer one was sent for the same email at the request of the same network address — network address means the edge-reported client address, IPv6 counted per /64 | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-008 | behavior | REQ-002 | anonymous | n/a | this never happens: a code is not 6 digits | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-009 | behavior | REQ-003 | signed-in | n/a | this never happens: a session still lets someone call or be called more than 30 days after sign-in | REQ-003 | owed: spec-only — first stage | origin: REQ-003
ROW-010 | behavior | REQ-003 | signed-in | n/a | this never happens: using the app pushes the session's end past 30 days from sign-in | REQ-003 | owed: spec-only — first stage | origin: REQ-003
ROW-011 | behavior | REQ-003 | signed-in | n/a | this never happens: after sign-out the same browser can still call or be called without a new code | REQ-003 | owed: spec-only — first stage | origin: REQ-003
ROW-012 | behavior | REQ-003 | signed-in | n/a | this never happens: a signed-in person cannot end their own session with a sign-out button | REQ-003 | owed: spec-only — first stage | origin: REQ-003
ROW-013 | behavior | REQ-004 | anonymous | n/a | this never happens: the same email typed in different letter case signs into two different accounts | REQ-004 | owed: spec-only — first stage | origin: REQ-004
ROW-014 | behavior | REQ-004 | signed-in | n/a | this never happens: a call to an email typed with upper case letters does not reach the account of its lowercase form | REQ-004 | owed: spec-only — first stage | origin: REQ-004
ROW-015 | behavior | REQ-004 | anonymous | n/a | this never happens: an account's email is stored with an upper case letter | REQ-004 | owed: spec-only — first stage | origin: REQ-004
ROW-016 | behavior | REQ-004 | anonymous | n/a | this never happens: an account exists without an email | REQ-004 | owed: spec-only — first stage | origin: REQ-004
ROW-017 | behavior | REQ-005 | anonymous | n/a | this never happens: a signed-out visitor can start a call or make anyone's app ring; and this must always hold: also with an expired session cookie, a signed-out session cookie and a random cookie value | REQ-005 | owed: spec-only — first stage | origin: REQ-005
ROW-018 | behavior | REQ-005 | signed-in | n/a | this never happens: a person with no session counts as online and can be rung; and this must always hold: also after sign-out in another tab of the same browser: that browser's other tabs stop ringing and their sockets close | REQ-005 | owed: spec-only — first stage | origin: REQ-005
ROW-019 | behavior | REQ-005 | signed-in | n/a | this never happens: anyone other than the person called can accept or decline the call | REQ-005 | owed: spec-only — first stage | origin: REQ-005
ROW-020 | behavior | REQ-005 | signed-in | n/a | this never happens: a signed-in, online, free person is refused calling or being called; and this must always hold: after each of the five end reasons the same two people can call each other at once and it rings | REQ-005 | owed: spec-only — first stage | origin: REQ-005
ROW-021 | behavior | REQ-006 | signed-in | n/a | this never happens: a call rings a person who is offline | REQ-006 | owed: spec-only — first stage | origin: REQ-006
ROW-022 | behavior | REQ-006 | signed-in | n/a | this never happens: a call rings a person who is already on a call | REQ-006 | owed: spec-only — first stage | origin: REQ-006
ROW-023 | behavior | REQ-006 | signed-in | n/a | this never happens: a call from a free caller with microphone access to another person who is online and free does not ring | REQ-006 | owed: spec-only — first stage | origin: REQ-006
ROW-024 | behavior | call input screen | signed-in | n/a | at the call input screen: none of these happens — (1) the caller sees a different message, wording or screen for an email with no account than for an offline person; (2) the caller can tell a busy person from an offline one; (3) any screen or server response tells the caller whether an email has an account; and this must always hold: the answer time does not separate the cases | REQ-007 | owed: spec-only — first stage | origin: REQ-007
ROW-025 | behavior | call request response | signed-in | n/a | at the call request response: none of these happens — (1) the caller sees a different message, wording or screen for an email with no account than for an offline person; (2) the caller can tell a busy person from an offline one; (3) any screen or server response tells the caller whether an email has an account; and this must always hold: the answer time does not separate the cases | REQ-007 | owed: spec-only — first stage | origin: REQ-007
ROW-026 | behavior | realtime presence channel | signed-in | n/a | at the realtime presence channel: none of these happens — (1) the caller sees a different message, wording or screen for an email with no account than for an offline person; (2) the caller can tell a busy person from an offline one; (3) any screen or server response tells the caller whether an email has an account | REQ-007 | owed: spec-only — first stage | origin: REQ-007
ROW-027 | behavior | REQ-008 | signed-in | n/a | this never happens: a person can ring themselves; and this must always hold: also when the own email is typed in mixed case | REQ-008 | owed: spec-only — first stage | origin: REQ-008
ROW-028 | behavior | REQ-008 | signed-in | n/a | this never happens: calling your own email shows anything other than the "not available" message | REQ-008 | owed: spec-only — first stage | origin: REQ-008
ROW-029 | behavior | REQ-009 | signed-in | n/a | this never happens: a person counts as online more than 30 seconds after their last tab closed or lost its connection; tested with a connection frozen without closing, not only a clean close | REQ-009 | owed: spec-only — first stage | origin: REQ-009
ROW-030 | behavior | REQ-009 | signed-in | n/a | this never happens: a signed-in person with the app open and connected counts as offline | REQ-009 | owed: spec-only — first stage | origin: REQ-009
ROW-031 | behavior | REQ-010 | signed-in | n/a | this never happens: one person's app rings with two incoming calls at once | REQ-010 | owed: spec-only — first stage | origin: REQ-010
ROW-032 | behavior | REQ-010 | signed-in | n/a | this never happens: two people calling each other at the same moment both ring or neither does | REQ-010 | owed: spec-only — first stage | origin: REQ-010
ROW-033 | behavior | REQ-010 | signed-in | n/a | this never happens: a second caller reaching a ringing person hears ringing instead of "not available" | REQ-010 | owed: spec-only — first stage | origin: REQ-010
ROW-034 | behavior | REQ-011 | signed-in | n/a | this never happens: an incoming call does not show the caller's email | REQ-011 | owed: spec-only — first stage | origin: REQ-011
ROW-035 | behavior | REQ-011 | signed-in | n/a | this never happens: the person called cannot accept the ringing call or cannot decline it from the ringing screen | REQ-011 | owed: spec-only — first stage | origin: REQ-011
ROW-036 | behavior | REQ-011 | signed-in | n/a | this never happens: the incoming call shows anything about the caller beyond their email | REQ-011 | owed: spec-only — first stage | origin: REQ-011
ROW-037 | behavior | REQ-014 | signed-in | n/a | this never happens: either person hears the other before the person called presses Accept | REQ-014 | owed: spec-only — first stage | origin: REQ-014
ROW-038 | behavior | REQ-014 | signed-in | n/a | this never happens: audio keeps passing after a decline, a cancel or a hang-up | REQ-014 | owed: spec-only — first stage | origin: REQ-014
ROW-039 | behavior | REQ-015 | signed-in | n/a | this never happens: after Accept either person cannot hear the other's own voice; tested with a distinct fake audio source per browser, each side receiving the other's source and never its own | REQ-015 | owed: spec-only — first stage | origin: REQ-015
ROW-040 | behavior | REQ-015 | signed-in | n/a | this never happens: the call turns on a camera or sends any video; and this must always hold: no video track is ever captured, not only never sent | REQ-015 | owed: spec-only — first stage | origin: REQ-015
ROW-041 | behavior | REQ-016 | signed-in | n/a | this never happens: a person in an accepted call cannot end it with one hang-up press | REQ-016 | owed: spec-only — first stage | origin: REQ-016
ROW-042 | behavior | REQ-016 | signed-in | n/a | this never happens: after one person hangs up the other is still in the call | REQ-016 | owed: spec-only — first stage | origin: REQ-016
ROW-043 | behavior | REQ-017 | signed-in | n/a | this never happens: a call keeps ringing more than 30 seconds without an answer | REQ-017 | owed: spec-only — first stage | origin: REQ-017
ROW-044 | behavior | REQ-017 | signed-in | n/a | this never happens: after the ring times out the caller sees anything but "no answer" | REQ-017 | owed: spec-only — first stage | origin: REQ-017
ROW-045 | behavior | REQ-017 | signed-in | n/a | this never happens: the caller cannot cancel a ringing call | REQ-017 | owed: spec-only — first stage | origin: REQ-017
ROW-046 | behavior | REQ-017 | signed-in | n/a | this never happens: after a cancel the person called keeps ringing | REQ-017 | owed: spec-only — first stage | origin: REQ-017
ROW-047 | behavior | REQ-018 | signed-in | n/a | this never happens: a call stays open more than 10 seconds after one person's connection dropped; tested with a connection frozen without closing, not only a clean close | REQ-018 | owed: spec-only — first stage | origin: REQ-018
ROW-048 | behavior | REQ-018 | signed-in | n/a | this never happens: the person left behind is still shown as in a call afterwards | REQ-018 | owed: spec-only — first stage | origin: REQ-018
ROW-049 | behavior | REQ-018 | signed-in | n/a | this never happens: a dropped person can rejoin the same call | REQ-018 | owed: spec-only — first stage | origin: REQ-018
ROW-050 | behavior | REQ-019 | signed-in | n/a | this never happens: after a call ends or fails a person is left on a screen with no way back to the call input | REQ-019 | owed: spec-only — first stage | origin: REQ-019
ROW-051 | behavior | REQ-019 | signed-in | n/a | this never happens: the caller of a declined call is not told it was declined | REQ-019 | owed: spec-only — first stage | origin: REQ-019
ROW-052 | behavior | REQ-019 | signed-in | n/a | this never happens: the end message names a reason other than what happened | REQ-019 | owed: spec-only — first stage | origin: REQ-019
ROW-053 | behavior | REQ-020 | signed-in | n/a | this never happens: a call record still exists after the call ended; and this must always hold: no ended call id is kept anywhere in switchboard memory | REQ-020 | owed: spec-only — first stage | origin: REQ-020
ROW-054 | behavior | REQ-020 | signed-in | n/a | this never happens: a call reaches a state outside ringing, connected and ended | REQ-020 | owed: spec-only — first stage | origin: REQ-020
ROW-055 | behavior | REQ-020 | signed-in | n/a | this never happens: a call ends without one of the five end reasons | REQ-020 | owed: spec-only — first stage | origin: REQ-020
ROW-056 | behavior | app screens | n/a | n/a | at the app screens: none of these happens — (1) after a call ends, any stored record, list or log, server, relay and error logs included, names either person in connection with that call, or lets the two people be linked across entries by a call id, an address or a time; (2) the app shows any past or missed call | REQ-021 | owed: spec-only — first stage | origin: REQ-021
ROW-057 | behavior | server records | n/a | n/a | at the server records: none of these happens — (1) after a call ends, any stored record, list or log, server, relay and error logs included, names either person in connection with that call, or lets the two people be linked across entries by a call id, an address or a time; (2) the app shows any past or missed call | REQ-021 | owed: spec-only — first stage | origin: REQ-021
ROW-058 | behavior | server logs | n/a | n/a | at the server logs: none of these happens — (1) after a call ends, any stored record, list or log, server, relay and error logs included, names either person in connection with that call, or lets the two people be linked across entries by a call id, an address or a time; (2) the app shows any past or missed call | REQ-021 | owed: spec-only — first stage | origin: REQ-021
ROW-059 | behavior | relay server logs | n/a | n/a | this never happens: the first version configures a relay server or sends call traffic through one, so no relay log can exist before the relay is built | REQ-021 | owed: spec-only — first stage | origin: REQ-021
ROW-060 | behavior | error logs | n/a | n/a | at the error logs: none of these happens — (1) after a call ends, any stored record, list or log, server, relay and error logs included, names either person in connection with that call, or lets the two people be linked across entries by a call id, an address or a time; (2) the app shows any past or missed call | REQ-021 | owed: spec-only — first stage | origin: REQ-021
ROW-061 | behavior | REQ-022 | signed-in | n/a | this never happens: a call starts or is accepted with no microphone access | REQ-022 | owed: spec-only — first stage | origin: REQ-022
ROW-062 | behavior | REQ-022 | signed-in | n/a | this never happens: a person who refused the microphone is not told why the call did not start | REQ-022 | owed: spec-only — first stage | origin: REQ-022
ROW-063 | behavior | REQ-022 | signed-in | n/a | this never happens: the microphone is asked for before any call | REQ-022 | owed: spec-only — first stage | origin: REQ-022
ROW-064 | behavior | REQ-023 | anonymous | n/a | this never happens: a failed send still tells the person a code was sent | REQ-023 | owed: spec-only — first stage | origin: REQ-023
ROW-065 | behavior | REQ-023 | anonymous | n/a | this never happens: two codes are sent to one email less than 60 seconds apart | REQ-023 | owed: spec-only — first stage | origin: REQ-023
ROW-066 | behavior | REQ-023 | anonymous | n/a | this never happens: more than 5 codes are sent to one email within an hour at the request of one network address; and this must always hold: the hour is a rolling 60 minutes, so requests crossing a clock hour are still counted together | REQ-023 | owed: spec-only — first stage | origin: REQ-023
ROW-067 | behavior | REQ-023 | anonymous | n/a | this never happens: requests for an email from another network address are refused only because one address reached its hourly limit | REQ-023 | owed: spec-only — first stage | origin: REQ-023
ROW-068 | behavior | page delivery | n/a | n/a | at the page delivery: none of these happens — (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | REQ-024 | owed: spec-only — first stage | origin: REQ-024
ROW-069 | behavior | call setup channel | n/a | n/a | at the call setup channel: none of these happens — (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | REQ-024 | owed: spec-only — first stage | origin: REQ-024
ROW-070 | behavior | session cookie | n/a | n/a | at the session cookie: none of these happens — (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | REQ-024 | owed: spec-only — first stage | origin: REQ-024
ROW-071 | behavior | code storage | n/a | n/a | at the code storage: none of these happens — (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | REQ-024 | owed: spec-only — first stage | origin: REQ-024
ROW-072 | behavior | REQ-029 | n/a | n/a | this never happens: storage holds any personal data beyond email, creation date, sessions, codes and hashed request counters; and this must always hold: tables hold only email, creation and expiry times, hashed code or session value, the try count, the keyed hash of the requesting address, keyed-hash request and wrong-try counters and the daily total: no network address, user agent or name in plain form | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-073 | behavior | REQ-029 | n/a | n/a | this never happens: online, busy or call state is written to storage, or a counter older than one hour survives the next cleanup run, holds a plain email or address, or holds a hash computable without a key kept apart from the counters | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-074 | behavior | REQ-029 | n/a | n/a | this never happens: a used or expired code or an ended session is still stored; checked after the cleanup run, which runs at least every 15 minutes | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-075 | behavior | REQ-029 | n/a | n/a | this never happens: an account has no recorded creation date; and this must always hold: the creation date equals the first sign-in and never changes; later sign-ins keep other browsers' sessions | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-076 | behavior | REQ-030 | anonymous | n/a | this never happens: the product sends anyone other than the operator an email they did not ask for | REQ-030 | owed: spec-only — first stage | origin: REQ-030
ROW-077 | behavior | REQ-030 | anonymous | n/a | this never happens: the product sends anyone other than the operator any email other than a sign-in code | REQ-030 | owed: spec-only — first stage | origin: REQ-030
ROW-078 | behavior | REQ-031 | signed-in | n/a | this never happens: the caller keeps ringing or sits in a silent call after the person called refused the microphone at Accept | REQ-031 | owed: spec-only — first stage | origin: REQ-031
ROW-079 | behavior | REQ-031 | signed-in | n/a | this never happens: a call whose voice never connects stays open for either person more than 15 seconds after Accept | REQ-031 | owed: spec-only — first stage | origin: REQ-031
ROW-080 | behavior | REQ-031 | signed-in | n/a | this never happens: in these cases the caller sees anything but "call ended" | REQ-031 | owed: spec-only — first stage | origin: REQ-031
ROW-081 | behavior | REQ-031 | signed-in | n/a | this never happens: the person called who refused the microphone or has none is not told the microphone is needed | REQ-031 | owed: spec-only — first stage | origin: REQ-031
ROW-082 | behavior | REQ-031 | signed-in | n/a | this never happens: after a voice timeout with the microphone granted, the person called sees the microphone message | REQ-031 | owed: spec-only — first stage | origin: REQ-031
ROW-083 | behavior | REQ-032 | signed-in | n/a | this never happens: a call rings a person whose own outgoing call is still ringing | REQ-032 | owed: spec-only — first stage | origin: REQ-032
ROW-084 | behavior | REQ-032 | signed-in | n/a | this never happens: the second caller sees anything but "not available" | REQ-032 | owed: spec-only — first stage | origin: REQ-032
ROW-085 | behavior | REQ-033 | signed-in | n/a | this never happens: a call keeps ringing or keeps carrying voice after one person signed out or their session ended; and this must always hold: also when the 30-day session ends while the socket is open | REQ-033 | owed: spec-only — first stage | origin: REQ-033
ROW-086 | behavior | REQ-033 | signed-in | n/a | this never happens: the other person sees anything but "call ended" | REQ-033 | owed: spec-only — first stage | origin: REQ-033
ROW-087 | behavior | REQ-034 | signed-in | n/a | this never happens: signing out in one browser signs out another browser of the same email | REQ-034 | owed: spec-only — first stage | origin: REQ-034
ROW-088 | behavior | REQ-034 | signed-in | n/a | this never happens: the browser where sign-out was pressed is still signed in | REQ-034 | owed: spec-only — first stage | origin: REQ-034
ROW-089 | behavior | REQ-035 | signed-in | n/a | this never happens: a call rings in a tab other than the person's newest open, signed-in, connected tab; and this must always hold: newest means most recently opened, not most recently reconnected | REQ-035 | owed: spec-only — first stage | origin: REQ-035
ROW-090 | behavior | REQ-035 | signed-in | n/a | this never happens: a call rings in a tab that closed, or that lost its connection more than 30 seconds earlier, while an older connected tab exists | REQ-035 | owed: spec-only — first stage | origin: REQ-035
ROW-091 | behavior | REQ-035 | signed-in | n/a | this never happens: a tab that is not ringing can accept or decline the call | REQ-035 | owed: spec-only — first stage | origin: REQ-035
ROW-092 | behavior | INV-001 | signed-in | n/a | this never happens: any interleaving of calls, accepts, declines, cancels, drops, timeouts or sign-outs across two to four people leaves one person in two ringing or connected calls, or passes audio outside a connected call | INV-001 | owed: spec-only — first stage | origin: INV-001
ROW-093 | shell | / | anonymous | n/a | a signed-out visitor sees only the sign-in screen (email box and a send-code button): no call box, no sign-out control, no incoming-call area | REQ-001, REQ-005 | owed: spec-only — first stage | origin: REQ-001
ROW-094 | shell | / | signed-in | n/a | a signed-in person sees the call screen: their own email, the email box with a call button, and one sign-out control; no sign-in form | REQ-003, REQ-006 | owed: spec-only — first stage | origin: REQ-003
ROW-095 | shell | / | anonymous | n/a | an unknown path shows a plain not-found page with a link back to the start, in both auth states | REQ-024 | owed: spec-only — first stage | origin: REQ-005
ROW-096 | reachability | / | anonymous | n/a | the sign-in screen is the entry point; after a code is requested the code-entry step is reachable from it and leads back to the email step | REQ-001 | owed: spec-only — first stage | origin: REQ-001
ROW-097 | reachability | / | signed-in | n/a | a session implies a sign-out control on the call screen; pressing it lands on the sign-in screen | REQ-003, REQ-034 | owed: spec-only — first stage | origin: REQ-003
ROW-098 | reachability | / | signed-in | n/a | no signed-in-only control (call box, sign-out, incoming call) is shown to a signed-out visitor, and no sign-in control is shown to a signed-in person | REQ-005 | owed: spec-only — first stage | origin: REQ-005
ROW-099 | reachability | / | signed-in | n/a | after every call end (declined, no answer, cancelled, call ended, not available) the person is back at the email box on the call screen | REQ-019 | owed: spec-only — first stage | origin: REQ-019
ROW-100 | journey | Caller | signed-in | n/a | A caller signs in with the emailed code, calls an online free person, talks once accepted, and hangs up; afterwards nothing is kept. transitions: 1. anonymous at sign-in · email box · enters email and asks for a code · code entry · a code email is sent; 2. anonymous at code entry · code box · enters the code · call screen · signed in as that email; 3. caller at call screen · email box and call button · calls an online free person · ringing · the person called's tab rings with the caller's email; 4. caller at ringing · (the person called accepts) · voice connects · in call · both hear each other; 5. caller in call · hang-up button · hangs up · call screen · both see "call ended" and are back at the email box; and this must always hold: inbound audio bytes rise on both sides after Accept and are zero before it | REQ-001, REQ-006, REQ-011, REQ-015, REQ-016, REQ-019 | owed: spec-only — first stage | origin: REQ-001
ROW-101 | journey | Person called | signed-in | n/a | A signed-in person with the app open is rung, sees the caller's email, declines one call and accepts another, then is hung up on. transitions: 1. person called at call screen · incoming call · a caller rings · ringing · caller's email with Accept and Decline shown; 2. person called at ringing · Decline · declines · call screen · the caller sees "declined"; 3. person called at ringing · Accept · accepts with the microphone allowed · in call · both hear each other; 4. person called in call · (the caller hangs up) · call ends · call screen · "call ended" shown, back at the email box | REQ-011, REQ-014, REQ-016, REQ-019 | owed: spec-only — first stage | origin: REQ-011
ROW-102 | behavior | REQ-017 | (process) | n/a | an operator exists: the 30-second ring timeout timer is registered for every ringing call and fires, ending it as no answer | REQ-017 | owed: spec-only — first stage | origin: REQ-017
ROW-103 | behavior | REQ-018 | (process) | n/a | an operator exists: the 10-second dropped-connection timer is registered when a peer stops responding and fires, ending the call | REQ-018 | owed: spec-only — first stage | origin: REQ-018
ROW-104 | behavior | REQ-031 | (process) | n/a | an operator exists: the 15-second connect timer is registered at Accept and fires when voice has not connected | REQ-031 | owed: spec-only — first stage | origin: REQ-031
ROW-105 | behavior | REQ-009 | (process) | n/a | an operator exists: the offline timer marks a person offline no later than 30 seconds after their last tab closes or loses its connection | REQ-009 | owed: spec-only — first stage | origin: REQ-009
ROW-106 | behavior | REQ-035 | (process) | n/a | an operator exists: the tab-disconnect timer marks a tab disconnected no later than 30 seconds after it loses its connection | REQ-035 | owed: spec-only — first stage | origin: REQ-035
ROW-107 | behavior | REQ-029 | (process) | n/a | an operator exists: a cleanup trigger is registered that deletes used or expired codes and ended sessions, and its last run is recorded; and this must always hold: it runs at least every 15 minutes and leaves no used, expired, superseded or locked code and no ended session | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-108 | behavior | REQ-029 | (process) | n/a | the deployed scheduled cleanup on the platform fires and removes expired codes and ended sessions from the production database | REQ-029 | owed: paid by /vid deploy gate 2 — the platform's cron trigger fires the cleanup and its last run is recorded | origin: REQ-029
ROW-109 | behavior | REQ-011 | signed-in | n/a | this must always hold: the caller email shown on a ring, and the sender of every signalling frame, come from the caller's verified session; a client-supplied email, header or frame field never changes them | REQ-011 | owed: spec-only — first stage | origin: domain
ROW-110 | behavior | REQ-005 | signed-in | n/a | this must always hold: a signed-in person who is not one of a call's two parties cannot cancel, hang up, accept, decline, read or inject signalling into that call, whatever call id they send | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-111 | behavior | REQ-005 | signed-in | n/a | this must always hold: the caller cannot accept or decline their own outgoing call, and the person called cannot cancel it | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-112 | behavior | REQ-005 | anonymous | n/a | this must always hold: the WebSocket upgrade and every state-changing request refuse a foreign or missing Origin, sibling subdomains included; a refused upgrade never reaches the switchboard; and this must always hold: also from a same-site sibling subdomain and with Origin null | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-113 | behavior | REQ-011 | signed-in | n/a | this must always hold: a hostile email that sign-in accepts, such as a'/onfocus='alert`1`'/autofocus='x@example.com or a&ltb@example.com, shown on the ring, the own-email line or any message, runs no script, breaks no layout, and shows exactly as typed | REQ-011 | owed: spec-only — first stage | origin: domain
ROW-114 | behavior | REQ-001 | anonymous | n/a | this must always hold: the email box refuses commas, line breaks, display names, several @ and more than 254 characters; the code email has exactly one recipient, equal to the normalised address; and this must always hold: only one bare address is accepted: semicolons, spaces and angle brackets are refused, apostrophes accepted | REQ-001 | owed: spec-only — first stage | origin: domain
ROW-115 | behavior | REQ-004 | anonymous | n/a | this must always hold: one normaliser is used at every email entry (code request, code entry, call box, session, switchboard key, account row, mail recipient), so the same email always reaches the same account | REQ-004 | owed: spec-only — first stage | origin: domain
ROW-116 | behavior | REQ-023 | anonymous | n/a | this must always hold: the per-address hourly cap counts the platform's own client address; changing forwarding headers does not reset it, and IPv6 addresses count per /64 | REQ-023 | owed: spec-only — first stage | origin: domain
ROW-117 | behavior | REQ-002 | anonymous | n/a | this must always hold: parallel wrong guesses against one code evaluate at most 5; one code entered twice at once yields one session; parallel first sign-ins make one account; parallel code requests from one network address leave one working code | REQ-002 | owed: spec-only — first stage | origin: domain
ROW-118 | behavior | REQ-001 | anonymous | n/a | this must always hold: a code issued to one email never signs in as another email | REQ-001 | owed: spec-only — first stage | origin: domain
ROW-119 | behavior | REQ-003 | signed-in | n/a | this must always hold: a session value copied before sign-out or expiry is refused when replayed, and pages for signed-in people are never served from a cache | REQ-003 | owed: spec-only — first stage | origin: domain
ROW-120 | behavior | REQ-003 | anonymous | n/a | this must always hold: the session value after sign-in never equals any value present in the browser before sign-in | REQ-003 | owed: spec-only — first stage | origin: domain
ROW-121 | behavior | REQ-024 | n/a | n/a | this must always hold: every response, static files and error pages included, forbids framing, allows no inline script, turns the camera off and limits the microphone to the app, and forbids content sniffing; pages for signed-in people are not cached; HTTPS is enforced for repeat visits; and this must always hold: including the client bundle and an unknown asset path fetched through the asset-serving entry | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-122 | behavior | REQ-024 | n/a | n/a | this must always hold: no sign-in code, session value or email ever appears in a URL, query string or log line; and this must always hold: no email in any request line, query string, header or WebSocket address; only in form or frame bodies | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-123 | behavior | REQ-024 | n/a | n/a | this must always hold: a stored code cannot be recovered by hashing all 1,000,000 codes without the server secret, and a stored session value does not work as a cookie | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-124 | behavior | REQ-002 | anonymous | n/a | this must always hold: codes are drawn from a cryptographic random source, every code from 000000 to 999999 can occur and keeps its leading zeros, and session values carry at least 128 random bits; and this must always hold: the composition root binds randomness to the cryptographic source; no Math.random in src | REQ-002 | owed: spec-only — first stage | origin: domain
ROW-125 | behavior | REQ-024 | n/a | n/a | this must always hold: the session cookie is Secure, SameSite and bound to the app's own host only | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-126 | behavior | REQ-002 | anonymous | n/a | this must always hold: a storage error while checking or counting a code signs nobody in | REQ-002 | owed: spec-only — first stage | origin: domain
ROW-127 | behavior | REQ-022 | signed-in | n/a | this must always hold: the microphone is not captured while a call only rings, and after every end (decline, cancel, no answer, hang-up, drop, failed start, sign-out, a late permission answer) no capture track is live and the peer connection is closed; and this must always hold: the caller's permission-check track is stopped at once and capture starts again only at connect | REQ-022 | owed: spec-only — first stage | origin: domain
ROW-128 | behavior | REQ-009 | signed-in | n/a | this must always hold: a tab that vanishes without closing its connection is detected by the server's own heartbeat: offline within 30 seconds, and its call ends within 10 seconds; tested with a connection frozen without closing, not only a clean close | REQ-009 | owed: spec-only — first stage | origin: domain
ROW-129 | behavior | REQ-018 | signed-in | n/a | this must always hold: a connected call whose audio stopped arriving while the signalling stays up ends within 10 seconds; a call counts as connected only once audio is actually received and playing | REQ-018 | owed: spec-only — first stage | origin: domain
ROW-130 | behavior | REQ-009 | signed-in | n/a | this must always hold: after a network blip, sleep or a server restart, an open signed-in app reconnects by itself with growing waits, stops and shows sign-in on a refused session, and is callable again; one tab never counts as two | REQ-009 | owed: spec-only — first stage | origin: domain
ROW-131 | behavior | INV-001 | signed-in | n/a | this must always hold: a switchboard restart, eviction or hibernation, during a call or while idle, never lets a third caller ring a person in a call, never loses who is online, and every tab that lost signalling closes its own peer connection within 10 seconds and shows call ended; and this must always hold: tested by building a fresh switchboard over the same open sockets and their attachments: presence and busy survive and a third caller gets not available; also when the switchboard closes every socket during a connected call: both tabs show call ended within 10 seconds, both peer connections close and inbound audio stops, and a third caller rings only once both are free; the rebuild discards the old instance and its timers, and a ringing call still ends as no answer no later than 30 seconds after it started, and a connected call's drop and connect timers still fire | INV-001 | owed: spec-only — first stage | origin: domain
ROW-132 | behavior | REQ-032 | signed-in | n/a | this must always hold: busy is per email across every tab and browser: no second call can be placed or accepted from another tab or browser while one rings or is connected | REQ-032 | owed: spec-only — first stage | origin: domain
ROW-133 | behavior | REQ-034 | signed-in | n/a | this must always hold: signing out in one browser never ends or disturbs a call held by another browser of the same email | REQ-034 | owed: spec-only — first stage | origin: domain
ROW-134 | behavior | REQ-018 | signed-in | n/a | this must always hold: a caller who vanishes while ringing ends the ring within 10 seconds, and the person called cannot accept that dead ring | REQ-018 | owed: spec-only — first stage | origin: domain
ROW-135 | behavior | REQ-020 | signed-in | n/a | this must always hold: a late message or timer of an ended call never affects a later call, between the same people or not; each call has its own timers that fire at their own deadlines, however many calls run at once | REQ-020 | owed: spec-only — first stage | origin: domain
ROW-136 | behavior | INV-001 | signed-in | n/a | this must always hold: each call's outcome is decided once by the switchboard: both people always see the same end, and an Accept at the same moment as a cancel, a timeout or a drop resolves to one outcome | INV-001 | owed: spec-only — first stage | origin: domain
ROW-137 | behavior | INV-001 | signed-in | n/a | this never happens: a signalling frame over 64 KB, more than 20 frames a second from one socket, or an 11th socket for one person is accepted, or such a frame disturbs anyone but its sender; a failed send to one socket stops a call from ending or a busy mark from clearing | INV-001 | owed: spec-only — first stage | origin: domain
ROW-138 | behavior | REQ-007 | signed-in | n/a | this never happens: the email box accepts over 254 characters, the code box over 6 digits, or the call box over 254 characters, or any refusal differs between them in shape | REQ-007 | owed: spec-only — first stage | origin: domain
ROW-139 | behavior | REQ-007 | signed-in | n/a | this never happens: after sign-out or the session ending, a tab of that browser still counts online; while a tab of another signed-in browser of the same email is connected the person stops being callable; or any client receives another person's online status except through a call attempt | REQ-007 | owed: spec-only — first stage | origin: domain
ROW-140 | behavior | REQ-029 | (process) | n/a | this never happens: after the operator deletes an account (removing its row, sessions and codes), its open tabs still count online after 30 seconds, a live call of it continues, or its email behaves differently from one with no account | REQ-029 | owed: spec-only — first stage | origin: domain
ROW-141 | behavior | REQ-007 | anonymous | n/a | this never happens: every code-request and code-entry answer (sent, refused, wrong, expired, used, exhausted) differs in status, wording, shape or timing between an email with an account and one without | REQ-007 | owed: spec-only — first stage | origin: domain
ROW-142 | behavior | REQ-001 | anonymous | n/a | this must always hold: no fixed code, last-code reader, fake mailer or test bypass is reachable in the deployed product | REQ-001 | owed: spec-only — first stage | origin: domain
ROW-143 | behavior | REQ-024 | n/a | n/a | this must always hold: a missing or short code-hashing secret makes sign-in refuse rather than fall back, and no secret value appears in the page or the client bundle | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-144 | behavior | REQ-024 | n/a | n/a | this must always hold: no error answer or frame shows a stack trace, database text, binding name or validator detail; an unknown path returns a real not-found status | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-145 | behavior | REQ-004 | anonymous | n/a | this must always hold: an email with an apostrophe, such as o'brien@example.com, signs in, calls and is called end to end | REQ-004 | owed: spec-only — first stage | origin: domain
ROW-146 | behavior | REQ-001 | anonymous | n/a | this must always hold: asking for a code creates no account; only entering the code does | REQ-001 | owed: spec-only — first stage | origin: domain
ROW-147 | behavior | INV-001 | signed-in | n/a | this must always hold: two callers reaching the same free person at once through the real switchboard, with a database call in the path, never both ring | INV-001 | owed: spec-only — first stage | origin: domain
ROW-148 | behavior | REQ-021 | signed-in | n/a | this must always hold: the browser keeps no called or calling email after a call: not in storage, autocomplete, the page title, the history or the console; no error reporter or analytics receives an email or a frame | REQ-021 | owed: spec-only — first stage | origin: domain
ROW-149 | behavior | REQ-021 | n/a | n/a | this never happens: a third-party script, font, analytics or image loads; a referrer is sent; or a call uses any connection-helping server other than stun.cloudflare.com | REQ-021 | owed: spec-only — first stage | origin: domain
ROW-150 | behavior | REQ-030 | anonymous | n/a | this must always hold: the code email holds fixed text and the code only: no link built from the request, no requester text or address, no tracking and no remote images | REQ-030 | owed: spec-only — first stage | origin: domain
ROW-151 | behavior | REQ-006 | signed-in | n/a | this never happens: the caller hears ringing before the person called's tab confirmed showing the ring, or no confirmation within 5 seconds leaves anything but not available | REQ-006 | owed: spec-only — first stage | origin: domain
ROW-152 | behavior | REQ-009 | signed-in | n/a | this must always hold: a tab hidden in the background for over 5 minutes with its connection up stays online and rings | REQ-009 | owed: spec-only — first stage | origin: domain
ROW-153 | behavior | REQ-011 | signed-in | n/a | this must always hold: a ring never moves keyboard focus onto Accept, and Enter or Space pressed within 1 second of the ring appearing does not accept | REQ-011 | owed: spec-only — first stage | origin: domain
ROW-154 | behavior | REQ-011 | signed-in | n/a | this must always hold: Accept and Decline carry the call the person saw; a press on an ended or replaced ring never applies to a newer ring, whoever its caller | REQ-011 | owed: spec-only — first stage | origin: domain
ROW-155 | behavior | REQ-019 | signed-in | n/a | this never happens: a call request with no answer from the switchboard within 5 seconds leaves the caller anywhere but the email box with a final message | REQ-019 | owed: spec-only — first stage | origin: domain
ROW-156 | behavior | REQ-031 | signed-in | n/a | this must always hold: a microphone that stops mid-call ends the call for both with call ended; the remote audio plays only the other person's voice; and this must always hold: the remote audio carries the other browser's distinct fake source, never the local one | REQ-031 | owed: spec-only — first stage | origin: domain
ROW-157 | behavior | REQ-015 | signed-in | n/a | this must always hold: a remote description with anything but one audio track (video, data channel) is refused and the call ends | REQ-015 | owed: spec-only — first stage | origin: domain
ROW-158 | behavior | REQ-002 | anonymous | n/a | this must always hold: a code's wrong-try count survives a restart, eviction or second server instance | REQ-002 | owed: spec-only — first stage | origin: domain
ROW-159 | behavior | REQ-023 | anonymous | n/a | this must always hold: a refused code request never shows code sent or moves to the code-entry step | REQ-023 | owed: spec-only — first stage | origin: domain
ROW-160 | behavior | REQ-023 | anonymous | n/a | this must always hold: a failed send leaves earlier codes working, leaves no working undelivered code, and uses none of the 60-second or hourly allowance | REQ-023 | owed: spec-only — first stage | origin: domain
ROW-161 | behavior | REQ-003 | signed-in | n/a | this must always hold: signing in as a second email in a browser that holds a live session ends the first session and its tabs' online marks | REQ-003 | owed: spec-only — first stage | origin: domain
ROW-162 | behavior | REQ-002 | anonymous | n/a | this must always hold: the code box trims surrounding spaces, and input that is not 6 digits is refused without using one of the 5 tries | REQ-002 | owed: spec-only — first stage | origin: domain
ROW-163 | behavior | REQ-035 | signed-in | n/a | this must always hold: signalling reaches only the one tab that placed or accepted the call; the other tabs of either person show no call and capture no microphone | REQ-035 | owed: spec-only — first stage | origin: domain
ROW-164 | behavior | REQ-023 | anonymous | n/a | this must always hold: when a database call fails during a code request no code is sent, and when a switchboard call fails during a connection or a sign-out, no tab counts as online and no signed-out tab keeps ringing | REQ-023 | owed: spec-only — first stage | origin: domain
ROW-165 | behavior | REQ-003 | signed-in | n/a | this must always hold: lower bounds hold: a session works at day 29 and after a browser restart, a code works just before 10 minutes, and an unanswered call rings the full 30 seconds and can be accepted at 29 seconds; and this must always hold: a correct code still signs in after 4 wrong tries; a request 60 seconds after the last is served; the 5th code within the hour from one address is sent | REQ-003, REQ-002, REQ-017 | owed: spec-only — first stage | origin: domain
ROW-166 | behavior | REQ-015 | signed-in | n/a | this must always hold: only the caller's browser makes the offer and only the person called's makes the answer; a second offer or answer within a call never renegotiates it | REQ-015 | owed: spec-only — first stage | origin: domain
ROW-167 | behavior | REQ-015 | signed-in | n/a | this must always hold: connection candidates that arrive before the remote description are held and applied, and candidates for an ended or other call are dropped | REQ-015 | owed: spec-only — first stage | origin: domain
ROW-168 | behavior | REQ-016 | signed-in | n/a | this must always hold: hang-up, decline and cancel take effect at once in the browser even when signalling is down: tracks stop, the peer connection closes, the email box shows; the other side ends within 10 seconds | REQ-016 | owed: spec-only — first stage | origin: domain
ROW-169 | behavior | REQ-033 | signed-in | n/a | this must always hold: reload, going back, closing the tab or leaving the page during a ringing or connected call ends the call for both, and a reloaded page shows the email box | REQ-033 | owed: spec-only — first stage | origin: domain
ROW-170 | behavior | REQ-016 | signed-in | n/a | this must always hold: a double press of Call, Accept, Decline, Hang-up, Cancel or Send code has exactly one effect, and the screen keeps the first outcome | REQ-016 | owed: spec-only — first stage | origin: domain
ROW-171 | behavior | REQ-005 | signed-in | n/a | this must always hold: no link, query, fragment or message from another page fills the call box, places a call or presses Accept or Decline; calls start and answer only on a real person's action | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-172 | behavior | REQ-007 | n/a | n/a | this must always hold: no response allows another website to read it, and no endpoint gives the signed-in email to a script from another origin | REQ-007 | owed: spec-only — first stage | origin: domain
ROW-173 | behavior | REQ-029 | (process) | n/a | this must always hold: the scheduled cleanup deletes no live code and no live session | REQ-029 | owed: spec-only — first stage | origin: domain
ROW-174 | behavior | REQ-021 | n/a | n/a | this never happens: a switchboard socket attachment holds anything beyond the tab id, its own email, and while a call is live that call's id, the peer tab id, the role, the call state and its next deadline; or any of the live-call fields remain after the call ended; or it holds a session value or a code | REQ-021 | owed: spec-only — first stage | origin: domain
ROW-175 | behavior | REQ-029 | n/a | n/a | this must always hold: after any backup restore, no session or code from before the restore signs anyone in | REQ-029 | owed: spec-only — first stage | origin: domain
ROW-176 | behavior | REQ-011 | signed-in | n/a | control of ROW-109: the real caller's email is shown on the person called's ring | REQ-011 | owed: spec-only — first stage | origin: domain
ROW-177 | behavior | REQ-005 | signed-in | n/a | control of ROW-110: the two parties of a call can each hang up, and the person called can accept and decline | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-178 | behavior | REQ-005 | anonymous | n/a | control of ROW-112: an upgrade and a call request from the app's own origin with a live session work | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-179 | behavior | REQ-001 | anonymous | n/a | control of ROW-114: a plain valid email receives exactly one code email | REQ-001 | owed: spec-only — first stage | origin: domain
ROW-180 | behavior | REQ-002 | anonymous | n/a | control of ROW-117: a single correct code entered once signs the person in | REQ-002 | owed: spec-only — first stage | origin: domain
ROW-181 | behavior | REQ-003 | signed-in | n/a | control of ROW-119: a live session keeps working on every page until sign-out | REQ-003 | owed: spec-only — first stage | origin: domain
ROW-182 | behavior | REQ-024 | n/a | n/a | control of ROW-122: a normal sign-in and call leave ordinary request logs that name no email, code or session | REQ-024 | owed: spec-only — first stage | origin: domain
ROW-183 | behavior | REQ-007 | anonymous | n/a | control of ROW-141: a correct code for an existing account and for a new email both sign in | REQ-007 | owed: spec-only — first stage | origin: domain
ROW-184 | behavior | INV-001 | signed-in | n/a | control of ROW-147: a single caller reaching a free person rings them | INV-001 | owed: spec-only — first stage | origin: domain
ROW-185 | behavior | INV-001 | signed-in | n/a | control of ROW-137: well-formed frames within the caps flow normally for every other person during a hostile frame | INV-001 | owed: spec-only — first stage | origin: domain
ROW-186 | behavior | REQ-006 | signed-in | n/a | control of ROW-151: a person called whose tab confirms the ring makes the caller hear ringing within a few seconds; and this must always hold: within 5 seconds | REQ-006 | owed: spec-only — first stage | origin: domain
ROW-187 | behavior | REQ-011 | signed-in | n/a | control of ROW-153: a deliberate press of Accept more than 1 second after the ring appears accepts the call | REQ-011 | owed: spec-only — first stage | origin: domain
ROW-188 | behavior | REQ-005 | signed-in | n/a | control of ROW-171: a person's own click on Call and on Accept works | REQ-005 | owed: spec-only — first stage | origin: domain
ROW-189 | behavior | REQ-007 | n/a | n/a | control of ROW-172: the app's own pages read the signed-in email normally | REQ-007 | owed: spec-only — first stage | origin: domain
ROW-190 | behavior | REQ-033 | (process) | n/a | an operator exists: the session-end deadline is registered for every open socket and fires, ending its call as call ended and closing the socket | REQ-033 | owed: spec-only — first stage | origin: domain
ROW-191 | behavior | REQ-001 | anonymous | n/a | on staging a code request delivers exactly one email to the normalised address through the platform binding, SPF, DKIM and DMARC passing, and its code signs in | REQ-001 | owed: paid by /vid deploy gate 2 — one real code email on staging reaches a test inbox and signs in | origin: domain
ROW-192 | behavior | REQ-006 | signed-in | n/a | on staging two real sessions sign in, ring, accept, exchange voice through the stun.cloudflare.com path with host candidates filtered out, and hang up through the deployed Worker and switchboard | REQ-006 | owed: paid by /vid deploy gate 2 — a real two-browser call over server-reflexive candidates on staging | origin: domain
ROW-193 | behavior | REQ-001 | n/a | n/a | staging and production share no database, object namespace or secret; production answers only on call-by-identifier.josueayala.me; the deployed composition wires the real mailer with no fake or bypass | REQ-001 | owed: paid by /vid deploy gate 2 — the deployed configurations compared | origin: domain
ROW-194 | behavior | REQ-024 | n/a | n/a | on staging plain HTTP is refused or upgraded before any cookie is sent, and the per-address cap counts the platform's client address, not a forwarding header | REQ-024 | owed: paid by /vid deploy gate 2 — plain HTTP and a spoofed forwarding header against staging | origin: domain
ROW-195 | behavior | REQ-021 | n/a | n/a | the deployed Worker's platform logging captures no request address, query or body that carries an email, and the call box never puts an email in a URL | REQ-021 | owed: paid by /vid deploy gate 2 — the deployed logging configuration and a captured request log after a call | origin: domain
ROW-196 | behavior | REQ-002 | anonymous | n/a | this never happens: a request from another network address, or a request whose email failed to send, makes an earlier working code stop working — network address means the edge-reported client address, IPv6 counted per /64 | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-197 | behavior | REQ-036 | signed-in | n/a | this never happens: before Accept either browser receives anything that reveals the other's network address | REQ-036 | owed: spec-only — first stage | origin: REQ-036
ROW-198 | behavior | REQ-036 | signed-in | n/a | this never happens: a declined, cancelled or unanswered call reveals either person's address | REQ-036 | owed: spec-only — first stage | origin: REQ-036
ROW-199 | behavior | REQ-036 | signed-in | n/a | this never happens: the person called creates a peer connection before Accept | REQ-036 | owed: spec-only — first stage | origin: REQ-036
ROW-200 | behavior | REQ-037 | anonymous | n/a | this never happens: an 11th wrong try within an hour from one network address is checked against a code — network address means the edge-reported client address, IPv6 counted per /64 | REQ-037 | owed: spec-only — first stage | origin: REQ-037
ROW-201 | behavior | REQ-037 | anonymous | n/a | this never happens: the wrong-try refusal differs between emails with and without an account | REQ-037 | owed: spec-only — first stage | origin: REQ-037
ROW-202 | behavior | REQ-038 | anonymous | n/a | this never happens: an 11th code email within an hour at the request of one network address is sent — network address means the edge-reported client address, IPv6 counted per /64 | REQ-038 | owed: spec-only — first stage | origin: REQ-038
ROW-203 | behavior | REQ-038 | anonymous | n/a | this never happens: the 500th code email in a day sends no alert email to the operator; and this must always hold: on a day that reaches 500 code emails exactly one alert is sent, to the OPERATOR_EMAIL address, and on any other day none | REQ-038 | owed: spec-only — first stage | origin: REQ-038
ROW-204 | behavior | sign-in screen | anonymous | n/a | this never happens: an email holding any non-ASCII or invisible character is accepted at sign-in or in the call box | REQ-039 | owed: spec-only — first stage | origin: REQ-039
ROW-205 | behavior | REQ-036 | signed-in | n/a | control of ROW-197: after Accept the two browsers exchange what they need and voice connects within 15 seconds | REQ-036 | owed: spec-only — first stage | origin: REQ-036
ROW-206 | behavior | REQ-038 | anonymous | n/a | control of ROW-202: the 10th code email within an hour from one network address is sent | REQ-038 | owed: spec-only — first stage | origin: REQ-038
ROW-207 | behavior | REQ-039 | anonymous | n/a | control of ROW-204: a plain ASCII email with dots, plus and apostrophe is accepted | REQ-039 | owed: spec-only — first stage | origin: REQ-039
ROW-208 | behavior | REQ-002 | anonymous | n/a | this never happens: wrong tries from one network address make a code requested from another network address stop working — network address means the edge-reported client address, IPv6 counted per /64 | REQ-002 | owed: spec-only — first stage | origin: REQ-002
ROW-209 | behavior | REQ-037 | anonymous | n/a | this never happens: after 10 wrong tries within an hour from one network address, a further try from that address signs someone in, even with a working code | REQ-037 | owed: spec-only — first stage | origin: REQ-037
ROW-210 | behavior | REQ-038 | anonymous | n/a | this never happens: reaching 500 code emails in a day stops code emails for everyone | REQ-038 | owed: spec-only — first stage | origin: REQ-038
ROW-211 | behavior | REQ-029 | n/a | n/a | this never happens: the daily total holds an email or address or, older than one day, survives the next cleanup run | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-212 | behavior | code request response | anonymous | n/a | at the code request response: this never happens: an email holding any non-ASCII or invisible character is accepted — network address means the edge-reported client address, IPv6 counted per /64 | REQ-039 | owed: spec-only — first stage | origin: REQ-039
ROW-213 | behavior | call input screen | signed-in | n/a | at the call input screen: this never happens: an email holding any non-ASCII or invisible character is accepted | REQ-039 | owed: spec-only — first stage | origin: REQ-039
ROW-214 | behavior | call request response | signed-in | n/a | at the call request response: this never happens: an email holding any non-ASCII or invisible character is accepted | REQ-039 | owed: spec-only — first stage | origin: REQ-039
ROW-215 | behavior | REQ-030 | n/a | n/a | this never happens: the product sends the operator any email other than the daily-total alert and server-error alerts | REQ-030 | owed: spec-only — first stage | origin: REQ-030
ROW-216 | behavior | REQ-029 | n/a | n/a | this never happens: a stored code holds its requesting network address in plain form or as a hash computable without a key kept apart from storage | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-217 | behavior | REQ-029 | (process) | n/a | an operator exists: the cleanup trigger deletes request and wrong-try counters older than one hour and daily totals older than one day, and its last run is recorded | REQ-029 | owed: spec-only — first stage | origin: REQ-029
ROW-218 | behavior | REQ-029 | n/a | n/a | Accounts, live sessions and live codes kept before a new version is released are all still there and still work after it, on the restored copy of production's data. Fails if an account, a live session or a live code is lost or stops working after the move to a new version | REQ-029 | owed: paid by /vid deploy gate 1 — the release rehearsal on the restored copy of production's data | origin: plan REQ-029
rule | RULE-001 | state-machine call.status: ringing ringing>connected ringing>ended connected>ended | checks/extractors/state-machine.call.status.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: INV-001
rule | RULE-002 | each person is in at most one ringing or connected call: every site that sets or clears a busy mark goes through the one switchboard step | checks/extractors/invariant.one-call.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: INV-001
rule | RULE-003 | no log, console, error-report call or thrown error message carries an email, a code, a session value or a call id with a person | checks/extractors/invariant.logs-no-person.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-021
rule | RULE-004 | every render of an email or typed input is escaped; no raw HTML sink renders user data | checks/extractors/invariant.escaped-render.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-011
rule | RULE-005 | every state-changing route and the WebSocket upgrade check the Origin and the session before acting | checks/extractors/invariant.origin-and-session.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-005
rule | RULE-006 | every value that reaches the email type or an email column goes through the one normaliser | checks/extractors/invariant.one-normaliser.sh | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-004
rule | RULE-007 | every database statement uses bound parameters and the injected clock | checks/extractors/invariant.bound-sql.sh | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-004
rule | RULE-008 | every response path carries the security headers, static assets and the assets configuration included | checks/extractors/invariant.security-headers.sh | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-024
rule | RULE-009 | no module-scope mutable state exists outside the switchboard object | checks/extractors/invariant.no-module-state.sh | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: INV-001
rule | RULE-010 | no encryption layer of the product's own touches media or the session description | checks/extractors/invariant.no-own-encryption.sh | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-015
rule | RULE-011 | every in-memory collection in the switchboard has a size cap and an eviction rule that never evicts a live call or socket | checks/extractors/invariant.bounded-collections.sh | 1 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: INV-001
rule | RULE-012 | every signalling message handler takes the sender's identity from its socket, never from the frame | checks/extractors/invariant.identity-from-socket.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-011
rule | RULE-013 | every secret read refuses to run when the secret is missing or short | checks/extractors/invariant.secrets-fail-closed.sh | 0 | owed: census-armed — no site exists before the code skeleton; armed when its first site and test land | origin: REQ-024
rule | RULE-014 | every field the product collects from a person (the email) is acted on beyond validation and display | sites: every form field and request field the product stores | 1 | owed: spec-only — ticket | origin: plan REQ-001
rule | RULE-015 | every scheduled job and every routed task has a consumer that runs it | sites: every cron trigger, timer and queue the product declares | 1 | owed: spec-only — ticket | origin: plan REQ-029
difference | DIF-001 | the code email sender | a fake mailer that records the one recipient and the body in memory | Cloudflare Email Service binding sending from no-reply@call-by-identifier.josueayala.me | the fake records exactly what the adapter hands to the binding, so the product's choice of recipient and body is still tested | paying-step: staging — one real code email to a test inbox through the binding, SPF, DKIM and DMARC passing
difference | DIF-002 | the connection-helping server | none needed: both test browsers share one Docker host and connect over host candidates | stun.cloudflare.com for browsers behind home and mobile networks | the product's signalling and media gate are the same; only the path discovery differs | paying-step: staging — a real two-browser call with host candidates filtered out
difference | DIF-003 | the edge in front of the Worker | local workerd serves plain HTTP and the test sets the client-address header itself | Cloudflare's edge enforces HTTPS and sets the client address | the product reads one address header and sets one HSTS header; only the edge's own enforcement differs | paying-step: staging — plain HTTP and a spoofed forwarding header against staging
seam | SEAM-001 | Cloudflare Email Service | sends the sign-in code email | chosen: D-008 | credentials: not-yet | probe: unreachable-risk(credentials not-yet) | evidence: owed | quirks: none yet | module: src/adapters/mail | match: send_email EmailMessage cloudflare:email
seam | SEAM-002 | STUN at stun.cloudflare.com | lets two browsers find a direct path for voice | chosen: D-006 | credentials: never | probe: owed | evidence: owed | quirks: none yet | module: src/client | match: stun.cloudflare.com
seam | SEAM-003 | Cloudflare Realtime TURN | relays voice for strict networks (REQ-028, later) | chosen: D-007 | credentials: not-yet | probe: unreachable-risk(credentials not-yet; REQ-028 is later) | evidence: owed | quirks: none yet | module: src/client | match: turn.cloudflare.com rtc.live.cloudflare.com
hostility | HOS-001 | on the code-entry screen, submit no code, an empty code and a code of another email, expect no session cookie and no signed-in screen | protects: REQ-001 | disable: remove the code check in verifyCode | owed: guard-first — the protection of REQ-001 does not exist yet; paid in the slice that builds it
hostility | HOS-002 | on the code-entry screen, submit the correct code within 10 minutes, expect a session; with the check bypassed the session is refused | protects: REQ-001 | disable: remove the session creation after a valid code | owed: guard-first — the protection of REQ-001 does not exist yet; paid in the slice that builds it
hostility | HOS-003 | enter a first-time email's code, then call it from another account, expect it rings | protects: REQ-001 | disable: remove account creation at first sign-in | owed: guard-first — the protection of REQ-001 does not exist yet; paid in the slice that builds it
hostility | HOS-004 | on the code-entry screen, submit the code 10 minutes and 1 second after it was sent, expect no session | protects: REQ-002 | disable: remove the expiry comparison | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
hostility | HOS-005 | submit a correct code a second time after it signed in once, expect no second session | protects: REQ-002 | disable: remove single-use consumption | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
hostility | HOS-006 | submit 5 wrong codes then the right one, expect no session; repeat with 50 wrong guesses in parallel, expect at most 5 evaluated | protects: REQ-002 | disable: remove the wrong-try counter and its atomic update | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
hostility | HOS-007 | from one network address request a code, request a second that is sent, submit the first, expect no session | protects: REQ-002 | disable: remove the kill of earlier codes on a new request | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
hostility | HOS-008 | read every code the fake mailer recorded over many requests, expect each is exactly 6 digits | protects: REQ-002 | disable: remove the 6-digit code generator | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
hostility | HOS-009 | open the WebSocket with no session cookie and send a call frame, expect refusal and nobody rings | protects: REQ-005 | disable: remove the session check on upgrade | owed: guard-first — the protection of REQ-005 does not exist yet; paid in the slice that builds it
hostility | HOS-010 | from the call box over HTTP with no session, request a call, expect refusal | protects: REQ-005 | disable: remove the session check on call requests | owed: guard-first — the protection of REQ-005 does not exist yet; paid in the slice that builds it
hostility | HOS-011 | with no session, check whether an email counts as online by calling it from a signed-in account, expect not available | protects: REQ-005 | disable: remove presence registration only for sessions | owed: guard-first — the protection of REQ-005 does not exist yet; paid in the slice that builds it
hostility | HOS-012 | as a third signed-in person, send accept and decline frames for another pair's ringing call, expect refusal and the call unchanged | protects: REQ-005 | disable: remove the party check on accept and decline | owed: guard-first — the protection of REQ-005 does not exist yet; paid in the slice that builds it
hostility | HOS-013 | as a signed-in, online, free person, call and be called, expect both to work; with the guard over-tightened, expect failure | protects: REQ-005 | disable: remove over-refusal in the authorization guard | owed: guard-first — the protection of REQ-005 does not exist yet; paid in the slice that builds it
hostility | HOS-014 | through the call input screen, call an email with no account and an offline person, expect identical screens and wording | protects: REQ-007 | disable: remove the single not-available answer at the screen | owed: guard-first — the protection of REQ-007 does not exist yet; paid in the slice that builds it
hostility | HOS-015 | through the call request response, compare status, body and shape for no account, offline, busy and own email, expect identical | protects: REQ-007 | disable: remove the single not-available answer at the response | owed: guard-first — the protection of REQ-007 does not exist yet; paid in the slice that builds it
hostility | HOS-016 | through the realtime presence channel, watch every frame during calls to no account, offline and busy emails, expect identical frames | protects: REQ-007 | disable: remove the single not-available answer on the channel | owed: guard-first — the protection of REQ-007 does not exist yet; paid in the slice that builds it
hostility | HOS-017 | press Accept late and record inbound audio on both sides before it, expect silence; and no session description or candidate crosses before Accept | protects: REQ-014 | disable: remove the media gate before Accept | owed: guard-first — the protection of REQ-014 does not exist yet; paid in the slice that builds it
hostility | HOS-018 | after decline, cancel and hang-up, record inbound audio on both sides, expect silence and closed peer connections | protects: REQ-014 | disable: remove teardown on every end | owed: guard-first — the protection of REQ-014 does not exist yet; paid in the slice that builds it
hostility | HOS-019 | after a full call, scan every server record, server log, error log and switchboard attachment, expect neither email and no call id linking them | protects: REQ-021 | disable: remove log and record scrubbing | owed: guard-first — the protection of REQ-021 does not exist yet; paid in the slice that builds it
hostility | HOS-020 | after a full call, open every app screen, expect no past or missed call shown | protects: REQ-021 | disable: remove the absence of any call list | owed: guard-first — the protection of REQ-021 does not exist yet; paid in the slice that builds it
hostility | HOS-021 | have two callers ring one free person at the same moment, and two people call each other at the same moment, expect each person in at most one ringing or connected call | protects: INV-001 | disable: remove the one-step free check and busy set | owed: guard-first — the protection of INV-001 does not exist yet; paid in the slice that builds it
hostility | HOS-022 | drive a call through ringing>connected>ended and then send accept on the ended call, expect no move out of ended | protects: RULE-001 | disable: remove the transition table check | owed: guard-first — the protection of RULE-001 does not exist yet; paid in the slice that builds it
hostility | HOS-023 | from two tabs of one person, place an outgoing call and accept an incoming one at the same moment, expect at most one live call | protects: RULE-002 | disable: remove the single busy step | owed: guard-first — the protection of RULE-002 does not exist yet; paid in the slice that builds it
hostility | HOS-024 | run a full sign-in and call with a hostile email, then scan every log line, expect no email, code or session value | protects: RULE-003 | disable: remove the log scrubber | owed: guard-first — the protection of RULE-003 does not exist yet; paid in the slice that builds it
hostility | HOS-025 | sign in as a'/onfocus='alert`1`'/autofocus='x@example.com and as a&ltb@example.com and ring another person, expect no script runs on their ring screen and the text shows exactly as typed | protects: RULE-004 | disable: remove the escaping at render | owed: guard-first — the protection of RULE-004 does not exist yet; paid in the slice that builds it
hostility | HOS-026 | from a page on another origin, open the WebSocket and post a call request with the victim's cookie, expect refusal | protects: RULE-005 | disable: remove the Origin check | owed: guard-first — the protection of RULE-005 does not exist yet; paid in the slice that builds it
hostility | HOS-027 | send a call frame whose from field names another person, expect the ring shows the sender's own email | protects: RULE-012 | disable: remove identity taken from the socket | owed: guard-first — the protection of RULE-012 does not exist yet; paid in the slice that builds it
hostility | HOS-028 | start the Worker with the code-hashing secret unset, request and enter a code, expect sign-in refused | protects: RULE-013 | disable: remove the secret presence check | owed: guard-first — the protection of RULE-013 does not exist yet; paid in the slice that builds it
hostility | HOS-029 | from a second network address request a code for the victim's email, then submit the victim's earlier code, expect it still signs in; and with the mailer failing, request again from the victim's address and expect the earlier code still works | protects: REQ-002 | disable: remove the same-address and sent-only condition on cancelling codes | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
hostility | HOS-030 | from address B submit 5 wrong codes for an email whose live code was requested from address A, then submit A's code from A, expect it signs in | protects: REQ-002 | disable: remove the per-address scoping of wrong-try counts | owed: guard-first — the protection of REQ-002 does not exist yet; paid in the slice that builds it
```
