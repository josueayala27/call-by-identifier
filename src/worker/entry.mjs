// Purpose: the product's one entry (pnpm run entry): applies local D1 migrations when any exist, then runs wrangler dev in the foreground.
//
// Run by the test environment's product image. It needs no network: everything is local (--local), and
// every variable the Worker reads gets a value from the environment — VID_TEST, and throwaway secrets from
// VID_TEST_SECRET — never a real one.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const port = process.env.PORT || '8787';
const testSwitch = process.env.VID_TEST === '1' ? '1' : '0';
const wrangler = 'node_modules/.bin/wrangler';

// D1 migrations: applied to the local database before the Worker starts, once a database and its migrations exist.
const D1_BINDING = 'DB';
if (existsSync('migrations') && readdirSync('migrations').some((f) => f.endsWith('.sql'))) {
  const r = spawnSync(wrangler, ['d1', 'migrations', 'apply', D1_BINDING, '--local'], {
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const args = [
  'dev',
  '--local',
  '--ip', '0.0.0.0',
  '--port', port,
  '--test-scheduled',
  '--show-interactive-dev-session=false',
  '--var', `VID_TEST:${testSwitch}`,
];

const child = spawn(wrangler, args, { stdio: 'inherit' });
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => child.kill(sig));
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
