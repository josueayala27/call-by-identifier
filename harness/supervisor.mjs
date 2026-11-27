// Purpose: inside the main product's container: runs the product's entry (pnpm run entry) and answers POST /restart on port 8788
// (PRODUCT_RESTART_URL, ROW-158) by stopping the entry's whole process group with SIGTERM, starting it again in the same container (its local D1 under
// /app/.wrangler kept) and answering 200 once GET / answers below 500, 504 when it does not within 120 s. The harness's, never the product's.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const port = process.env.PORT || '8787';
let child = null;
let stopping = false;

function startEntry() {
  child = spawn('pnpm', ['run', '--silent', 'entry'], { stdio: 'inherit', detached: true }); // its own process group: pnpm, node, wrangler, workerd
  const me = child;
  me.on('exit', (code, signal) => {
    if (me !== child) return;              // a restart's old process: expected
    if (stopping) process.exit(0);
    process.exit(code ?? (signal ? 1 : 0)); // the product died on its own: the container ends with its code
  });
}

const alive = (pgid) => { try { process.kill(-pgid, 0); return true; } catch { return false; } };

// stops the entry's whole process group (pnpm leaves before wrangler and workerd do), SIGKILL after 15 s, and waits until none of it is left
async function stopEntry() {
  const old = child;
  child = null;
  if (!old) return;
  try { process.kill(-old.pid, 'SIGTERM'); } catch { /* already gone */ }
  const until = Date.now() + 15000;
  while (alive(old.pid) && Date.now() < until) await new Promise((r) => setTimeout(r, 100));
  if (alive(old.pid)) { try { process.kill(-old.pid, 'SIGKILL'); } catch { /* gone */ } }
  while (alive(old.pid)) await new Promise((r) => setTimeout(r, 100));
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
