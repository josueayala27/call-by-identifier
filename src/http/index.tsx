// Purpose: the Hono app (the #http surface): builds the routes and server-rendered pages from the dependencies it is given.

import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { requestCode, resolveSession, verifyCode, type IdentityDeps } from '#core/identity';
import { CodeEntryPage, SignedInPage, SignInPage } from './sign-in-page';
import { mountTestDoors, type TestDoors } from './test-doors';

export type { TestDoors } from './test-doors';

/** What the composition root hands the app. */
export type AppDeps = {
  /** True only under the test switch (VID_TEST=1); never set in production. */
  testSwitch: boolean;
  identity: IdentityDeps;
  /** The test-switch doors; given only under the test switch (ROW-142). */
  testDoors?: TestDoors;
};

/** D-010: the session cookie. */
const SESSION_COOKIE = 'session';

export function createApp(deps: AppDeps) {
  const app = new Hono();
  const clientAddress = (c: { req: { header(name: string): string | undefined } }) => c.req.header('CF-Connecting-IP') ?? null;

  // REQ-001, REQ-005 (ROW-093): a signed-out visitor at / sees only the sign-in screen; a running session sees the signed-in screen.
  app.get('/', async (c) => {
    let email: string | null = null;
    try {
      email = await resolveSession(deps.identity, getCookie(c, SESSION_COOKIE));
    } catch {
      email = null;
    }
    return c.html(email ? <SignedInPage email={email} /> : <SignInPage />);
  });

  // REQ-001, REQ-002: the sign-in form posts here: the email step asks for a code, the code-entry step enters it.
  app.post('/', async (c) => {
    const form = await c.req.parseBody();
    const field = (name: string) => (typeof form[name] === 'string' ? (form[name] as string) : '');
    const email = field('email');

    if (field('step') === 'verify') {
      let result;
      try {
        result = await verifyCode(deps.identity, { email, code: field('code'), clientAddress: clientAddress(c) });
      } catch {
        // ROW-126: any failure while checking or counting signs nobody in.
        return c.html(<CodeEntryPage email={email} message="Something went wrong. Please try again." />, 503);
      }
      switch (result.kind) {
        case 'signed-in':
          setCookie(c, SESSION_COOKIE, result.sessionToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            path: '/',
            expires: new Date(result.expiresAt),
          });
          return c.redirect('/', 303);
        case 'malformed':
          return c.html(<CodeEntryPage email={email} message="Enter the 6-digit code from the email." />, 400);
        case 'wrong':
          // ROW-201: the same answer whether or not the email has an account.
          return c.html(<CodeEntryPage email={email} message="That code does not work. Check it, or ask for a new code." />, 400);
        case 'address-limited':
          // REQ-037: too many wrong tries from this network address; told to try again later.
          return c.html(<CodeEntryPage email={email} message="Too many wrong codes from your network. Please try again later." />, 429);
      }
    }

    let result;
    try {
      result = await requestCode(deps.identity, { email, clientAddress: clientAddress(c) });
    } catch {
      return c.html(<SignInPage email={email} message="Sign-in is not available right now. Please try again later." />, 503);
    }
    switch (result.kind) {
      case 'sent':
        return c.html(<CodeEntryPage email={result.email} />);
      case 'invalid-email':
        // REQ-039, ROW-114: one bare plain-ASCII address only.
        return c.html(<SignInPage email={email} message="Enter one email address, using plain letters, digits and . + - _ ' only." />, 400);
      case 'not-sent':
        // REQ-023: a failed send is never reported as sent.
        return c.html(<SignInPage email={email} message="We could not send the code. Please try again." />, 502);
    }
  });

  if (deps.testSwitch && deps.testDoors) mountTestDoors(app, deps.testDoors);

  return app;
}
