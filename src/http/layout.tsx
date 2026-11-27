// Purpose: the page shell every screen shares: document head, the quiet monochrome style (D-014), English only.

import type { FC, PropsWithChildren } from 'hono/jsx';
import { raw } from 'hono/html';

// D-013, D-014: plain CSS with tokens; a quiet neutral interface, system sans font, thin borders, one accent.
const STYLE = `
:root {
  --color-bg: rgb(255 255 255);
  --color-text: rgb(23 23 23);
  --color-muted: rgb(115 115 115);
  --color-border: rgb(229 229 229);
  --color-accent: rgb(23 23 23);
  --color-on-accent: rgb(255 255 255);
  --radius: 6px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 32px;
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); font-size: 15px; line-height: 1.5; }
.panel { max-width: 360px; margin: 15vh auto 0; padding: 0 var(--space-3); }
.title { font-size: 22px; font-weight: 600; margin: 0 0 var(--space-1); }
.hint { color: var(--color-muted); margin: 0 0 var(--space-4); }
.form { display: flex; flex-direction: column; gap: var(--space-2); }
.label { font-size: 13px; font-weight: 500; }
.input { font: inherit; padding: var(--space-2) 12px; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--color-bg); color: var(--color-text); }
.input:focus { outline: 2px solid var(--color-accent); outline-offset: -1px; }
.error { margin: 0; font-size: 13px; color: var(--color-text); }
.aside { margin: var(--space-3) 0 0; font-size: 13px; }
.link { color: var(--color-muted); }
.button { font: inherit; font-weight: 500; margin-top: var(--space-2); padding: var(--space-2) 12px; border: 1px solid var(--color-accent); border-radius: var(--radius); background: var(--color-accent); color: var(--color-on-accent); cursor: pointer; }
`;

export const Layout: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <>
  {raw('<!DOCTYPE html>')}
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} · call-by-identifier</title>
      <style>{raw(STYLE)}</style>
    </head>
    <body>{children}</body>
  </html>
  </>
);
