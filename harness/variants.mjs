// Purpose: start:'s helper for the secret variants (RULE-013, HOS-028). Two modes:
//   node variants.mjs <declared JSON> <state dir>: from the entry's declared secrets, a compose file with one product per secret and state
//     (missing: VID_SECRET_MISSING=<NAME>; short: VID_SECRET_SHORT=<NAME> with VID_SECRET_LENGTH=31, under the owner's 32 bytes; exact: the same
//     with VID_SECRET_LENGTH=32), and the JSON list for PRODUCT_SECRET_VARIANTS, "length" the characters asked for;
//   node variants.mjs --given <state dir> <variant-k>=<n|absent|unread> …: what each started variant was given, read from its own processes'
//     command lines; the list's "length" becomes the length given, and an entry whose variant was not given its state is dropped (said on stderr).
import { readFileSync, writeFileSync } from 'node:fs';

// the owner's answer on #5: a secret under 32 bytes is short; 31 is the longest short value, 32 the control (the test author's request 6)
const LENGTHS = { short: 31, exact: 32 };
const HEALTH = `    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8787/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"]
      interval: 2s
      timeout: 5s
      retries: 150
      start_period: 5s
`;

if (process.argv[2] === '--given') {
  const [dir, ...pairs] = process.argv.slice(3);
  const given = Object.fromEntries(pairs.map((p) => p.split('=')));
  const list = JSON.parse(readFileSync(`${dir}/variants.json`, 'utf8'));
  const kept = [];
  for (const v of list) {
    const g = given[v.name];
    if (g === undefined || g === 'unread') { kept.push(v); continue; }     // ended before it could be read, or nothing to read: as asked
    if (v.state === 'missing') {
      if (g === 'absent') kept.push(v); else console.error(`start: ${v.name} (${v.secret} missing) was given ${g} characters: dropped from the list`);
      continue;
    }
    const n = Number(g);
    if (g === 'absent' || !Number.isInteger(n)) { console.error(`start: ${v.name} (${v.secret} ${v.state}) was given no value: dropped from the list`); continue; }
    if (v.state === 'exact' && n !== LENGTHS.exact) { console.error(`start: ${v.name} (${v.secret} exact) was given ${n} characters, not ${LENGTHS.exact} (does the entry read VID_SECRET_LENGTH?): dropped from the list`); continue; }
    if (n !== v.length) console.error(`start: ${v.name} (${v.secret} ${v.state}) was given ${n} characters, not ${v.length} as asked: listed with ${n}`);
    kept.push({ ...v, length: n });
  }
  writeFileSync(`${dir}/variants.json`, JSON.stringify(kept));
  process.exit(0);
}

const [decl, dir] = process.argv.slice(2);
const list = JSON.parse(decl);
const out = []; let y = 'services:\n'; let n = 0;
for (const { secret, role } of list) for (const state of ['missing', 'short', 'exact']) {
  n += 1; const name = `variant-${n}`;
  const entry = { secret, state, role: role || 'other', url: `http://${name}:8787`, name };
  if (state !== 'missing') entry.length = LENGTHS[state];
  out.push(entry);
  const env = state === 'missing'
    ? `      VID_SECRET_MISSING: "${secret}"\n`
    : `      VID_SECRET_SHORT: "${secret}"\n      VID_SECRET_LENGTH: "${LENGTHS[state]}"\n`;
  y += `  ${name}:
    image: \${PRODUCT_IMAGE}
    init: true
    restart: "no"
    networks: [ledger]
    environment:
      PORT: "8787"
      CI: "1"
      WRANGLER_SEND_METRICS: "false"
      VID_TEST_SECRET: "test-only-not-a-secret-0000000000000000"
      VID_TEST: "1"
${env}${HEALTH}`;
}
if (n) writeFileSync(`${dir}/variants.yml`, y);
writeFileSync(`${dir}/variants.json`, JSON.stringify(out));
