// Purpose: the test-switch doors (VID_TEST=1 only): the fake mailer's reader and failure, the clock and the code-store fault.

import type { Hono } from 'hono';

export type FaultAt = 'codes' | 'codes-write' | 'none';

/** What the composition root gives the doors under the test switch; never wired in the deployed product (ROW-142). */
export type TestDoors = {
  /** DIF-001: what the fake mailer recorded for a recipient, oldest first. */
  mailFor(to: string): { to: string[]; cc?: string[]; bcc?: string[]; from: string; subject: string; text: string }[];
  failNextMail(to: string): void;
  advanceClock(seconds: number): void;
  setFault(at: FaultAt): void;
};

export function mountTestDoors(app: Hono, doors: TestDoors): void {
  // DIF-001: a measuring tool; the messages whose recipient equals ?to= ignoring letter case.
  app.get('/__test/mail', (c) => {
    const to = c.req.query('to') ?? '';
    const messages = doors.mailFor(to).map((m) => ({ to: m.to, cc: m.cc ?? [], bcc: m.bcc ?? [], from: m.from, subject: m.subject, text: m.text }));
    return c.json({ messages });
  });

  // ROW-196, HOS-029: the next send to ?to= fails and records nothing.
  app.post('/__test/mail/fail', (c) => {
    const to = c.req.query('to') ?? '';
    if (!to) return c.json({ error: 'to is required' }, 400);
    doors.failNextMail(to);
    return c.json({ ok: true });
  });

  // ROW-004, HOS-004, ROW-007 …: the Clock port reads <seconds> later from then on.
  app.post('/__test/clock', (c) => {
    const seconds = Number(c.req.query('advance'));
    if (!Number.isFinite(seconds) || seconds < 0) return c.json({ error: 'advance must be a number of seconds' }, 400);
    doors.advanceClock(seconds);
    return c.json({ ok: true });
  });

  // ROW-126: every code-store operation, or every code-store write, fails until at=none.
  app.post('/__test/fault', (c) => {
    const at = c.req.query('at');
    if (at !== 'codes' && at !== 'codes-write' && at !== 'none') return c.json({ error: 'at must be codes, codes-write or none' }, 400);
    doors.setFault(at);
    return c.json({ ok: true });
  });
}
