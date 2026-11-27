// Purpose: joins the runners' JUnit reports into one <testsuites>, each failure's message its assertion's own line
import { existsSync, readFileSync } from 'node:fs';
const ansi = /\u001b\[[0-9;]*m/g;
const unesc = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#x1B;\[[0-9;]*m/gi, '').replace(/&amp;/g, '&');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let suites = '', found = false;
for (const f of process.argv.slice(2)) {
  if (!existsSync(f)) continue;
  const x = readFileSync(f, 'utf8');
  for (const m of x.matchAll(/<testsuite[\s>][\s\S]*?<\/testsuite>|<testsuite\s[^>]*\/>/g)) { suites += m[0] + '\n'; found = true; }
}
if (!found) process.exit(1);
// a failure whose message is not its assertion (Playwright names the case's place): the first Error/expect line of its text instead
suites = suites.replace(/<failure([^>]*?)message="([^"]*)"([^>]*)>([\s\S]*?)<\/failure>/g, (all, a, msg, b, body) => {
  const text = unesc(body.replace(/^<!\[CDATA\[|\]\]>$/g, '')).replace(ansi, '');
  const line = text.split('\n').map(l => l.trim()).find(l => /^(Error|AssertionError|TypeError|expect\(|setup:)/.test(l) || /Error:/.test(l));
  const m = unesc(msg).replace(ansi, '');
  const keep = line && !/^(Error|AssertionError|TypeError|expect|setup:)/.test(m.trim()) ? line : m;
  return `<failure${a}message="${esc(keep)}"${b}>${body}</failure>`;
});
process.stdout.write(`<?xml version="1.0" encoding="UTF-8"?>\n<testsuites name="call-by-identifier ledger">\n${suites}</testsuites>\n`);
