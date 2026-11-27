// Purpose: the sign-in steps: the email step (one email box, one send-code button) and the code-entry step, and nothing else (REQ-001, REQ-005).

import type { FC } from 'hono/jsx';
import { Layout } from './layout';

// REQ-001: the one way in is a code sent to the email typed here.
// REQ-005 (ROW-093): the signed-out page carries no call box, no sign-out control and no incoming-call area.
// REQ-039 (ROW-204): the box is a plain text box, so the browser sends exactly what was typed (an email-type box would turn
// an international domain into its ASCII form first) and the server's ASCII-only rule judges it.
export const SignInPage: FC<{ message?: string; email?: string }> = ({ message, email }) => (
  <Layout title="Sign in">
    <main class="panel">
      <h1 class="title">Sign in</h1>
      <p class="hint">Enter your email and we will send you a sign-in code.</p>
      <form class="form" method="post" action="/">
        <input type="hidden" name="step" value="request" />
        <label class="label" for="email">Email</label>
        <input
          class="input"
          id="email"
          name="email"
          type="text"
          autocomplete="email"
          inputmode="email"
          autocapitalize="none"
          spellcheck={false}
          required
          maxlength={254}
          value={email ?? ''}
        />
        {message ? <p class="error" role="alert">{message}</p> : null}
        <button class="button" type="submit">Send code</button>
      </form>
    </main>
  </Layout>
);

// REQ-001, REQ-002 (ROW-096): the code-entry step, reached by asking for a code; its link leads back to the email step.
export const CodeEntryPage: FC<{ email: string; message?: string }> = ({ email, message }) => (
  <Layout title="Enter your code">
    <main class="panel">
      <h1 class="title">Enter your code</h1>
      <p class="hint">We sent a 6-digit code to {email}. It works for 10 minutes.</p>
      <form class="form" method="post" action="/">
        <input type="hidden" name="step" value="verify" />
        <input type="hidden" name="email" value={email} />
        <label class="label" for="code">Code</label>
        <input
          class="input"
          id="code"
          name="code"
          type="text"
          autocomplete="one-time-code"
          inputmode="numeric"
          required
          maxlength={32}
        />
        {message ? <p class="error" role="alert">{message}</p> : null}
        <button class="button" type="submit">Sign in</button>
      </form>
      <p class="aside"><a class="link" href="/">Use a different email</a></p>
    </main>
  </Layout>
);

// REQ-001: the signed-in screen. The call box and sign-out arrive with their own steps.
export const SignedInPage: FC<{ email: string }> = ({ email }) => (
  <Layout title="Signed in">
    <main class="panel">
      <h1 class="title">You are signed in</h1>
      <p class="hint">Signed in as {email}.</p>
    </main>
  </Layout>
);
