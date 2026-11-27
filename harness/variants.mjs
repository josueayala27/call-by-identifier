// Purpose: start:'s helper: from the entry's declared secrets, the run's variants: a compose file with one product per secret and state
// (missing: VID_SECRET_MISSING=<NAME>; short: VID_SECRET_SHORT=<NAME>, the entry giving it 8 characters), and the JSON list for PRODUCT_SECRET_VARIANTS
import { writeFileSync } from 'node:fs';
const [decl, dir] = process.argv.slice(2);
const list = JSON.parse(decl);
const out = []; let y = 'services:\n'; let n = 0;
for (const { secret, role } of list) for (const state of ['missing', 'short']) {
  n += 1; const name = `variant-${n}`;
  out.push({ secret, state, role: role || 'other', url: `http://${name}:8787` });
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
      ${state === 'missing' ? 'VID_SECRET_MISSING' : 'VID_SECRET_SHORT'}: "${secret}"
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:8787/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"]
      interval: 2s
      timeout: 5s
      retries: 150
      start_period: 5s
`;
}
if (n) writeFileSync(`${dir}/variants.yml`, y);
writeFileSync(`${dir}/variants.json`, JSON.stringify(out));
