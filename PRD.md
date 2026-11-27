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

```vid-prd
REQ-001 | functional | T0 | Entering an email and asking for a code sends a sign-in code to that email; entering that code while it still works signs the person in, and the first sign-in with an email makes its account. | fail-if: (1) a person is signed in without entering the code sent to their email; (2) a working code entered in time does not sign the person in; (3) a first-time email that enters its code has no account and cannot call or be called | serves: the one way into the product, owned by whoever controls the mailbox | authority: authoritative | source: seed, A-001 | covers: DIM-identity/verification | phase: pilot | feature: FEAT-01 | plain: You sign in by entering the code sent to your email, and your account is made the first time you do.
REQ-002 | functional | T0 | A sign-in code has 6 digits, works for 10 minutes and only once; after 5 wrong tries it stops working; requesting a new code makes every earlier code for that email stop working. | fail-if: (1) a code signs someone in more than 10 minutes after it was sent; (2) a code signs someone in a second time; (3) a code still signs someone in after 5 wrong tries against it; (4) an earlier code still signs someone in after a newer one was requested for the same email; (5) a code is not 6 digits | serves: keeps anyone but the mailbox owner from guessing or reusing a code to take over an account | authority: authoritative | source: A-015 | covers: DIM-otp-code, DIM-identity/signin_reauth, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: A code has 6 digits, works once for 10 minutes, dies after 5 wrong tries, and asking for a new code kills older ones.
REQ-003 | functional | T1 | A session lasts 30 days from sign-in or until the person presses the one sign-out button; it is never extended or refreshed, and afterwards the person signs in again with a new code. | fail-if: (1) a session still lets someone call or be called more than 30 days after sign-in; (2) using the app pushes the session's end past 30 days from sign-in; (3) after sign-out the same browser can still call or be called without a new code; (4) a signed-in person cannot end their own session with a sign-out button | serves: a predictable, simple session with no refresh machinery, as the owner asked | authority: authoritative | source: A-016, A-006 | covers: DIM-otp-code, DIM-identity/signin_reauth | phase: pilot | feature: FEAT-01 | plain: You stay signed in for 30 days at most, never extended, or until you press sign out.
REQ-004 | data_entity | T1 | An account is one email, stored in lowercase; any email typed is turned to lowercase before it is used, so one email is one account whatever its letter case. | fail-if: (1) the same email typed in different letter case signs into two different accounts; (2) a call to an email typed with upper case letters does not reach the account of its lowercase form; (3) an account's email is stored with an upper case letter; (4) an account exists without an email | serves: one person, one account, one address to call | authority: authoritative | source: A-020, A-001 | covers: DIM-data-integrity/record_identity, DIM-data-integrity/dedup, DIM-data-integrity/required_fields | phase: pilot | feature: FEAT-01 | plain: Every email is turned to lowercase, so an email is always the same single account however it is typed.
REQ-005 | functional | T0 | Only a signed-in person can call or be called; every signed-in person can do both; only the person called can accept or decline their incoming call. | fail-if: (1) a signed-out visitor can start a call or make anyone's app ring; (2) a person with no session counts as online and can be rung; (3) anyone other than the person called can accept or decline the call; (4) a signed-in, online, free person is refused calling or being called | serves: calls happen only between people who proved their email | authority: authoritative | source: seed, thesis G2, A-001 | covers: DIM-authorization, DIM-identity/tiers | phase: pilot | feature: FEAT-02 | plain: Only signed-in people can call or be called, everyone signed in can do both, and only the person called can answer.
REQ-006 | functional | T1 | Typing an email and pressing call rings that person only when they are online and free, meaning not on a call: no call ringing to or from them and no connected call. | fail-if: (1) a call rings a person who is offline; (2) a call rings a person who is already on a call; (3) a call from a free caller with microphone access to another person who is online and free does not ring | serves: the owner's rule that a call is only available when the other person is online | authority: authoritative | source: seed, A-003, A-007, A-041 | covers: DIM-presence | phase: pilot | feature: FEAT-02 | plain: A call rings only when the other person is online and not on a call.
REQ-007 | functional | T0 | An email with no account, a person who is offline and a person already in a call all give the caller the same "not available" message, and nothing the caller can see tells these cases apart. | fail-if: (1) the caller sees a different message, wording or screen for an email with no account than for an offline person; (2) the caller can tell a busy person from an offline one; (3) any screen or server response tells the caller whether an email has an account | serves: nobody can use the call box to learn which emails have accounts or who is busy | authority: authoritative | source: A-002, A-003 | covers: DIM-lookup-disclosure, DIM-nfr-privacy | phase: pilot | feature: FEAT-02 | plain: Unknown, offline and busy people all give the same "not available" message, so the caller learns nothing more. | cross-cutting: call input screen, call request response, realtime presence channel
REQ-008 | functional | T1 | Calling your own email gives the same "not available" message. | fail-if: (1) a person can ring themselves; (2) calling your own email shows anything other than the "not available" message | serves: no call loops back to the caller | authority: provisional | confirms_via: owner-decision/no | source: A-014 | covers: DIM-lookup-disclosure | phase: pilot | feature: FEAT-02 | plain: Calling your own email just shows "not available".
REQ-009 | functional | T1 | A person counts as online while signed in with the app open in at least one browser tab, and as offline within 30 seconds after their last tab closes or loses its connection. | fail-if: (1) a person counts as online more than 30 seconds after their last tab closed or lost its connection; (2) a signed-in person with the app open and connected counts as offline | serves: the online check only offers calls that can actually ring | authority: provisional | confirms_via: owner-decision/no | source: A-012 | covers: DIM-presence | phase: pilot | feature: FEAT-02 | plain: You are online while the app is open and signed in, and offline within 30 seconds of closing it.
REQ-010 | functional | T1 | A person whose app is ringing counts as busy; when two calls collide, because two people call each other at once or two callers reach one person, only the first rings and the other caller sees "not available". | fail-if: (1) one person's app rings with two incoming calls at once; (2) two people calling each other at the same moment both ring or neither does; (3) a second caller reaching a ringing person hears ringing instead of "not available" | serves: no one is ever in two calls, and no call is lost in a collision | authority: provisional | confirms_via: owner-decision/no | source: A-028 | covers: DIM-call-states, DIM-presence | phase: pilot | feature: FEAT-02 | plain: Someone being rung counts as busy, and when two calls collide only the first one rings.
REQ-011 | ux_flow | T1 | An incoming call rings on the called person's open app showing only the caller's email, with Accept and Decline. | fail-if: (1) an incoming call does not show the caller's email; (2) the person called cannot accept the ringing call or cannot decline it from the ringing screen; (3) the incoming call shows anything about the caller beyond their email | serves: the person called decides, knowing who is calling | authority: authoritative | source: seed, thesis MECH-07 | covers: DIM-notifications, DIM-lookup-disclosure | phase: pilot | feature: FEAT-03 | plain: An incoming call shows the caller's email with Accept and Decline buttons.
REQ-012 | functional | T1 | When the person called has the app open in several tabs, the call rings in every open tab; the first Accept or Decline wins and the other tabs stop ringing. | fail-if: (1) an open, signed-in tab of the person called does not ring; (2) after Accept or Decline in one tab another tab keeps ringing; (3) two tabs can both accept the same call | serves: a call reaches the person wherever their app is open | authority: provisional | confirms_via: owner-decision/no | source: A-013 | covers: DIM-presence | phase: later | feature: FEAT-03 | plain: The call rings in every open tab, and the first tab to answer wins.
REQ-013 | functional | T2 | While an incoming call rings, the open app plays a ring sound; nothing alerts the person when the app is closed. | fail-if: (1) an incoming call rings silently in an open app; (2) the product sends any alert, email or notification about a call outside the open app | serves: the person called notices the call while keeping the product free of outside alerts | authority: provisional | confirms_via: owner-decision/no | source: A-035 | covers: DIM-notifications | phase: later | feature: FEAT-03 | plain: An incoming call plays a ring sound in the open app, and nothing alerts you when it is closed.
REQ-014 | functional | T0 | No audio passes between the two people before the person called presses Accept, and none after the call is declined, cancelled or hung up. | fail-if: (1) either person hears the other before the person called presses Accept; (2) audio keeps passing after a decline, a cancel or a hang-up | serves: the person called controls when they are heard, as accept and decline promise | authority: authoritative | source: seed | covers: DIM-media-permissions, DIM-nfr-security | phase: pilot | feature: FEAT-03 | plain: Nobody hears anybody until the person called presses Accept, and the sound stops as soon as the call ends.
REQ-015 | functional | T1 | An accepted call carries voice both ways and never video. | fail-if: (1) after Accept either person cannot hear the other; (2) the call turns on a camera or sends any video | serves: the voice call the owner asked for, nothing more | authority: authoritative | source: A-004, thesis G3 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: Once accepted, both people hear each other, and there is never video.
REQ-016 | functional | T1 | Either person can end an accepted call with one hang-up button, and it ends for both. | fail-if: (1) a person in an accepted call cannot end it with one hang-up press; (2) after one person hangs up the other is still in the call | serves: either side can leave a call at any moment | authority: provisional | confirms_via: owner-decision/no | source: A-011 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: Either person can hang up with one button, and the call ends for both.
REQ-017 | functional | T1 | An unanswered call rings for 30 seconds, then stops on both sides and the caller sees "no answer"; the caller can cancel while it rings, which stops the ringing for the person called at once. | fail-if: (1) a call keeps ringing more than 30 seconds without an answer; (2) after the ring times out the caller sees anything but "no answer"; (3) the caller cannot cancel a ringing call; (4) after a cancel the person called keeps ringing | serves: no call rings forever and the caller can change their mind | authority: provisional | confirms_via: owner-decision/no | source: A-009, A-010 | covers: DIM-call-states | phase: pilot | feature: FEAT-02 | plain: A call rings for 30 seconds at most, and the caller can cancel it while it rings.
REQ-018 | functional | T1 | If either person's connection drops for more than 10 seconds during a call, the call ends for both; there is no reconnect. | fail-if: (1) a call stays open more than 10 seconds after one person's connection dropped; (2) the person left behind is still shown as in a call afterwards; (3) a dropped person can rejoin the same call | serves: nobody stays stuck in a dead call or counted busy by one | authority: provisional | confirms_via: owner-decision/no | source: A-029 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: If someone's connection drops for more than 10 seconds, the call ends for both of you.
REQ-019 | ux_flow | T1 | When a call ends or does not start, both people see a short message saying why (declined, no answer, cancelled, call ended, not available) and are back at the call input. | fail-if: (1) after a call ends or fails a person is left on a screen with no way back to the call input; (2) the caller of a declined call is not told it was declined; (3) the end message names a reason other than what happened | serves: every call journey ends where the next one starts | authority: provisional | confirms_via: owner-decision/no | source: A-033 | covers: DIM-core-loop-continuity | phase: pilot | feature: FEAT-03 | plain: When a call ends or cannot start, you see why and land back at the email box.
REQ-020 | data_entity | T1 | A call exists only while it is live: it is ringing, then connected or ended; it ends as declined, no answer, cancelled, hung up or dropped, and is removed as soon as it ends; an end because the microphone failed at Accept or voice never connected counts as dropped, and an end by sign-out or session end counts as hung up. | fail-if: (1) a call record still exists after the call ended; (2) a call reaches a state outside ringing, connected and ended; (3) a call ends without one of the five end reasons | serves: one clear call lifecycle that leaves nothing behind | authority: provisional | confirms_via: owner-decision/no | source: seed, A-009, A-010, A-011, A-029, A-037, A-039 | covers: DIM-lifecycle, DIM-call-states | phase: pilot | feature: FEAT-02 | plain: A call only exists while it rings or runs, and it is gone the moment it ends.
REQ-021 | nfr | T0 | Nothing about a call is kept once it ends: no history, no list of past calls and no log anywhere, server logs included, that names who called whom. | fail-if: (1) after a call ends, any stored record, list or log, server, relay and error logs included, names either person in connection with that call, or lets the two people be linked across entries by a call id, an address or a time; (2) the app shows any past or missed call | serves: the owner's rule to save no history | authority: authoritative | source: seed | covers: DIM-no-history-residual, DIM-nfr-privacy | phase: pilot | feature: FEAT-02 | plain: Once a call ends, nothing anywhere records who called whom. | cross-cutting: app screens, server records, server logs, relay server logs, error logs
REQ-022 | functional | T1 | The microphone is asked for when a person calls or accepts; if it is refused or missing, the call does not start and the person is told the microphone is needed. | fail-if: (1) a call starts or is accepted with no microphone access; (2) a person who refused the microphone is not told why the call did not start; (3) the microphone is asked for before any call | serves: a call only connects when both can be heard | authority: provisional | confirms_via: owner-decision/no | source: A-017 | covers: DIM-media-permissions | phase: pilot | feature: FEAT-03 | plain: The app asks for your microphone when you call or answer, and stops the call if you refuse.
REQ-023 | functional | T1 | If the code email cannot be sent the person is told to try again; a new code can be requested at most once every 60 seconds per email, and at most 5 codes per email per hour from any one network address, after which that address is told to try again later. | fail-if: (1) a failed send still tells the person a code was sent; (2) two codes are sent to one email less than 60 seconds apart; (3) more than 5 codes are sent to one email within an hour at the request of one network address; (4) requests for an email from another network address are refused only because one address reached its hourly limit | serves: people are not left waiting for an email that never comes, no mailbox is flooded, and nobody can lock another person out | authority: provisional | confirms_via: owner-decision/no | source: A-030, A-045 | covers: DIM-otp-code, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: You can ask for a new code once a minute, and one network address gets at most 5 codes an hour per email.
REQ-024 | nfr | T1 | All page loads and call setup traffic use HTTPS; the session is kept in a cookie that page scripts cannot read; sign-in codes are stored only in hashed form. | fail-if: (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | serves: a stated security floor for sessions and codes | authority: provisional | confirms_via: owner-decision/no | source: A-034 | covers: DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: Pages and call setup go over HTTPS, the session cookie is hidden from scripts, and codes are stored only hashed. | cross-cutting: page delivery, call setup channel, session cookie, code storage
REQ-025 | nfr | T2 | The call screen loads within 3 seconds at the 75th percentile on a typical 4G phone connection, and the service is up 99% of each month. | fail-if: (1) the 75th percentile load of the call screen on a typical 4G phone connection exceeds 3 seconds; (2) the service is down more than 1% of a month | serves: a floor a slow or flaky build would break | authority: provisional | confirms_via: owner-decision/no | source: A-022 | covers: DIM-nfr-availability | phase: later | feature: FEAT-02 | plain: The call screen loads within 3 seconds on a phone, and the service is up 99% of the month.
REQ-026 | nfr | T2 | Every screen meets WCAG 2.1 AA: all controls work by keyboard and are labelled for screen readers, including Accept, Decline and hang-up. | fail-if: (1) a control cannot be reached or pressed by keyboard; (2) a control has no label a screen reader reads; (3) a screen fails a WCAG 2.1 AA check | serves: people using a keyboard or screen reader can call and answer | authority: provisional | confirms_via: owner-decision/no | source: A-023 | covers: DIM-nfr-accessibility | phase: later | feature: FEAT-03 | plain: Every screen works by keyboard and with screen readers, to the WCAG 2.1 AA level. | cross-cutting: sign-in screen, call input screen, incoming call screen, in-call screen
REQ-027 | nfr | T2 | Accounts are backed up daily and backups kept 7 days; server errors are logged and alert the operator; a stuck user reaches the operator at the address the code email comes from. | fail-if: (1) after a loss of accounts, the newest restorable backup is more than one day old; (2) a server error goes unrecorded and the operator is not alerted; (3) mail to the code email's sender address reaches nobody | serves: the operator can restore accounts, learns of breakage, and can be reached | authority: provisional | confirms_via: owner-decision/no | source: A-024 | covers: DIM-nfr-operability/backup, DIM-nfr-operability/observability, DIM-nfr-operability/support | phase: later | feature: FEAT-01 | plain: Accounts are backed up daily for 7 days, errors alert the operator, and users can write to the code email's sender.
REQ-028 | nfr | T1 | After Accept, voice connects within 5 seconds on typical networks, and calls also connect for people behind strict networks through a relay server. | fail-if: (1) on a typical network voice takes more than 5 seconds to connect after Accept; (2) a call between two people behind strict networks fails to connect | serves: calls work for everyone, not only on easy networks | authority: provisional | confirms_via: owner-decision/no | source: A-025 | covers: DIM-nfr-call-connectivity | phase: later | feature: FEAT-03 | plain: Voice connects within 5 seconds of Accept, even on strict networks.
REQ-029 | data_entity | T1 | Storage holds only each account's email and creation date, its sessions and live codes; who is online, busy or in a call, and the code request counters, are kept only in memory while live and never written to storage; used or expired codes and ended sessions are deleted; accounts are deleted only by the operator on request. | fail-if: (1) storage holds any personal data beyond email, creation date, sessions and codes; (2) online, busy or call state, or a code request counter, is written to storage; (3) a used or expired code or an ended session is still stored; (4) an account has no recorded creation date | serves: as little personal data as possible, as the owner asked | authority: provisional | confirms_via: owner-decision/no | source: A-042, A-026 | covers: DIM-nfr-privacy, DIM-data-integrity/provenance | phase: pilot | feature: FEAT-01 | plain: Storage keeps only your email, account date, sessions and live codes; who is online or in a call lives only in memory.
REQ-030 | functional | T1 | The only email the product sends is the sign-in code a person asked for; it never sends any other email. | fail-if: (1) the product sends an email nobody asked for; (2) the product sends any email other than a sign-in code | serves: asking for a code is the only consent needed, so no unsubscribe exists | authority: provisional | confirms_via: owner-decision/no | source: A-018 | covers: DIM-consent | phase: pilot | feature: FEAT-01 | plain: The only email you ever get is the sign-in code you asked for.
REQ-031 | functional | T1 | If the person called presses Accept but refuses the microphone or has none, or voice has not connected 15 seconds after Accept, the call ends for both; the caller sees "call ended"; the person called sees the microphone message when they refused the microphone or have none, and "call ended" when voice did not connect. | fail-if: (1) the caller keeps ringing or sits in a silent call after the person called refused the microphone at Accept; (2) a call whose voice never connects stays open for either person more than 15 seconds after Accept; (3) in these cases the caller sees anything but "call ended"; (4) the person called who refused the microphone or has none is not told the microphone is needed; (5) after a voice timeout with the microphone granted, the person called sees the microphone message | serves: nobody is left in a call that cannot carry voice, and nobody is given a false reason | authority: authoritative | source: A-037, A-043, A-046 | covers: DIM-call-states, DIM-media-permissions | phase: pilot | feature: FEAT-03 | plain: If the person called has no working microphone, or voice has not connected 15 seconds after Accept, the call ends.
REQ-032 | functional | T1 | A person whose own outgoing call is ringing counts as busy, so anyone calling them sees "not available". | fail-if: (1) a call rings a person whose own outgoing call is still ringing; (2) the second caller sees anything but "not available" | serves: no one ends up in two calls at once | authority: authoritative | source: A-038 | covers: DIM-presence, DIM-call-states | phase: pilot | feature: FEAT-02 | plain: While your own call is ringing out, you count as busy and nobody else can ring you.
REQ-033 | functional | T1 | Signing out, or the session ending, during a ringing or connected call ends that call at once for both; the other person sees "call ended". | fail-if: (1) a call keeps ringing or keeps carrying voice after one person signed out or their session ended; (2) the other person sees anything but "call ended" | serves: a signed-out person is never still in a call | authority: authoritative | source: A-039 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: Signing out, or your session running out, ends any call you are in for both people.
REQ-034 | functional | T1 | The sign-out button signs out only the browser it is pressed in; other browsers signed in with the same email stay signed in. | fail-if: (1) signing out in one browser signs out another browser of the same email; (2) the browser where sign-out was pressed is still signed in | serves: signing out one device does not cut off the person's others | authority: authoritative | source: A-040, A-006 | covers: DIM-identity/signin_reauth | phase: pilot | feature: FEAT-01 | plain: Signing out only signs out the browser you pressed it in.
REQ-035 | functional | T1 | In the first version, an incoming call rings only in the most recently opened of the person's tabs that is still open, signed in and connected, and only that tab can accept or decline; a tab counts as disconnected as soon as it closes, and no later than 30 seconds after it loses its connection. | fail-if: (1) a call rings in a tab other than the person's newest open, signed-in, connected tab; (2) a call rings in a tab that closed, or that lost its connection more than 30 seconds earlier, while an older connected tab exists; (3) a tab that is not ringing can accept or decline the call | serves: a call always reaches one live tab the person can answer from, until ringing in every tab comes later | authority: authoritative | source: A-044, A-047 | covers: DIM-presence | phase: pilot | feature: FEAT-03 | plain: The call rings only in your newest open, connected tab, and only that tab can answer.
CON-001 | constraint | T1 | The product adds no encryption layer of its own to the voice; the protection web browsers always apply to calls stays. | authority: authoritative | source: A-005 | feature: FEAT-03
INV-001 | invariant | T0 | At every moment each person is in at most one ringing or connected call, and audio passes only in a connected call, whatever order calls, accepts, cancels, drops and sign-outs happen in. | spans: REQ-006, REQ-010, REQ-014, REQ-016, REQ-017, REQ-018, REQ-031, REQ-032, REQ-033 | authority: authoritative | source: A-003, A-038, seed | phase: pilot | feature: FEAT-02 | plain: Nobody is ever in two calls at once, and sound only passes in a call that was accepted.
CON-002 | constraint | T2 | The interface is in English only. | authority: provisional | confirms_via: owner-decision/no | source: A-019
NG-001 | non_goal | - | No video and no group calls. | authority: authoritative | source: thesis, A-004
NG-002 | non_goal | - | No contacts, call history, missed-call records, chat, profiles, names or avatars. | authority: authoritative | source: seed, thesis
NG-003 | non_goal | - | No notifications outside the open app and no blocking or reporting. | authority: authoritative | source: thesis
NG-004 | non_goal | - | No account settings or deletion screens, passwords, other sign-in methods, or session refresh. | authority: authoritative | source: thesis, A-016
NG-005 | non_goal | - | No encryption layer of the product's own. | authority: authoritative | source: seed, A-005
```

## Answer ledger

```vid-prd-answers
A-001 | human | 2026-11-26 | Q: Who can sign in? | A: Anyone with an email address; the account is made the first time they sign in with a code. | settles: MECH-02 | importance: priority
A-002 | human | 2026-11-26 | Q: What does the caller see for an email with no account, or a person who is offline? | A: The same "not available" message in both cases, so nobody learns which emails have accounts. | settles: MECH-05 | importance: priority
A-003 | human | 2026-11-26 | Q: What happens if the person called is already in a call? | A: They count as not available; the caller sees the same "not available" message. | settles: MECH-04, MECH-05 | importance: priority
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
A-015 | human | 2026-11-26 | Q: How does the sign-in code work? | A: 6 digits, valid for 10 minutes, usable once; after 5 wrong tries the code stops working and a new one must be requested; requesting a new code makes every earlier code for that email stop working. | settles: MECH-01 | importance: priority
A-016 | human | 2026-11-26 | Q: How long does a person stay signed in? | A: 30 days from sign-in, or until they sign out; the session is never extended or refreshed, so after 30 days they sign in again with a new code. | settles: MECH-03
A-017 | model_proposed | 2026-11-26 | Q: What if the browser has no microphone permission? | A: The person is asked for it when they call or accept; if they refuse, the call does not start and they are told the microphone is needed. | settles: MECH-08 | shown: pause-1 2771397176
A-018 | model_proposed | 2026-11-26 | Q: Which emails does the product send? | A: Only the sign-in code email; nothing else. | settles: MECH-01 | shown: pause-1 3002457017
A-019 | model_proposed | 2026-11-26 | Q: What language is the interface in? | A: English only. | settles: thesis | shown: pause-1 1706355542
A-020 | human | 2026-11-26 | Q: Are emails told apart by letter case? | A: No; all emails are lowercase: any email typed is turned to lowercase before it is used or stored. | settles: MECH-02
A-021 | human | 2026-11-26 | Q: Which qualities must the product cover? | A: Accepted as recommended: the 19 dimensions in the contract; struck: operations, feedback intake, trust states, success thresholds, instrumentation; ruled out: search engines and several languages; the panel's blocking and reporting, repeated-ring limits, account suspension, email change and recovery, and a privacy notice are left out. | settles: contract
A-022 | model_proposed | 2026-11-26 | Q: What speed and uptime floor? | A: The call screen loads within 3 seconds at the 75th percentile on a typical 4G phone connection; the service is up 99% of each month. | settles: REQ-025 | shown: pause-2 3038431160
A-023 | model_proposed | 2026-11-26 | Q: What accessibility baseline? | A: WCAG 2.1 AA on every screen: every control works by keyboard and is labelled for screen readers. | settles: REQ-026 | shown: pause-2 2520056511
A-024 | model_proposed | 2026-11-26 | Q: Backups, error alerts and support? | A: Accounts backed up daily, backups kept 7 days; server errors logged and alert the operator; support is mail to the address the code email comes from. | settles: REQ-027 | shown: pause-2 1485033966
A-025 | model_proposed | 2026-11-26 | Q: How fast must a call connect, and on which networks? | A: Voice connects within 5 seconds after Accept on typical networks; a relay server is used so calls connect behind strict networks too. | settles: REQ-028 | shown: pause-2 3226784665
A-026 | model_proposed | 2026-11-26 | Q: What personal data is held and for how long? | A: Only each account's email and creation date, its sessions and unexpired codes; used or expired codes and ended sessions are deleted; accounts are deleted only by the operator on request. | settles: REQ-029 | shown: pause-2 3429698682
A-028 | model_proposed | 2026-11-26 | Q: What happens when calls collide? | A: A person whose app is ringing counts as busy; when two people call each other at once or two callers reach one person, only the first call rings and the other caller sees "not available". | settles: REQ-010 | shown: pause-2 524253536
A-029 | model_proposed | 2026-11-26 | Q: What happens when a connection drops mid-call? | A: If either person's connection drops for more than 10 seconds the call ends for both; there is no reconnect. | settles: REQ-018 | shown: pause-2 503979591
A-030 | model_proposed | 2026-11-26 | Q: What if the code email fails, and how often can a code be requested? | A: The person is told the code could not be sent and to try again; a new code can be requested at most once every 60 seconds per email. | settles: REQ-023 | shown: pause-2 3773481966
A-033 | model_proposed | 2026-11-26 | Q: What do people see after a call ends or fails to start? | A: A short message saying why (declined, no answer, cancelled, call ended, not available), then back at the call input; the caller of a declined call is told it was declined. | settles: REQ-019 | shown: pause-2 3618714988
A-034 | model_proposed | 2026-11-26 | Q: What is the security floor? | A: All page loads and call setup traffic over HTTPS; the session is kept in a cookie page scripts cannot read; sign-in codes are stored only in hashed form. | settles: REQ-024 | shown: pause-3 2043172081
A-035 | model_proposed | 2026-11-26 | Q: How does an incoming call get noticed? | A: The open app plays a ring sound while a call rings; nothing alerts a person when the app is closed. | settles: REQ-013 | shown: pause-2 2420300151
A-036 | human | 2026-11-26 | Q: Which rules move to later, to keep the first version on the initial scope? | A: Accepted as recommended: load speed and uptime, the accessibility level, backups, alerts and support, the connect time and relay server, the ring sound, and ringing in several tabs move to later; the security floor, no history and the "not available" rule stay in the first version. | settles: REQ-012, REQ-013, REQ-025, REQ-026, REQ-027, REQ-028
A-037 | human | 2026-11-26 | Q: The person called presses Accept but refuses the microphone, or the voice never connects: what happens? | A: Accepted as recommended: the call ends for both; the caller sees "call ended"; the person called sees the microphone message. | settles: DIM-call-states, DIM-media-permissions
A-038 | human | 2026-11-26 | Q: While your own outgoing call is ringing, can someone else call you? | A: Accepted as recommended: no; a person with an outgoing call ringing counts as busy, and the other caller sees "not available". | settles: DIM-call-states, DIM-presence | importance: priority
A-039 | human | 2026-11-26 | Q: What happens when someone signs out, or their session ends, during a ringing or connected call? | A: Accepted as recommended: the call ends at once for both; the other person sees "call ended". | settles: DIM-call-states
A-040 | human | 2026-11-26 | Q: Does the sign-out button sign out this browser or every device? | A: Accepted as recommended: only this browser. | settles: DIM-identity
A-041 | human | 2026-11-26 | Q: What does "free" to be called mean? | A: Free means the person is not on a call: no call ringing to or from them and no connected call; nobody can call themselves. | settles: REQ-006, REQ-005 | importance: priority
A-042 | human | 2026-11-26 | Q: What data does the product hold? | A: As little as possible: storage holds only each account's email and creation date, its sessions and live codes; who is online, busy or in a call, and the code request counters, are kept only in memory while live and are never written to storage. | settles: REQ-029
A-043 | human | 2026-11-26 | Q: How long after Accept may voice take to connect before the call ends? | A: Accepted as recommended: if voice has not connected 15 seconds after Accept, the call ends for both. | settles: REQ-031
A-044 | human | 2026-11-26 | Q: In the first version, where does a call ring when the person has several tabs open? | A: Accepted as recommended: only in the most recently opened of their tabs that is still open, signed in and connected; only that tab can accept or decline; ringing in every tab stays later. | settles: REQ-035
A-045 | human | 2026-11-26 | Q: What limit applies to code requests? | A: Accepted as recommended: at most 5 codes per email per hour from any one network address; after that that address is told to try again later; requests from other addresses for the same email are still served under the 60-second rule. | settles: REQ-023
A-046 | human | 2026-11-26 | Q: When voice does not connect within 15 seconds although the microphone works, what does the person called see? | A: Accepted as recommended: "call ended"; the microphone message is shown only when they refused the microphone or have none. | settles: REQ-031
A-047 | human | 2026-11-26 | Q: When does a tab count as disconnected for ringing? | A: Accepted as recommended: as soon as it closes, and no later than 30 seconds after it loses its connection, as a person is counted offline. | settles: REQ-035
```

## Open decisions

None.

## Findings

### 2026-11-26 — pause 1 sitting

The thesis red-team returned a clean verdict: no findings.

### 2026-11-26 — pause 2 sitting

```vid-prd-findings
F-01 | audit | advisory | DIM-call-states, REQ-022 | noted | evidence: gap — microphone refused at Accept or voice never connects has no outcome for the caller; answered by A-037, covered at augment
F-02 | audit | advisory | DIM-call-states, REQ-010 | noted | evidence: gap — whether a caller whose outgoing call rings is busy; answered by A-038, covered at augment
F-03 | audit | advisory | DIM-call-states, REQ-003 | noted | evidence: gap — sign-out or session end during a live call; answered by A-039, covered at augment
F-04 | audit | advisory | DIM-identity, REQ-003 | noted | evidence: gap — sign-out scope, this browser or every device; answered by A-040, covered at augment
```

### 2026-11-26 — pause 3 sitting

```vid-prd-findings
F-05 | review | blocking | REQ-021 | repaired | evidence: round 1 — the no-history falsifier only caught a record naming both people; split log lines, relay records and error logs could still rebuild who called whom; arm 1 strengthened from MECH-06 and the thesis
F-06 | review | blocking | INV-001, REQ-006, REQ-010, REQ-016, REQ-017, REQ-018, REQ-031, REQ-032, REQ-033 | repaired | evidence: round 1 — unguarded seam: no row falsified one person ending up in two calls across the busy-setting paths; INV-001 added
F-07 | review | advisory | REQ-020 | repaired | evidence: round 1 — the ends of REQ-031 and REQ-033 matched none of the five end reasons; REQ-020 now maps them to dropped and hung up
F-08 | review | advisory | REQ-007 | repaired | evidence: round 1 — unmarked cross-cutting demand; cross-cutting added: call input screen, call request response, realtime presence channel
F-09 | review | advisory | REQ-024, REQ-021, REQ-026 | repaired | evidence: round 1 — unmarked cross-cutting demands; cross-cutting added to each
F-10 | review | blocking | REQ-024, A-034 | repaired | evidence: round 2 — "all traffic uses HTTPS" cannot hold for browser voice or relay traffic; statement narrowed to page loads and call setup, arms kept word for word, relay channel removed from cross-cutting, A-034 restated to match
F-11 | review | blocking | INV-001, REQ-014 | repaired | evidence: round 2 — INV-001's audio clause restates REQ-014, which was missing from spans; added
F-12 | lens | advisory | REQ-003 | repaired | evidence: arms: 1 retained, 2 retained, 3 retained, 4 strengthened — now: (4) a signed-in person cannot end their own session with a sign-out button
F-13 | lens | advisory | REQ-011 | repaired | evidence: arms: 1 retained, 2 strengthened, 3 retained — now: (2) the person called cannot accept the ringing call or cannot decline it from the ringing screen
F-14 | lens | advisory | REQ-016 | repaired | evidence: arms: 1 strengthened, 2 retained — now: (1) a person in an accepted call cannot end it with one hang-up press
F-15 | lens | advisory | REQ-027 | repaired | evidence: arms: 1 strengthened, 2 strengthened, 3 retained — now: (1) after a loss of accounts, the newest restorable backup is more than one day old; (2) a server error goes unrecorded and the operator is not alerted
F-16 | review | blocking | REQ-006, REQ-005 | repaired | evidence: round 1 — "free" undefined, so correct builds failed REQ-006 arm 3; owner defined it (A-041), arm 3 restated
F-17 | review | blocking | REQ-029 | repaired | evidence: round 1 — the data-held list excluded the live online and call state every build needs; owner ruled storage minimal with live state in memory only (A-042)
F-18 | review | blocking | REQ-031 | repaired | evidence: round 1 — "voice never connects" had no bound; owner set 15 seconds (A-043)
F-19 | review | blocking | REQ-009, REQ-012, REQ-035 | repaired | evidence: round 1 — the first version had no rule for several open tabs; owner ruled the newest live tab rings (A-044), REQ-035 added
F-20 | review | blocking | REQ-023 | repaired | evidence: round 1 — critical — one code a minute allowed about 7,200 guesses a day; owner set an hourly cap (A-045)
F-21 | review | blocking | REQ-006 | repaired | evidence: round 2 — the draft for "free" put no condition on the caller; the caller must be free too (A-041)
F-22 | review | blocking | REQ-029, REQ-023 | repaired | evidence: round 2 — the draft omitted the code counters from the data held; included (A-042)
F-23 | review | blocking | REQ-035 | repaired | evidence: round 2 — the newest tab might be dead; the ringing tab must still be open, signed in and connected (A-044)
F-24 | review | blocking | REQ-023 | repaired | evidence: round 3 — a per-email hourly cap would let anyone lock a known email out; the cap counts per network address (A-045)
F-25 | review | blocking | REQ-031, REQ-019, A-037 | repaired | evidence: owner-ruling re-read, round 1 — a network timeout showed a false microphone reason; owner ruled "call ended" (A-046)
F-26 | review | blocking | REQ-035, REQ-009 | repaired | evidence: owner-ruling re-read, round 1 — no time bound for noticing a dead tab; owner set 30 seconds (A-047)
F-27 | review | blocking | REQ-031 | repaired | evidence: owner-ruling re-read, round 2 — arm 2 missed a call left open for one person only; strengthened to either person
F-28 | review | blocking | REQ-031 | repaired | evidence: owner-ruling re-read, round 3 — arm 4 missed a device with no microphone; strengthened to refused or missing
```

review: whole, round 3, 24 findings

### 2026-11-26 — test list strength review

```vid-prd-findings
F-29 | strength | blocking | INVENTORY.md:ROW-001 | repaired | evidence: sign-in round 1 — the real mail binding was never exercised; deploy-gate row added for a real code email on staging
F-30 | strength | blocking | INVENTORY.md:ROW-142 | repaired | evidence: sign-in round 1 — a fake mailer or bypass could be wired in the deployed config; deploy-gate row compares deployed configurations
F-31 | strength | blocking | INVENTORY.md:ROW-066 | routed OQ-6 | evidence: sign-in round 1 — in-memory request counters reset on idle eviction
F-32 | strength | advisory | INVENTORY.md:ROW-065 | noted | evidence: sign-in round 1 — the 60-second rule is per email whatever the address, as A-045 states; no change
F-33 | strength | advisory | INVENTORY.md:ROW-066 | repaired | evidence: sign-in round 1 — fixed clock-hour window; the hour is now rolling
F-34 | strength | advisory | INVENTORY.md:ROW-165 | repaired | evidence: sign-in round 1 — limits bounded only from above; lower bounds added for tries, resend and hourly codes
F-35 | strength | advisory | INVENTORY.md:ROW-160 | routed OQ-7 | evidence: sign-in round 1 — a failed send versus the newer-code-kills-older rule
F-36 | strength | advisory | INVENTORY.md:ROW-085 | repaired | evidence: sign-in round 1 — a session ending while a socket is open; covered
F-37 | strength | advisory | INVENTORY.md:ROW-072 | repaired | evidence: sign-in round 1 — no column census; tables now limited to named columns
F-38 | strength | advisory | INVENTORY.md:ROW-107 | repaired | evidence: sign-in round 1 — cleanup cadence and superseded codes; at least daily, all dead codes
F-39 | strength | advisory | INVENTORY.md:ROW-075 | repaired | evidence: sign-in round 1 — creation date rewritten on later sign-ins; must stay the first sign-in
F-40 | strength | advisory | INVENTORY.md:ROW-114 | repaired | evidence: sign-in round 1 — blocklist validator; one bare address only
F-41 | strength | advisory | INVENTORY.md:ROW-140 | repaired | evidence: sign-in round 1 — no deletion path to test through; the row now names the operator's removal of rows
F-42 | strength | advisory | INVENTORY.md:ROW-100 | repaired | evidence: sign-in round 1 — a silent call passes a UI check; inbound audio bytes asserted
F-43 | strength | advisory | INVENTORY.md:ROW-121 | repaired | evidence: sign-in round 1 — static assets skip the Worker's headers; asset paths fetched
F-44 | strength | advisory | INVENTORY.md:ROW-124 | repaired | evidence: sign-in round 1 — Math.random could be bound at the root; source check added
F-45 | strength | blocking | INVENTORY.md:ROW-141 | repaired | evidence: table round 1 — conflicted with the 60-second refusal; the someone-else-asked clause dropped
F-46 | strength | blocking | INVENTORY.md:ROW-160 | routed OQ-7 | evidence: table round 1 — whether a failed-send request counts as requested
F-47 | strength | blocking | INVENTORY.md:ROW-139 | repaired | evidence: table round 1 — sign-out made the whole email offline; limited to that browser
F-48 | strength | blocking | INVENTORY.md:ROW-066 | routed OQ-6 | evidence: table round 1 — the hourly cap cannot hold across eviction under memory-only counters
F-49 | strength | advisory | INVENTORY.md:ROW-131 | repaired | evidence: table round 1 — whether attachments count as storage; D-022 settles it
F-50 | strength | advisory | INVENTORY.md:ROW-127 | repaired | evidence: table round 1 — the caller's permission-check track; stopped at once
F-51 | strength | advisory | INVENTORY.md:ROW-149 | repaired | evidence: table round 1 — own servers unnamed; stun.cloudflare.com named
F-52 | strength | advisory | INVENTORY.md:ROW-022, INVENTORY.md:ROW-033 | noted | evidence: table round 1 — near-repeat rows on busy; kept apart, each tests a separate path
F-53 | strength | advisory | INVENTORY.md:ROW-119, INVENTORY.md:ROW-121 | noted | evidence: table round 1 — repeated no-cache clause; kept apart, one tests sessions, one headers
F-54 | strength | advisory | INVENTORY.md:ROW-068 | noted | evidence: table round 1 — cross-cutting rows carry the whole fail-if; each test asserts only the clause its surface owns
F-55 | strength | blocking | INVENTORY.md:ROW-039 | repaired | evidence: table round 1 — STUN never needed in Docker; DIF-002 and a staging call row added
F-56 | strength | advisory | INVENTORY.md:ROW-068, INVENTORY.md:ROW-116 | repaired | evidence: table round 1 — edge HTTPS and client address unobservable locally; DIF-003 and a gate-2 row
F-57 | strength | advisory | INVENTORY.md:ROW-121 | repaired | evidence: table round 1 — RULE-008 now covers assets
F-58 | strength | advisory | INVENTORY.md:ROW-122 | repaired | evidence: table round 1 — RULE-003 now covers thrown errors
F-59 | strength | advisory | INVENTORY.md:ROW-115 | repaired | evidence: table round 1 — RULE-006 keyed on the email type, not named entries
F-60 | strength | advisory | INVENTORY.md:ROW-017 | repaired | evidence: table round 1 — actor corrected to anonymous
F-61 | strength | advisory | INVENTORY.md:ROW-095 | repaired | evidence: table round 1 — actors and derived-from corrected on ROW-095, 112, 178, 014, 161, 165
F-62 | strength | blocking | INVENTORY.md:ROW-039 | repaired | evidence: calling round 1 — one fake tone for both sides hides self-playback; distinct sources per browser
F-63 | strength | blocking | INVENTORY.md:ROW-131 | repaired | evidence: calling round 1 — busy state lost across hibernation; D-022 attachments and a rebuild test
F-64 | strength | blocking | INVENTORY.md:ROW-128 | repaired | evidence: calling round 1 — clean closes only; frozen connection tested
F-65 | strength | blocking | INVENTORY.md:ROW-122 | repaired | evidence: calling round 1 — emails in URLs reach platform logs; URL rule and a deployed logging row
F-66 | strength | blocking | INVENTORY.md:ROW-139 | repaired | evidence: calling round 1 — sign-out offline for every browser; limited to that browser
F-67 | strength | blocking | INVENTORY.md:ROW-085 | repaired | evidence: calling round 1 — no operator for the session-end deadline; ROW-190 added
F-68 | strength | blocking | INVENTORY.md:ROW-017 | repaired | evidence: calling round 1 — a present but invalid cookie; expired, signed-out and random cookies tested
F-69 | strength | advisory | INVENTORY.md:ROW-149 | repaired | evidence: calling round 1 — fallback to another STUN server; allowed host named
F-70 | strength | advisory | INVENTORY.md:ROW-152 | noted | evidence: calling round 1 — hidden-tab throttling; the row stands, the test emulates a hidden page
F-71 | strength | advisory | INVENTORY.md:ROW-089 | repaired | evidence: calling round 1 — newest tab means most recently opened
F-72 | strength | advisory | INVENTORY.md:ROW-027 | repaired | evidence: calling round 1 — own email in mixed case
F-73 | strength | advisory | INVENTORY.md:ROW-113 | repaired | evidence: calling round 1 — the hostile email must pass sign-in
F-74 | strength | advisory | INVENTORY.md:ROW-137 | repaired | evidence: calling round 1 — caps had no numbers; D-023 numbers
F-75 | strength | advisory | INVENTORY.md:ROW-024 | repaired | evidence: calling round 1 — timing could separate the not-available cases
F-76 | strength | advisory | INVENTORY.md:ROW-112 | repaired | evidence: calling round 1 — Origin tested from a sibling subdomain and null
F-77 | strength | advisory | INVENTORY.md:ROW-020 | repaired | evidence: calling round 1 — busy clearing after every end reason
F-78 | strength | advisory | INVENTORY.md:ROW-040 | repaired | evidence: calling round 1 — the camera captured but not sent
F-79 | strength | advisory | INVENTORY.md:ROW-059 | repaired | evidence: calling round 1 — relay logs unobservable; the row now forbids any relay in the first version
F-80 | strength | advisory | INVENTORY.md:ROW-053 | repaired | evidence: calling round 1 — ended call ids kept as tombstones
F-81 | strength | blocking | INVENTORY.md:ROW-112 | repaired | evidence: strength round 2 — required behaviour under a never-happens prefix on 20 rows; reworded
F-82 | strength | blocking | INVENTORY.md:ROW-131 | repaired | evidence: strength round 2 — the server closing every socket mid-call; added
F-83 | strength | blocking | INVENTORY.md:ROW-137 | repaired | evidence: strength round 3 — nine forbidden-outcome rows inverted by the round-2 rewording; restored
F-84 | strength | blocking | INVENTORY.md:ROW-113 | repaired | evidence: strength round 3 — the hostile email could not pass sign-in; named accepted hostile emails
F-85 | strength | blocking | INVENTORY.md:ROW-131 | repaired | evidence: strength round 3 — timers lost on rebuild; deadlines kept in attachments and tested
F-86 | strength | blocking | INVENTORY.md:ROW-066 | routed OQ-6 | evidence: strength round 3 — request counters across eviction
```

review: whole, round 3, 58 findings

### 2026-11-26 — final review

```vid-prd-findings
F-102 | final | blocking | DECISIONS.md:D-005, DECISIONS.md:D-011, ARCHITECTURE.md, BASELINE.md, GRADING-CHECKLIST.md, INVENTORY.md:ROW-164 | repaired | evidence: round 1 — counters still placed in switchboard memory against A-053; D-025, architecture, baseline, checklist and rows updated
F-103 | final | blocking | BASELINE.md, ARCHITECTURE.md, INVENTORY.md:ROW-117, INVENTORY.md:ROW-072 | repaired | evidence: round 1 — newer-kills-older wording out of date after A-049 and A-055; rewritten
F-104 | final | blocking | REQ-029, INVENTORY.md:ROW-107 | repaired | evidence: round 1 — no deletion trigger for counters and totals; D-026 and ROW-217
F-105 | final | blocking | REQ-037, REQ-038, INVENTORY.md:ROW-116 | repaired | evidence: round 1 — network address undefined outside ROW-116; D-027 and every per-address row
F-106 | final | advisory | REQ-038, ARCHITECTURE.md, DECISIONS.md:D-008 | repaired | evidence: round 1 — operator address unrecorded, alerts unbounded; D-028 and an owner-only step
F-107 | final | blocking | REQ-029, INVENTORY.md:ROW-073, INVENTORY.md:ROW-211 | repaired | evidence: round 2 — sweep lag against one-hour retention; owner ruled A-061
F-108 | final | blocking | INVENTORY.md:ROW-203, DECISIONS.md:D-028 | repaired | evidence: round 2 — the row demanded an alert every day; only on a day reaching 500
```

review: final, round 3, 7 findings, read: PRD.md ARCHITECTURE.md DECISIONS.md BASELINE.md INVENTORY.md GRADING-CHECKLIST.md

## Ratifications

- 2026-11-27 — thesis+contract — 4b2a9b5
- 2026-11-27 — gap answers — 6f41bac
- 2026-11-27 — final — b54b55b

## Appends

### 2026-11-27 (test list questions raised by the reviews)

RESOLVED: (OQ-1) A-048 — Before the person called presses Accept, may either browser learn the other's network address? ViD recommends no: the connection is set up only after Accept, within the 15-second limit.

RESOLVED: (OQ-2) A-049 — Anyone who knows an email can request a new code every 60 seconds and so keep cancelling the owner's code. Should a new code cancel earlier ones only when requested from the same network address? ViD recommends yes.

RESOLVED: (OQ-3) A-050 — Codes can be guessed slowly from many addresses. Should one network address be limited to 10 wrong code tries an hour across all emails? ViD recommends yes.

RESOLVED: (OQ-4) A-051 — One network address can make the product email codes to unlimited different people. Should it be limited to 10 code emails an hour across all emails, with at most 500 code emails a day in total? ViD recommends yes.

RESOLVED: (OQ-5) A-052 — Lookalike emails (foreign letters that look Latin, invisible characters) can impersonate a known caller on the ring. Should only plain ASCII emails be accepted? ViD recommends yes.

RESOLVED: (OQ-6) A-053 — The code limits live in memory only, so they reset when the server restarts or sits idle. Keep the code request counters in the database for one hour instead, holding only a hashed email and address? ViD recommends yes.

RESOLVED: (OQ-7) A-054 — If a code email fails to send, does that request still cancel the earlier working code? ViD recommends no: only a code actually sent cancels earlier ones.

### 2026-11-27 (owner answers at the test-list sitting)

```vid-prd-answers
A-048 | human | 2026-11-26 | Q: Before Accept, may either browser learn the other's network address? | A: Accepted as recommended: no; the connection is set up only after Accept, within the 15-second limit. | settles: REQ-036 | importance: priority
A-049 | human | 2026-11-26 | Q: Should a new code cancel earlier ones only when requested from the same network address? | A: Accepted as recommended: yes; a new code cancels earlier codes for that email only when requested from the same network address. | settles: REQ-002 | importance: priority
A-050 | human | 2026-11-26 | Q: Should one network address be limited in wrong code tries? | A: Accepted as recommended: at most 10 wrong code tries an hour per network address, across all emails. | settles: REQ-037
A-051 | human | 2026-11-26 | Q: Should one network address be limited in the code emails it triggers, and what happens at a daily total? | A: At most 10 code emails an hour per network address across all emails; when 500 code emails have gone out in a day the operator is alerted and sending continues under the per-address limits. | settles: REQ-038
A-052 | human | 2026-11-26 | Q: Which emails are accepted? | A: Accepted as recommended: only plain ASCII email addresses. | settles: REQ-039
A-053 | human | 2026-11-26 | Q: Where are the code limit counters kept? | A: Request and wrong-try counters are kept in the database for one hour, holding only a keyed hash of the email or address; the daily total of code emails holds no email or address and is kept for one day. | settles: REQ-029, REQ-037
A-054 | human | 2026-11-26 | Q: Does a code email that fails to send cancel the earlier working code? | A: Accepted as recommended: no; only a code actually sent cancels earlier ones. | settles: REQ-002 | importance: priority
A-015 AMENDED | human | 2026-11-26 | Q: How does the sign-in code work? | A: 6 digits, valid for 10 minutes, usable once; after 5 wrong tries the code stops working and a new one must be requested; a new code that is actually sent cancels every earlier code for that email requested from the same network address. | settles: MECH-01 | importance: priority
A-042 AMENDED | human | 2026-11-26 | Q: What data does the product hold? | A: As little as possible: storage holds only each account's email and creation date, its sessions and live codes, for one hour the request and wrong-try counters holding only a keyed hash of the email or address, and for one day the total of code emails sent; who is online, busy or in a call is kept only in memory while live and never written to storage. | settles: REQ-029
A-026 AMENDED | model_proposed | 2026-11-26 | Q: What personal data is held and for how long? | A: Only each account's email and creation date, its sessions and unexpired codes, for one hour the request and wrong-try counters holding only a keyed hash of the email or address, and for one day the total of code emails sent; used or expired codes and ended sessions are deleted; accounts are deleted only by the operator on request. | settles: REQ-029
A-055 | human | 2026-11-26 | Q: When one email has several live codes, which code does a wrong try count against? | A: A typed code is checked against each live code of the email; a wrong try counts only against the codes requested from the network address that typed it. | settles: REQ-002 | importance: priority
A-001 AMENDED | human | 2026-11-26 | Q: Who can sign in? | A: Anyone with a plain ASCII email address; the account is made the first time they sign in with a code. | settles: MECH-02 | importance: priority
A-058 | human | 2026-11-26 | Q: When a shared network address has reached 10 wrong tries in the hour, is a correct code from that address refused? | A: Accepted as recommended: yes; the address limit wins, a correct code from that address is refused until the hour passes and still works from another address. | settles: REQ-001, REQ-037 | importance: priority
A-059 | human | 2026-11-26 | Q: How is the operator alerted when 500 code emails go out in a day? | A: Accepted as recommended: by an email to the operator's own address; the only-the-code-email rule applies to people using the product, not the operator. | settles: REQ-038, REQ-030
A-060 | human | 2026-11-26 | Q: Who besides the operator may receive an email other than the code they asked for? | A: Accepted as recommended: nobody; anyone other than the operator only ever gets the sign-in code they asked for, and the operator gets the daily-total alert and, when they are built, the server-error alerts. | settles: REQ-030 | unchanged: REQ-027
A-018 AMENDED | human | 2026-11-26 | Q: Which emails does the product send? | A: To anyone other than the operator, only the sign-in code they asked for; to the operator's own address, the daily-total alert and, when built, server-error alerts. | settles: MECH-01
```

```vid-prd
REQ-002 AMENDED | functional | T0 | A sign-in code has 6 digits, works for 10 minutes and only once; a typed code is checked against each live code of the email, and after 5 wrong tries from the network address that requested a code that code stops working; a new code that is actually sent makes every earlier code for that email requested from the same network address stop working. | fail-if: (1) a code signs someone in more than 10 minutes after it was sent; (2) a code signs someone in a second time; (3) a code still signs someone in after 5 wrong tries against it from the network address that requested it; (4) an earlier code still signs someone in after a newer one was sent for the same email at the request of the same network address; (5) a code is not 6 digits; (6) a request from another network address, or a request whose email failed to send, makes an earlier working code stop working; (7) wrong tries from one network address make a code requested from another network address stop working | serves: keeps anyone but the mailbox owner from guessing or reusing a code, and keeps others from cancelling it | authority: authoritative | source: A-015, A-049, A-054, A-055 | covers: DIM-otp-code, DIM-identity/signin_reauth, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: A code has 6 digits, works once for 10 minutes, dies after 5 wrong tries from its own address, and only your own newer code kills it. | arms: 1 retained, 2 retained, 3 withdrawn A-055, 4 withdrawn A-049, 5 retained
REQ-029 AMENDED | data_entity | T1 | Storage holds only each account's email and creation date, its sessions and live codes, for one hour the request and wrong-try counters holding only a keyed hash of the email or address, whose key is not stored with them, and for one day the total of code emails sent; each live code records its requesting network address only as a keyed hash; who is online, busy or in a call is kept only in memory while live and never written to storage; used or expired codes and ended sessions are deleted; accounts are deleted only by the operator on request. | fail-if: (1) storage holds any personal data beyond email, creation date, sessions, codes and keyed-hash counters; (2) online, busy or call state is written to storage, or a counter is kept over one hour, holds a plain email or address, or holds a hash computable without a key kept apart from the counters; (3) a used or expired code or an ended session is still stored; (4) an account has no recorded creation date; (5) the daily total holds an email or address or is kept over one day; (6) a stored code holds its requesting network address in plain form or as a hash computable without a key kept apart from storage | serves: as little personal data as possible while the code limits hold | authority: provisional | confirms_via: owner-decision/no | source: A-042, A-053, A-026 | covers: DIM-nfr-privacy, DIM-data-integrity/provenance | phase: pilot | feature: FEAT-01 | plain: Storage keeps your email, account date, sessions, live codes and one hour of hashed counts; who is online lives only in memory. | arms: 1 withdrawn A-053, 2 withdrawn A-053, 3 retained, 4 retained
REQ-036 | functional | T1 | Before the person called presses Accept, no session description, connection candidate or network address passes between the two browsers in either direction, and the person called creates no peer connection; the connection is set up only after Accept. | fail-if: (1) before Accept either browser receives anything that reveals the other's network address; (2) a declined, cancelled or unanswered call reveals either person's address; (3) the person called creates a peer connection before Accept | serves: nobody can learn where a person is by ringing them | authority: authoritative | source: A-048 | covers: DIM-lookup-disclosure, DIM-nfr-privacy | phase: pilot | feature: FEAT-03 | plain: Until the person called presses Accept, neither side can learn the other's network address.
REQ-037 | functional | T1 | One network address gets at most 10 wrong code tries an hour across all emails; further tries are refused without being checked, and the person is told to try again later. | fail-if: (1) an 11th wrong try within an hour from one network address is checked against a code; (2) the refusal differs between emails with and without an account; (3) after 10 wrong tries within an hour from one network address, a further try from that address signs someone in, even with a working code | serves: slow guessing across many accounts from one place stops | authority: authoritative | source: A-050 | covers: DIM-otp-code, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: One network address gets at most 10 wrong code tries an hour, whatever emails it tries.
REQ-038 | functional | T1 | One network address triggers at most 10 code emails an hour across all emails, and a refused request is told to try again later; when 500 code emails have gone out in a day the operator is alerted by an email to the operator's own address and sending continues under the per-address limits. | fail-if: (1) an 11th code email within an hour at the request of one network address is sent; (2) the 500th code email in a day sends no alert email to the operator; (3) reaching 500 code emails in a day stops code emails for everyone | serves: the product cannot be used to spam people, and nobody can stop everyone's sign-in | authority: authoritative | source: A-051, A-059 | covers: DIM-otp-code, DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: One network address can trigger at most 10 code emails an hour; at 500 a day the operator is emailed.
REQ-039 | functional | T1 | Only plain ASCII email addresses are accepted wherever an email is typed. | fail-if: (1) an email holding any non-ASCII or invisible character is accepted at sign-in or in the call box | serves: lookalike letters cannot impersonate a known caller | authority: authoritative | source: A-052 | covers: DIM-data-integrity/record_identity, DIM-lookup-disclosure | phase: pilot | feature: FEAT-01 | plain: Only plain ASCII email addresses are accepted. | cross-cutting: sign-in screen, code request response, call input screen, call request response
REQ-001 AMENDED | functional | T0 | Entering an email and asking for a code sends a sign-in code to that email; entering that code while it still works signs the person in, unless their network address has reached its hourly wrong-try limit, and the first sign-in with an email makes its account. | fail-if: (1) a person is signed in without entering the code sent to their email; (2) a working code entered in time does not sign the person in, while their network address is under its hourly wrong-try limit; (3) a first-time email that enters its code has no account and cannot call or be called | serves: the one way into the product, owned by whoever controls the mailbox | authority: authoritative | source: seed, A-001, A-058 | covers: DIM-identity/verification | phase: pilot | feature: FEAT-01 | plain: You sign in by entering the code sent to your email, and your account is made the first time you do. | arms: 1 retained, 2 withdrawn A-058, 3 retained
REQ-030 AMENDED | functional | T1 | The only email the product sends to anyone other than the operator is the sign-in code that was asked for; the operator's own address gets only the daily-total alert and, when they are built, the server-error alerts. | fail-if: (1) the product sends anyone other than the operator an email they did not ask for; (2) the product sends anyone other than the operator any email other than a sign-in code; (3) the product sends the operator any email other than the daily-total alert and server-error alerts | serves: asking for a code is the only consent needed, so no unsubscribe exists | authority: authoritative | source: A-018, A-059, A-060 | covers: DIM-consent | phase: pilot | feature: FEAT-01 | plain: Nobody but the operator ever gets an email other than the sign-in code they asked for. | arms: 1 withdrawn A-059, 2 withdrawn A-059
```

```vid-prd-findings
F-87 | review | blocking | REQ-002 | repaired | evidence: round 1 — several live codes per email left wrong-try counting undefined; owner ruled A-055
F-88 | review | blocking | REQ-029, REQ-038, REQ-037 | repaired | evidence: round 1 — the one-hour counter limit contradicted the daily total; owner ruled A-053
F-89 | review | blocking | REQ-037 | repaired | evidence: round 1 — a correct guess after the limit could still sign in; arm 3 added
F-90 | review | blocking | REQ-038, REQ-023, A-045 | repaired | evidence: round 1 — the daily stop let anyone lock everyone out; owner ruled an alert instead, A-051
F-91 | review | advisory | REQ-039 | repaired | evidence: round 1 — unmarked cross-cutting; surfaces named
F-92 | review | advisory | A-001, A-052 | repaired | evidence: round 1 — A-001 restated for ASCII emails, owner ruling
F-93 | review | advisory | A-026, A-053 | repaired | evidence: round 1 — A-026 amended to the new data held
F-94 | review | advisory | REQ-037, REQ-038 | repaired | evidence: round 1 — refusal wording added: told to try again later
F-95 | review | advisory | REQ-029 | repaired | evidence: round 1 — unkeyed hashes reversible; keyed hash with the key kept apart
F-96 | review | blocking | REQ-037, REQ-001 | repaired | evidence: round 2 — a correct code refused on a blocked address contradicted REQ-001; owner ruled A-058
F-97 | review | blocking | REQ-038, REQ-030 | repaired | evidence: round 2 — the operator alert had no channel; owner ruled email, A-059
F-98 | review | blocking | REQ-029 | repaired | evidence: round 2 — the address kept with each code; keyed hash only, arm 6
F-99 | review | blocking | REQ-030 | repaired | evidence: round 3 — the reworded email rule let non-users be emailed; owner restored it, A-060
F-100 | review | blocking | REQ-030, REQ-027, A-024 | repaired | evidence: round 3 — operator error alerts would break arm 3; server-error alerts allowed
F-101 | review | blocking | A-018, A-059 | repaired | evidence: round 3 — A-018 disagreed with A-059; restated
```

review: delta, round 3, 15 findings

### 2026-11-27 (final review repairs)

```vid-prd-answers
A-061 | human | 2026-11-26 | Q: May counters and the daily total outlive their one hour or one day until the next cleanup? | A: Accepted as recommended: counters over one hour and daily totals over one day are deleted at the next cleanup run, which runs at least every 15 minutes. | settles: REQ-029
```

```vid-prd
REQ-029 AMENDED | data_entity | T1 | Storage holds only each account's email and creation date, its sessions and live codes, for one hour the request and wrong-try counters holding only a keyed hash of the email or address, whose key is not stored with them, and for one day the total of code emails sent; each live code records its requesting network address only as a keyed hash; who is online, busy or in a call is kept only in memory while live and never written to storage; used or expired codes and ended sessions are deleted; accounts are deleted only by the operator on request. | fail-if: (1) storage holds any personal data beyond email, creation date, sessions, codes and keyed-hash counters; (2) online, busy or call state is written to storage, or a counter older than one hour survives the next cleanup run (at least every 15 minutes), holds a plain email or address, or holds a hash computable without a key kept apart from the counters; (3) a used or expired code or an ended session is still stored; (4) an account has no recorded creation date; (5) the daily total holds an email or address or, older than one day, survives the next cleanup run; (6) a stored code holds its requesting network address in plain form or as a hash computable without a key kept apart from storage | serves: as little personal data as possible while the code limits hold | authority: provisional | confirms_via: owner-decision/no | source: A-042, A-053, A-026, A-061 | covers: DIM-nfr-privacy, DIM-data-integrity/provenance | phase: pilot | feature: FEAT-01 | plain: Storage keeps your email, account date, sessions, live codes and one hour of hashed counts; who is online lives only in memory. | arms: 1 retained, 2 withdrawn A-061, 3 retained, 4 retained, 5 withdrawn A-061, 6 retained
```

review: final, round 3, 0 findings, see 2026-11-26 — final review
