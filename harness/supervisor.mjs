// Purpose: inside the main product's container: runs the product's entry (pnpm run entry) and answers POST /restart on port 8788
// (PRODUCT_RESTART_URL, ROW-158) by stopping the entry with SIGTERM, starting it again in the same container (its local D1 under
// /app/.wrangler kept) and answering 200 once GET / answers below 500, 504 when it does not within 120 s. The harness's, never the product's.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const port = process.env.PORT || '8787';
let child = null;
let stopping = false;

function startEntry() {
  child = spawn('pnpm', ['run', '--silent', 'entry'], { stdio: 'inherit' });
  const me = child;
  me.on('exit', (code, signal) => {
    if (me !== child) return;              // a restart's old process: expected
    if (stopping) process.exit(0);
    process.exit(code ?? (signal ? 1 : 0)); // the product died on its own: the container ends with its code
  });
}

function stopEntry() {
  return new Promise((resolve) => {
    const old = child;
    child = null;
    if (!old || old.exitCode !== null || old.signalCode !== null) return resolve();
    const t = setTimeout(() => old.kill('SIGKILL'), 15000);
    old.once('exit', () => { clearTimeout(t); resolve(); });
    old.kill('SIGTERM');
  });
}

async function up(deadline) {
  while (Date.now() < deadline) {
    try { const r = await fetch(`http://127.0.0.1:${port}/`); if (r.status < 500) return true; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

let busy = Promise.resolve();
createServer((req, res) => {
  if (req.method !== 'POST' || !req.url.startsWith('/restart')) { res.writeHead(404).end('not found\n'); return; }
  busy = busy.then(async () => {
    const t0 = Date.now();
    console.log(`supervisor: restart asked at ${new Date().toISOString()}`);
    await stopEntry();
    startEntry();
    const ok = await up(Date.now() + 120000);
    console.log(`supervisor: restart ${ok ? 'up' : 'not up'} after ${Date.now() - t0} ms`);
    res.writeHead(ok ? 200 : 504, { 'content-type': 'text/plain' }).end(ok ? 'restarted\n' : 'not up within 120 s\n');
  });
}).listen(8788, '0.0.0.0');

for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, async () => { stopping = true; await stopEntry(); process.exit(0); });
startEntry();
