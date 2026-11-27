// Purpose: inside product-off's container (the switch-off product, ROW-142): runs the product's entry (pnpm run entry) and answers
// GET :8789/?to=<email> (PRODUCT_OFF_MAIL_URL) with what the product handed its Email Service binding for that recipient:
// {"messages":[{"to":[…],"from":…,"subject":…,"text":…}]}, oldest first, "to" exactly as handed, the recipient matched ignoring letter case.
// Under wrangler dev --local the binding sends nothing: Miniflare keeps each message in its local email store, read here over the
// container's own loopback (wrangler's /cdn-cgi/explorer email API). The harness's, never the product's; a port the product does not serve.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const port = process.env.PORT || '8787';
const store = `http://127.0.0.1:${port}/cdn-cgi/explorer/api/local/email/sending`;
let stopping = false;

// the entry in its own process group (pnpm, node, wrangler, workerd), so a stop takes all of it
const child = spawn('pnpm', ['run', '--silent', 'entry'], { stdio: 'inherit', detached: true });
const alive = () => { try { process.kill(-child.pid, 0); return true; } catch { return false; } };
child.on('exit', async (code, signal) => {
  if (!stopping) process.exit(code ?? (signal ? 1 : 0)); // the product died on its own: the container ends with its code
  const until = Date.now() + 10000;                      // pnpm leaves before wrangler and workerd do: wait for the whole group
  while (alive() && Date.now() < until) await new Promise((r) => setTimeout(r, 100));
  process.exit(0);
});

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`the local email store answered ${r.status}`);
  return r.json();
}

// every message the binding was handed, oldest first (the store lists newest first, a page at a time)
async function allSent() {
  const items = []; let cursor;
  for (let i = 0; i < 1000; i++) {
    const j = await getJson(`${store}?per_page=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    items.push(...(j.result || []));
    if (!j.result_info?.has_more || !j.result_info.cursor) break;
    cursor = j.result_info.cursor;
  }
  return items.reverse();
}

createServer(async (req, res) => {
  const u = new URL(req.url, 'http://tap');
  const to = u.searchParams.get('to');
  if (req.method !== 'GET' || to === null) { res.writeHead(404).end('not found: GET ?to=<email>\n'); return; }
  try {
    const want = to.toLowerCase();
    const hits = (await allSent()).filter((m) => Array.isArray(m.to) && m.to.some((t) => String(t).toLowerCase() === want));
    const messages = [];
    for (const m of hits) {
      const d = (await getJson(`${store}?email_id=${encodeURIComponent(m.messageId)}`)).result || {};
      messages.push({ to: d.to ?? m.to, from: d.from ?? m.from, subject: d.subject ?? m.subject, text: d.text ?? '' });
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ messages }));
  } catch (e) {
    res.writeHead(502, { 'content-type': 'text/plain' }).end(`mail-tap: ${e.message}\n`);
  }
}).listen(8789, '0.0.0.0');

for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { stopping = true; try { process.kill(-child.pid, 'SIGTERM'); } catch { process.exit(0); } });
