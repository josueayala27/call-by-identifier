// Purpose: the sign-in screen: one email box and one send-code button in one form, and nothing else (REQ-001, REQ-005).

import type { FC } from 'hono/jsx';
import { Layout } from './layout';

// REQ-001: the one way in is a code sent to the email typed here.
// REQ-005 (ROW-093): the signed-out page carries no call box, no sign-out control and no incoming-call area.
export const SignInPage: FC = () => (
  <Layout title="Sign in">
    <main class="panel">
      <h1 class="title">Sign in</h1>
      <p class="hint">Enter your email and we will send you a sign-in code.</p>
      <form class="form" method="post" action="/">
        <label class="label" for="email">Email</label>
        <input
          class="input"
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          inputmode="email"
          required
          maxlength={254}
        />
        <button class="button" type="submit">Send code</button>
      </form>
    </main>
  </Layout>
);
