// Purpose: the product's one entry (pnpm run entry): applies local D1 migrations when any exist, then runs wrangler dev in the foreground.
//
// Run by the test environment's product image. It needs no network: everything is local (--local), and
// every variable the Worker reads gets a value from the environment — VID_TEST, and throwaway secrets from
// VID_TEST_SECRET — never a real one.
//
// `--secrets` prints, as its last line, the JSON list of every secret the Worker reads, and exits at once.
// VID_SECRET_MISSING=<NAME> starts with that secret unset; VID_SECRET_SHORT=<NAME> gives it the first 8 characters of
// VID_TEST_SECRET (RULE-013, HOS-028).

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

// Every secret the Worker reads (src/worker/index.ts, Env); a new one goes here too.
const SECRETS = [{ secret: 'SIGNIN_SECRET', role: 'code-hashing' }];

if (process.argv.includes('--secrets')) {
  console.log(JSON.stringify(SECRETS));
  process.exit(0);
}

const port = process.env.PORT || '8787';
const testSwitch = process.env.VID_TEST === '1' ? '1' : '0';
const wrangler = 'node_modules/.bin/wrangler';
const testSecret = process.env.VID_TEST_SECRET || '';

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

for (const { secret } of SECRETS) {
  if (process.env.VID_SECRET_MISSING === secret) continue;
  const value = process.env.VID_SECRET_SHORT === secret ? testSecret.slice(0, 8) : testSecret;
  if (value) args.push('--var', `${secret}:${value}`);
}

const child = spawn(wrangler, args, { stdio: 'inherit' });
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => child.kill(sig));
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
