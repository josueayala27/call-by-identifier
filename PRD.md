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
REQ-003 | functional | T1 | A session lasts 30 days from sign-in or until the person presses the one sign-out button; it is never extended or refreshed, and afterwards the person signs in again with a new code. | fail-if: (1) a session still lets someone call or be called more than 30 days after sign-in; (2) using the app pushes the session's end past 30 days from sign-in; (3) after sign-out the same browser can still call or be called without a new code; (4) there is no sign-out button for a signed-in person | serves: a predictable, simple session with no refresh machinery, as the owner asked | authority: authoritative | source: A-016, A-006 | covers: DIM-otp-code, DIM-identity/signin_reauth | phase: pilot | feature: FEAT-01 | plain: You stay signed in for 30 days at most, never extended, or until you press sign out.
REQ-004 | data_entity | T1 | An account is one email, stored in lowercase; any email typed is turned to lowercase before it is used, so one email is one account whatever its letter case. | fail-if: (1) the same email typed in different letter case signs into two different accounts; (2) a call to an email typed with upper case letters does not reach the account of its lowercase form; (3) an account's email is stored with an upper case letter; (4) an account exists without an email | serves: one person, one account, one address to call | authority: authoritative | source: A-020, A-001 | covers: DIM-data-integrity/record_identity, DIM-data-integrity/dedup, DIM-data-integrity/required_fields | phase: pilot | feature: FEAT-01 | plain: Every email is turned to lowercase, so an email is always the same single account however it is typed.
REQ-005 | functional | T0 | Only a signed-in person can call or be called; every signed-in person can do both; only the person called can accept or decline their incoming call. | fail-if: (1) a signed-out visitor can start a call or make anyone's app ring; (2) a person with no session counts as online and can be rung; (3) anyone other than the person called can accept or decline the call; (4) a signed-in, online, free person is refused calling or being called | serves: calls happen only between people who proved their email | authority: authoritative | source: seed, thesis G2, A-001 | covers: DIM-authorization, DIM-identity/tiers | phase: pilot | feature: FEAT-02 | plain: Only signed-in people can call or be called, everyone signed in can do both, and only the person called can answer.
REQ-006 | functional | T1 | Typing an email and pressing call rings that person only when they are online and not already in a call. | fail-if: (1) a call rings a person who is offline; (2) a call rings a person who is already in a call; (3) a call to an online person who is not in a call does not ring | serves: the owner's rule that a call is only available when the other person is online | authority: authoritative | source: seed, A-003, A-007 | covers: DIM-presence | phase: pilot | feature: FEAT-02 | plain: A call rings only when the other person is online and not already in a call.
REQ-007 | functional | T0 | An email with no account, a person who is offline and a person already in a call all give the caller the same "not available" message, and nothing the caller can see tells these cases apart. | fail-if: (1) the caller sees a different message, wording or screen for an email with no account than for an offline person; (2) the caller can tell a busy person from an offline one; (3) any screen or server response tells the caller whether an email has an account | serves: nobody can use the call box to learn which emails have accounts or who is busy | authority: authoritative | source: A-002, A-003 | covers: DIM-lookup-disclosure, DIM-nfr-privacy | phase: pilot | feature: FEAT-02 | plain: Unknown, offline and busy people all give the same "not available" message, so the caller learns nothing more.
REQ-008 | functional | T1 | Calling your own email gives the same "not available" message. | fail-if: (1) a person can ring themselves; (2) calling your own email shows anything other than the "not available" message | serves: no call loops back to the caller | authority: provisional | confirms_via: owner-decision/no | source: A-014 | covers: DIM-lookup-disclosure | phase: pilot | feature: FEAT-02 | plain: Calling your own email just shows "not available".
REQ-009 | functional | T1 | A person counts as online while signed in with the app open in at least one browser tab, and as offline within 30 seconds after their last tab closes or loses its connection. | fail-if: (1) a person counts as online more than 30 seconds after their last tab closed or lost its connection; (2) a signed-in person with the app open and connected counts as offline | serves: the online check only offers calls that can actually ring | authority: provisional | confirms_via: owner-decision/no | source: A-012 | covers: DIM-presence | phase: pilot | feature: FEAT-02 | plain: You are online while the app is open and signed in, and offline within 30 seconds of closing it.
REQ-010 | functional | T1 | A person whose app is ringing counts as busy; when two calls collide, because two people call each other at once or two callers reach one person, only the first rings and the other caller sees "not available". | fail-if: (1) one person's app rings with two incoming calls at once; (2) two people calling each other at the same moment both ring or neither does; (3) a second caller reaching a ringing person hears ringing instead of "not available" | serves: no one is ever in two calls, and no call is lost in a collision | authority: provisional | confirms_via: owner-decision/no | source: A-028 | covers: DIM-call-states, DIM-presence | phase: pilot | feature: FEAT-02 | plain: Someone being rung counts as busy, and when two calls collide only the first one rings.
REQ-011 | ux_flow | T1 | An incoming call rings on the called person's open app showing only the caller's email, with Accept and Decline. | fail-if: (1) an incoming call does not show the caller's email; (2) the person called has no Accept or no Decline; (3) the incoming call shows anything about the caller beyond their email | serves: the person called decides, knowing who is calling | authority: authoritative | source: seed, thesis MECH-07 | covers: DIM-notifications, DIM-lookup-disclosure | phase: pilot | feature: FEAT-03 | plain: An incoming call shows the caller's email with Accept and Decline buttons.
REQ-012 | functional | T1 | When the person called has the app open in several tabs, the call rings in every open tab; the first Accept or Decline wins and the other tabs stop ringing. | fail-if: (1) an open, signed-in tab of the person called does not ring; (2) after Accept or Decline in one tab another tab keeps ringing; (3) two tabs can both accept the same call | serves: a call reaches the person wherever their app is open | authority: provisional | confirms_via: owner-decision/no | source: A-013 | covers: DIM-presence | phase: later | feature: FEAT-03 | plain: The call rings in every open tab, and the first tab to answer wins.
REQ-013 | functional | T2 | While an incoming call rings, the open app plays a ring sound; nothing alerts the person when the app is closed. | fail-if: (1) an incoming call rings silently in an open app; (2) the product sends any alert, email or notification about a call outside the open app | serves: the person called notices the call while keeping the product free of outside alerts | authority: provisional | confirms_via: owner-decision/no | source: A-035 | covers: DIM-notifications | phase: later | feature: FEAT-03 | plain: An incoming call plays a ring sound in the open app, and nothing alerts you when it is closed.
REQ-014 | functional | T0 | No audio passes between the two people before the person called presses Accept, and none after the call is declined, cancelled or hung up. | fail-if: (1) either person hears the other before the person called presses Accept; (2) audio keeps passing after a decline, a cancel or a hang-up | serves: the person called controls when they are heard, as accept and decline promise | authority: authoritative | source: seed | covers: DIM-media-permissions, DIM-nfr-security | phase: pilot | feature: FEAT-03 | plain: Nobody hears anybody until the person called presses Accept, and the sound stops as soon as the call ends.
REQ-015 | functional | T1 | An accepted call carries voice both ways and never video. | fail-if: (1) after Accept either person cannot hear the other; (2) the call turns on a camera or sends any video | serves: the voice call the owner asked for, nothing more | authority: authoritative | source: A-004, thesis G3 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: Once accepted, both people hear each other, and there is never video.
REQ-016 | functional | T1 | Either person can end an accepted call with one hang-up button, and it ends for both. | fail-if: (1) one person has no hang-up button during a call; (2) after one person hangs up the other is still in the call | serves: either side can leave a call at any moment | authority: provisional | confirms_via: owner-decision/no | source: A-011 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: Either person can hang up with one button, and the call ends for both.
REQ-017 | functional | T1 | An unanswered call rings for 30 seconds, then stops on both sides and the caller sees "no answer"; the caller can cancel while it rings, which stops the ringing for the person called at once. | fail-if: (1) a call keeps ringing more than 30 seconds without an answer; (2) after the ring times out the caller sees anything but "no answer"; (3) the caller cannot cancel a ringing call; (4) after a cancel the person called keeps ringing | serves: no call rings forever and the caller can change their mind | authority: provisional | confirms_via: owner-decision/no | source: A-009, A-010 | covers: DIM-call-states | phase: pilot | feature: FEAT-02 | plain: A call rings for 30 seconds at most, and the caller can cancel it while it rings.
REQ-018 | functional | T1 | If either person's connection drops for more than 10 seconds during a call, the call ends for both; there is no reconnect. | fail-if: (1) a call stays open more than 10 seconds after one person's connection dropped; (2) the person left behind is still shown as in a call afterwards; (3) a dropped person can rejoin the same call | serves: nobody stays stuck in a dead call or counted busy by one | authority: provisional | confirms_via: owner-decision/no | source: A-029 | covers: DIM-call-states | phase: pilot | feature: FEAT-03 | plain: If someone's connection drops for more than 10 seconds, the call ends for both of you.
REQ-019 | ux_flow | T1 | When a call ends or does not start, both people see a short message saying why (declined, no answer, cancelled, call ended, not available) and are back at the call input. | fail-if: (1) after a call ends or fails a person is left on a screen with no way back to the call input; (2) the caller of a declined call is not told it was declined; (3) the end message names a reason other than what happened | serves: every call journey ends where the next one starts | authority: provisional | confirms_via: owner-decision/no | source: A-033 | covers: DIM-core-loop-continuity | phase: pilot | feature: FEAT-03 | plain: When a call ends or cannot start, you see why and land back at the email box.
REQ-020 | data_entity | T1 | A call exists only while it is live: it is ringing, then connected or ended; it ends as declined, no answer, cancelled, hung up or dropped, and is removed as soon as it ends. | fail-if: (1) a call record still exists after the call ended; (2) a call reaches a state outside ringing, connected and ended; (3) a call ends without one of the five end reasons | serves: one clear call lifecycle that leaves nothing behind | authority: provisional | confirms_via: owner-decision/no | source: seed, A-009, A-010, A-011, A-029 | covers: DIM-lifecycle, DIM-call-states | phase: pilot | feature: FEAT-02 | plain: A call only exists while it rings or runs, and it is gone the moment it ends.
REQ-021 | nfr | T0 | Nothing about a call is kept once it ends: no history, no list of past calls and no log anywhere, server logs included, that names who called whom. | fail-if: (1) after a call ends any stored record, list or log names both the caller and the person called; (2) the app shows any past or missed call | serves: the owner's rule to save no history | authority: authoritative | source: seed | covers: DIM-no-history-residual, DIM-nfr-privacy | phase: pilot | feature: FEAT-02 | plain: Once a call ends, nothing anywhere records who called whom.
REQ-022 | functional | T1 | The microphone is asked for when a person calls or accepts; if it is refused or missing, the call does not start and the person is told the microphone is needed. | fail-if: (1) a call starts or is accepted with no microphone access; (2) a person who refused the microphone is not told why the call did not start; (3) the microphone is asked for before any call | serves: a call only connects when both can be heard | authority: provisional | confirms_via: owner-decision/no | source: A-017 | covers: DIM-media-permissions | phase: pilot | feature: FEAT-03 | plain: The app asks for your microphone when you call or answer, and stops the call if you refuse.
REQ-023 | functional | T1 | If the code email cannot be sent the person is told to try again; a new code can be requested at most once every 60 seconds per email. | fail-if: (1) a failed send still tells the person a code was sent; (2) two codes are sent to one email less than 60 seconds apart | serves: people are not left waiting for an email that never comes, and no mailbox is flooded | authority: provisional | confirms_via: owner-decision/no | source: A-030 | covers: DIM-otp-code | phase: pilot | feature: FEAT-01 | plain: If the code email fails you are told, and you can ask for a new code at most once a minute.
REQ-024 | nfr | T1 | All traffic uses HTTPS; the session is kept in a cookie that page scripts cannot read; sign-in codes are stored only in hashed form. | fail-if: (1) any page or call setup works over plain HTTP; (2) page scripts can read the session cookie; (3) a stored sign-in code can be read back as the code itself | serves: a stated security floor for sessions and codes | authority: provisional | confirms_via: owner-decision/no | source: A-034 | covers: DIM-nfr-security | phase: pilot | feature: FEAT-01 | plain: Everything goes over HTTPS, the session cookie is hidden from scripts, and codes are stored only hashed.
REQ-025 | nfr | T2 | The call screen loads within 3 seconds at the 75th percentile on a typical 4G phone connection, and the service is up 99% of each month. | fail-if: (1) the 75th percentile load of the call screen on a typical 4G phone connection exceeds 3 seconds; (2) the service is down more than 1% of a month | serves: a floor a slow or flaky build would break | authority: provisional | confirms_via: owner-decision/no | source: A-022 | covers: DIM-nfr-availability | phase: later | feature: FEAT-02 | plain: The call screen loads within 3 seconds on a phone, and the service is up 99% of the month.
REQ-026 | nfr | T2 | Every screen meets WCAG 2.1 AA: all controls work by keyboard and are labelled for screen readers, including Accept, Decline and hang-up. | fail-if: (1) a control cannot be reached or pressed by keyboard; (2) a control has no label a screen reader reads; (3) a screen fails a WCAG 2.1 AA check | serves: people using a keyboard or screen reader can call and answer | authority: provisional | confirms_via: owner-decision/no | source: A-023 | covers: DIM-nfr-accessibility | phase: later | feature: FEAT-03 | plain: Every screen works by keyboard and with screen readers, to the WCAG 2.1 AA level.
REQ-027 | nfr | T2 | Accounts are backed up daily and backups kept 7 days; server errors are logged and alert the operator; a stuck user reaches the operator at the address the code email comes from. | fail-if: (1) no account backup is newer than one day; (2) a server error leaves no log and sends no alert; (3) mail to the code email's sender address reaches nobody | serves: the operator can restore accounts, learns of breakage, and can be reached | authority: provisional | confirms_via: owner-decision/no | source: A-024 | covers: DIM-nfr-operability/backup, DIM-nfr-operability/observability, DIM-nfr-operability/support | phase: later | feature: FEAT-01 | plain: Accounts are backed up daily for 7 days, errors alert the operator, and users can write to the code email's sender.
REQ-028 | nfr | T1 | After Accept, voice connects within 5 seconds on typical networks, and calls also connect for people behind strict networks through a relay server. | fail-if: (1) on a typical network voice takes more than 5 seconds to connect after Accept; (2) a call between two people behind strict networks fails to connect | serves: calls work for everyone, not only on easy networks | authority: provisional | confirms_via: owner-decision/no | source: A-025 | covers: DIM-nfr-call-connectivity | phase: later | feature: FEAT-03 | plain: Voice connects within 5 seconds of Accept, even on strict networks.
REQ-029 | data_entity | T1 | The product holds only each account's email and creation date, its sessions and unexpired codes; used or expired codes and ended sessions are deleted; accounts are deleted only by the operator on request. | fail-if: (1) the product stores any personal data beyond email, creation date, sessions and codes; (2) a used or expired code or an ended session is still stored; (3) an account has no recorded creation date | serves: a small, stated privacy footprint | authority: provisional | confirms_via: owner-decision/no | source: A-026 | covers: DIM-nfr-privacy, DIM-data-integrity/provenance | phase: pilot | feature: FEAT-01 | plain: The product keeps only your email, when your account was made, your sessions and live codes.
REQ-030 | functional | T1 | The only email the product sends is the sign-in code a person asked for; it never sends any other email. | fail-if: (1) the product sends an email nobody asked for; (2) the product sends any email other than a sign-in code | serves: asking for a code is the only consent needed, so no unsubscribe exists | authority: provisional | confirms_via: owner-decision/no | source: A-018 | covers: DIM-consent | phase: pilot | feature: FEAT-01 | plain: The only email you ever get is the sign-in code you asked for.
CON-001 | constraint | T1 | The product adds no encryption layer of its own to the voice; the protection web browsers always apply to calls stays. | authority: authoritative | source: A-005 | feature: FEAT-03
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
A-034 | model_proposed | 2026-11-26 | Q: What is the security floor? | A: All traffic over HTTPS; the session is kept in a cookie page scripts cannot read; sign-in codes are stored only in hashed form. | settles: REQ-024 | shown: pause-2 8201683
A-035 | model_proposed | 2026-11-26 | Q: How does an incoming call get noticed? | A: The open app plays a ring sound while a call rings; nothing alerts a person when the app is closed. | settles: REQ-013 | shown: pause-2 2420300151
A-036 | human | 2026-11-26 | Q: Which rules move to later, to keep the first version on the initial scope? | A: Accepted as recommended: load speed and uptime, the accessibility level, backups, alerts and support, the connect time and relay server, the ring sound, and ringing in several tabs move to later; the security floor, no history and the "not available" rule stay in the first version. | settles: REQ-012, REQ-013, REQ-025, REQ-026, REQ-027, REQ-028
A-037 | human | 2026-11-26 | Q: The person called presses Accept but refuses the microphone, or the voice never connects: what happens? | A: Accepted as recommended: the call ends for both; the caller sees "call ended"; the person called sees the microphone message. | settles: DIM-call-states, DIM-media-permissions
A-038 | human | 2026-11-26 | Q: While your own outgoing call is ringing, can someone else call you? | A: Accepted as recommended: no; a person with an outgoing call ringing counts as busy, and the other caller sees "not available". | settles: DIM-call-states, DIM-presence
A-039 | human | 2026-11-26 | Q: What happens when someone signs out, or their session ends, during a ringing or connected call? | A: Accepted as recommended: the call ends at once for both; the other person sees "call ended". | settles: DIM-call-states
A-040 | human | 2026-11-26 | Q: Does the sign-out button sign out this browser or every device? | A: Accepted as recommended: only this browser. | settles: DIM-identity
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

## Ratifications

- 2026-11-27 — thesis+contract — 4b2a9b5

## Appends
