// Purpose: the Hono app (the #http surface): builds the routes and server-rendered pages from the dependencies it is given.

import { Hono } from 'hono';
import { SignInPage } from './sign-in-page';

/** What the composition root hands the app. Empty in the skeleton; ports join it as they land. */
export type AppDeps = {
  /** True only under the test switch (VID_TEST=1); never set in production. */
  testSwitch: boolean;
};

export function createApp(_deps: AppDeps) {
  const app = new Hono();

  // REQ-001, REQ-005 (ROW-093): a signed-out visitor at / sees only the sign-in screen.
  app.get('/', (c) => c.html(<SignInPage />));

  return app;
}
