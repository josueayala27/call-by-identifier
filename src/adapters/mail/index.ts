// Purpose: the #adapters/mail surface: the Mailer port over the Cloudflare Email Service binding, and the fake that records instead.

import type { CodeMail, Mailer } from '#core/identity';

/** D-008: the sending address. */
export const SENDER = 'no-reply@call-by-identifier.josueayala.me';

/** Exactly what the adapter hands to the Email Service binding's send(). */
export type OutgoingMessage = { to: string[]; from: string; subject: string; text: string };

/** The part of the Email Service binding this adapter uses. */
export type EmailBinding = { send(message: OutgoingMessage): Promise<unknown> };

/** The message for one code email: one recipient, the normalised address (ROW-114). */
function toMessage(mail: CodeMail): OutgoingMessage {
  return { to: [mail.to], from: SENDER, subject: mail.subject, text: mail.text };
}

/** SEAM-001, D-008: sends through the Cloudflare Email Service Worker binding; a rejected send rejects. */
export function createEmailServiceMailer(binding: EmailBinding): Mailer {
  return {
    async send(mail) {
      await binding.send(toMessage(mail));
    },
  };
}

export type FakeMailer = Mailer & {
  /** The messages whose recipient equals <to>, ignoring letter case, oldest first. */
  messagesFor(to: string): OutgoingMessage[];
  /** The next send to <to> throws, and nothing is recorded. */
  failNextTo(to: string): void;
};

/**
 * DIF-001: the test environment's mailer. It records in memory exactly the message the binding would have been handed.
 * Wired only under the test switch (VID_TEST=1), never in the deployed product (ROW-142).
 */
export function createFakeMailer(): FakeMailer {
  const sent: OutgoingMessage[] = [];
  const failing = new Set<string>();
  return {
    async send(mail) {
      const message = toMessage(mail);
      const target = message.to.find((t) => failing.has(t.toLowerCase()));
      if (target !== undefined) {
        failing.delete(target.toLowerCase());
        throw new Error('the fake mailer was set to fail this send');
      }
      sent.push(message);
    },
    messagesFor(to) {
      const want = to.toLowerCase();
      return sent.filter((m) => m.to.some((t) => t.toLowerCase() === want));
    },
    failNextTo(to) {
      failing.add(to.toLowerCase());
    },
  };
}
