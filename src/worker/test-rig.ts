// Purpose: the test switch's stand-ins (VID_TEST=1 only): the fake mailer, the movable clock and the code-store fault, with their doors.

import { createFakeMailer, type FakeMailer } from '#adapters/mail';
import type { Clock, CodeStore } from '#core/identity';
import type { TestDoors } from '#http';

type FaultAt = 'codes' | 'codes-write' | 'none';

export type TestRig = {
  mailer: FakeMailer;
  clock: Clock;
  wrapCodes(codes: CodeStore): CodeStore;
  doors: TestDoors;
};

/**
 * One rig per Worker instance, built only when the test switch is on: the fake mailer's record (DIF-001), the clock
 * offset and the armed fault live here, in memory, and are lost on a restart.
 */
export function createTestRig(): TestRig {
  const mailer = createFakeMailer();
  let offsetMs = 0;
  let fault: FaultAt = 'none';

  const clock: Clock = { now: () => Date.now() + offsetMs };

  const failIf = (write: boolean) => {
    if (fault === 'codes' || (fault === 'codes-write' && write)) throw new Error('code store fault (test switch)');
  };

  return {
    mailer,
    clock,
    wrapCodes(codes) {
      return {
        async addSent(c) {
          failIf(true);
          return codes.addSent(c);
        },
        async live(email, now) {
          failIf(false);
          return codes.live(email, now);
        },
        async consume(id, now) {
          failIf(true);
          return codes.consume(id, now);
        },
        async countWrongTry(email, requester, now) {
          failIf(true);
          return codes.countWrongTry(email, requester, now);
        },
      };
    },
    doors: {
      mailFor: (to) => mailer.messagesFor(to),
      failNextMail: (to) => mailer.failNextTo(to),
      advanceClock: (seconds) => {
        offsetMs += Math.round(seconds * 1000);
      },
      setFault: (at) => {
        fault = at;
      },
    },
  };
}
