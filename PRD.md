# call-by-identifier — PRD
grammar: 0.26.11.1.2

> **Precedence rule:** the base of this file (everything above `## Appends`)
> is immutable after final ratification. All change is appended under
> `## Appends`. Later appends win over the base and over earlier appends.
> Authority order within the record: Seed and human answers > ratified
> thesis > sources > model proposals.

## Seed

### 2026-11-26 — owner brief

i want to create an app to call, limit the app with three features, sign in with otp with email, enter an identifier to call (email) and that's it, don't try to add edge cases or some aditional features, validations are ok, for example if the other user isn't active, the call won't be available, you know? only if the other user is online, don't save history, don't add other things, just an input to call and the other user the habilities to decline or accept, don't encrypt voice!

## Thesis

### Product summary

A deliberately tiny web app for one-to-one voice calls. A person signs in
with a one-time code sent to their email, types another person's email,
and calls them. The call is offered only when that person is signed in,
has the app open and is not already in a call. The person called accepts
or declines. Nothing about calls is kept afterwards, and the product adds
no encryption layer of its own to the voice.

### Primary users

People who already know each other's email address and want to talk by
voice right now, without contacts, history or set-up. Every user is both a
caller and a person who can be called.

### MVP focus

- G1: Sign in with a one-time code sent to your email.
- G2: Call another signed-in, online person by typing their email.
- G3: The person called accepts or declines, and an accepted call carries voice both ways until either person hangs up.

### Explicitly not MVP

Everything the owner did not name: video, group calls, contact lists,
call history or logs, missed-call records, messages or chat, profiles,
names or avatars, notifications outside the open app, blocking or
reporting, account settings or deletion screens, passwords or other
sign-in methods, and any encryption layer of the product's own. The owner
asked for these to be left out, not deferred.

### Required core flows

- Sign in: a person gets a code by email, enters it, and is signed in.
- Call: a signed-in person types an email and the call rings only if that person is online and free.
- Answer: the person called accepts and both talk, or declines and the caller is told.

### Value logic

The value is speed and simplicity: one input, one button, a voice call
with someone whose email you know. Every extra feature works against the
reason this product exists, so the scope is the product.

### Evidence basis

One source: the owner's brief and their eight interview answers. No
conflicts. The brief's "don't encrypt voice" was read with the owner as
"no encryption layer of our own"; the protection web browsers apply to
every call cannot be switched off and stays (A-005).

## Actors and journeys

### Caller (any signed-in person)

1. Decides to talk to someone whose email they know (off_screen)
2. Opens the app and signs in with the code from their email
3. Types the other person's email and presses call
4. Hears it ring, or is told the person is not available
5. Talks once the other person accepts, then hangs up
6. Leaves; nothing about the call is kept (off_screen)

### Person called (any signed-in person)

1. Has the app open and is signed in, so counts as online (off_screen)
2. Sees an incoming call showing the caller's email, with Accept and Decline
3. Accepts and talks, or declines and the caller is told
4. Hangs up or is hung up on and returns to the call input
5. Closes the app and stops being callable (off_screen)

## Mechanisms

```vid-prd-mechanisms
MECH-01 | G1 | Entering an email sends a one-time code to it, and entering that code signs the person in. | stated: seed "sign in with otp with email"
MECH-02 | G1 | The first successful sign-in with an email makes its account; there is no separate sign-up. | stated: answer A-001
MECH-03 | G1 | A signed-in person can sign out with one button. | stated: answer A-006
MECH-04 | G2 | The product keeps a live record of who is online (signed in with the app open) and who is in a call, and offers a call only to a person who is online and free. | stated: seed "only if the other user is online"
MECH-05 | G2 | An email with no account, a person offline and a person already in a call all give the caller the same "not available" message. | stated: answer A-002
MECH-06 | G2 | Nothing about a call is stored once it has ended: no history, no log of who called whom. | stated: seed "don't save history"
MECH-07 | G3 | An incoming call rings on the called person's open app with the caller's email, Accept and Decline. | stated: seed "the other user the habilities to decline or accept"
MECH-08 | G3 | An accepted call carries voice only, both ways, with no encryption layer of the product's own, until either person hangs up. | stated: answer A-005
```

## Content contract

```vid-prd-contract
DIM-identity | Identity, accounts & access tiers | mechanism | required | covered_by: functional, data_entity, ux_flow, constraint | facets: tiers, signin_reauth, verification | status: covered
DIM-consent | Contact permission & consent handling | mechanism | required | covered_by: functional, nfr, constraint, data_entity, ux_flow | status: covered
DIM-lifecycle | Entity time-lifecycle | mechanism | required | covered_by: functional, data_entity, invariant, constraint | status: covered
DIM-authorization | Authorization: grants and denials | mechanism | required | covered_by: functional, nfr, invariant, constraint, data_entity, ux_flow | status: covered
DIM-notifications | Notifications: triggers, preferences, delivery | mechanism | required | covered_by: functional, data_entity, ux_flow | status: covered
DIM-data-integrity | Data identity, dedup & provenance recording | mechanism | required | covered_by: functional, data_entity, invariant, nfr, constraint | facets: record_identity, required_fields, dedup, provenance | status: covered
DIM-nfr-security | NFR: security | nfr | required | covered_by: nfr, constraint, invariant, functional | status: covered
DIM-nfr-privacy | NFR: privacy & data protection | nfr | required | covered_by: nfr, constraint, functional, data_entity | status: covered
DIM-nfr-availability | NFR: availability & performance | nfr | required | covered_by: nfr, constraint | status: covered
DIM-nfr-accessibility | NFR: accessibility | nfr | required | covered_by: nfr, constraint | status: covered
DIM-nfr-operability | NFR: operability (backup, observability, support) | nfr | required | covered_by: nfr, constraint, functional | facets: backup, observability, support | status: covered
DIM-core-loop-continuity | Core-loop continuity (post-action journeys & recovery) | mechanism | required | covered_by: functional, ux_flow, data_entity | status: covered
DIM-call-states | Call states, ringing, cancel, drop and races | mechanism | required | covered_by: functional, invariant, ux_flow, data_entity | prompt: A builder would invent the call states and end reasons, ring timeout and caller cancel, what a dropped connection or closed tab does, and who wins when two calls collide. | status: covered
DIM-presence | Online and busy status | mechanism | required | covered_by: functional, nfr, invariant, constraint, data_entity | prompt: A builder would invent what online and busy mean, how stale presence clears, and how several tabs of one person count and ring. | status: covered
DIM-lookup-disclosure | What one user learns about another | mechanism | required | covered_by: functional, ux_flow, invariant, constraint | prompt: A builder would invent whether the call box or the code screen reveals that an email has an account, is online or busy, and what the person called sees about the caller. | status: covered
DIM-otp-code | Sign-in code and session rules | mechanism | required | covered_by: functional, nfr, invariant, constraint | prompt: A builder would invent code length, expiry, single use, wrong-try limits, resend limits, what a failed email delivery shows, and how long a session lasts. | status: covered
DIM-media-permissions | Microphone permission and in-call audio | mechanism | required | covered_by: functional, ux_flow, constraint, invariant | prompt: A builder would invent whether audio flows before Accept, when the microphone is asked for, and what happens when it is refused or missing. | status: covered
DIM-nfr-call-connectivity | NFR: call setup and connectivity | nfr | required | covered_by: nfr, constraint | prompt: A builder would invent the call setup time bound and whether calls must still connect for people behind strict networks through a relay. | status: covered
DIM-no-history-residual | No-history guarantee and leftover data | nfr | required | covered_by: nfr, invariant, constraint, data_entity | prompt: A builder would invent what is still logged about calls in servers and records despite the no-history promise, making it silently false. | status: covered
```

## Criticality tiers

- **T0** — must never break or leak.
- **T1** — core behavior; getting it wrong is a defect.
- **T2** — desirable; getting it wrong is a fix-round item.

## Items

```vid-prd-features
FEAT-01 | G1 | Sign in with an email code
FEAT-02 | G2 | Call by email
FEAT-03 | G3 | Answer and talk
```

## Answer ledger

```vid-prd-answers
A-001 | human | 2026-11-26 | Q: Who can sign in? | A: Anyone with an email address; the account is made the first time they sign in with a code. | settles: MECH-02
A-002 | human | 2026-11-26 | Q: What does the caller see for an email with no account, or a person who is offline? | A: The same "not available" message in both cases, so nobody learns which emails have accounts. | settles: MECH-05 | importance: priority
A-003 | human | 2026-11-26 | Q: What happens if the person called is already in a call? | A: They count as not available; the caller sees the same "not available" message. | settles: MECH-04, MECH-05
A-004 | human | 2026-11-26 | Q: Is the call voice only? | A: Voice only, no video. | settles: MECH-08
A-005 | human | 2026-11-26 | Q: What does "don't encrypt voice" mean? | A: The product adds no end-to-end encryption layer of its own; the protection web browsers always apply to calls stays, since it cannot be switched off. | settles: MECH-08
A-006 | human | 2026-11-26 | Q: May people sign out? | A: Yes, with one sign-out button. | settles: MECH-03
A-007 | human | 2026-11-26 | Q: Boundary challenge: keep or cut the check that the other person is online before a call? | A: Keep. | settles: MECH-04
A-008 | human | 2026-11-26 | Q: Boundary challenge: keep or cut accept and decline for the person called? | A: Keep. | settles: MECH-07
A-009 | model_proposed | 2026-11-26 | Q: How long does an unanswered call ring? | A: 30 seconds; then it stops ringing on both sides and the caller sees "no answer". | settles: MECH-07 | shown: pause-1 4282354045
A-010 | model_proposed | 2026-11-26 | Q: Can the caller cancel while it rings? | A: Yes; cancelling stops the ringing for the person called at once. | settles: MECH-07 | shown: pause-1 4166101458
A-011 | model_proposed | 2026-11-26 | Q: Who can end an accepted call? | A: Either person, with one hang-up button; the call ends for both. | settles: MECH-08 | shown: pause-1 1988417829
A-012 | model_proposed | 2026-11-26 | Q: What counts as online? | A: Signed in with the app open in at least one browser tab; a person whose last tab closed or lost its connection counts as offline within 30 seconds. | settles: MECH-04 | shown: pause-1 1883215178
A-013 | model_proposed | 2026-11-26 | Q: Where does a call ring when the person called has the app open in several tabs? | A: In every open tab; the first Accept or Decline wins and the other tabs stop ringing. | settles: MECH-07 | shown: pause-1 2124821118
A-014 | model_proposed | 2026-11-26 | Q: What happens when someone types their own email? | A: They get the same "not available" message. | settles: MECH-05 | shown: pause-1 1099849679
A-015 | human | 2026-11-26 | Q: How does the sign-in code work? | A: 6 digits, valid for 10 minutes, usable once; after 5 wrong tries the code stops working and a new one must be requested; requesting a new code makes every earlier code for that email stop working. | settles: MECH-01
A-016 | human | 2026-11-26 | Q: How long does a person stay signed in? | A: 30 days from sign-in, or until they sign out; the session is never extended or refreshed, so after 30 days they sign in again with a new code. | settles: MECH-03
A-017 | model_proposed | 2026-11-26 | Q: What if the browser has no microphone permission? | A: The person is asked for it when they call or accept; if they refuse, the call does not start and they are told the microphone is needed. | settles: MECH-08 | shown: pause-1 2771397176
A-018 | model_proposed | 2026-11-26 | Q: Which emails does the product send? | A: Only the sign-in code email; nothing else. | settles: MECH-01 | shown: pause-1 3002457017
A-019 | model_proposed | 2026-11-26 | Q: What language is the interface in? | A: English only. | settles: thesis | shown: pause-1 1706355542
A-020 | human | 2026-11-26 | Q: Are emails told apart by letter case? | A: No; all emails are lowercase: any email typed is turned to lowercase before it is used or stored. | settles: MECH-02
A-021 | human | 2026-11-26 | Q: Which qualities must the product cover? | A: Accepted as recommended: the 19 dimensions in the contract; struck: operations, feedback intake, trust states, success thresholds, instrumentation; ruled out: search engines and several languages; the panel's blocking and reporting, repeated-ring limits, account suspension, email change and recovery, and a privacy notice are left out. | settles: contract
```

## Open decisions

None.

## Findings

### 2026-11-26 — pause 1 sitting

The thesis red-team returned a clean verdict: no findings.

## Ratifications

## Appends
