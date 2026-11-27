// Purpose: the composition root (the #worker surface): reads bindings and variables, builds the app, exports the Worker.

import { createD1Stores } from '#adapters/d1';
import { createEmailServiceMailer, type EmailBinding } from '#adapters/mail';
import type { IdentityDeps, Random, SecretSource } from '#core/identity';
import { createApp } from '#http';
import { createTestRig, type TestRig } from './test-rig';

export type Env = {
  /** "1" only in the test environment (the test switch); never set in production. */
  VID_TEST?: string;
  /** D-004: the database. */
  DB: D1Database;
  /** D-008, SEAM-001: the Cloudflare Email Service binding. */
  EMAIL: EmailBinding;
  /** D-009, D-025: the server secret every stored hash is keyed under (a Worker secret). */
  SIGNIN_SECRET?: string;
};

// The secrets the Worker reads are declared to the harness by `pnpm run entry --secrets` (keep the two in step).
const SECRET_MIN_LENGTH = 32;

/** RULE-013: a secret read refuses to run when the secret is missing or shorter than SECRET_MIN_LENGTH. */
function secretSource(env: Env): SecretSource {
  return {
    signingSecret() {
      const value = env.SIGNIN_SECRET;
      if (typeof value !== 'string' || value.length < SECRET_MIN_LENGTH) {
        throw new Error('SIGNIN_SECRET is missing or shorter than required; sign-in refuses to run');
      }
      return value;
    },
  };
}

/** ROW-124: randomness is bound to the cryptographic source. */
const cryptoRandom: Random = { fill: (bytes) => void crypto.getRandomValues(bytes) };

// The test switch's stand-ins live as long as this Worker instance; built only when the switch is on.
let rig: TestRig | undefined;

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    const testSwitch = env.VID_TEST === '1';
    if (testSwitch && !rig) rig = createTestRig();
    const testRig = testSwitch ? rig : undefined;

    const stores = createD1Stores(env.DB);
    const identity: IdentityDeps = {
      clock: testRig ? testRig.clock : { now: () => Date.now() },
      random: cryptoRandom,
      secrets: secretSource(env),
      // DIF-001: the fake mailer under the test switch alone; the Email Service binding otherwise (ROW-142).
      mailer: testRig ? testRig.mailer : createEmailServiceMailer(env.EMAIL),
      codes: testRig ? testRig.wrapCodes(stores.codes) : stores.codes,
      accounts: stores.accounts,
      sessions: stores.sessions,
      throttle: stores.throttle,
    };

    const app = createApp({ testSwitch, identity, testDoors: testRig?.doors(stores) });
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
