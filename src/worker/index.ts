// Purpose: the composition root (the #worker surface): reads bindings and variables, builds the app, exports the Worker.

import { createApp } from '#http';

export type Env = {
  /** "1" only in the test environment (the test switch); never set in production. */
  VID_TEST?: string;
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    const app = createApp({ testSwitch: env.VID_TEST === '1' });
    return app.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
