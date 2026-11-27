#!/bin/sh
# Purpose: start: brings up this run's environment and returns once it is ready: the product (under the restart supervisor), product-off (the
# same image, VID_TEST=0, under the mail tap) and one product per secret the entry declares and per state: missing, short (31) and exact (32). With NO_PRODUCT=1 no product is built or started.
# Runs in the checkout. Images are built from cache: dependencies are fetched only when a lockfile changed, never per run.
set -eu
. "$(dirname "$0")/lib.sh"
docker image inspect "$TESTS_IMAGE" > /dev/null 2>&1 || docker build -q -t "$TESTS_IMAGE" -f "$H/tests.Dockerfile" "$H"
if [ "${NO_PRODUCT:-}" = 1 ]; then echo "start: no product (NO_PRODUCT=1); the tests image $TESTS_IMAGE is ready"; exit 0; fi
[ -f "$CHECKOUT/package.json" ] && [ -f "$CHECKOUT/pnpm-lock.yaml" ] || { echo "start: the checkout has no package.json or pnpm-lock.yaml: no product to start"; exit 1; }
rm -rf "$STATE"; mkdir -p "$STATE"
dc build product
# the secrets the Worker reads, as the entry declares them (pnpm run entry --secrets: a JSON list [{"secret":"NAME","role":"…"}], then exit);
# an entry that does not answer one within 45 s declares none known: PRODUCT_SECRET_VARIANTS stays unset and its cases error "setup:"
decl=$(dc run --rm --no-deps -T --entrypoint timeout product 45 pnpm run --silent entry --secrets 2>/dev/null | tail -n 1 || true)
if node -e 'const v=JSON.parse(process.argv[1]); if(!Array.isArray(v)||!v.every(x=>x&&typeof x.secret==="string"&&/^[A-Za-z_][A-Za-z0-9_]*$/.test(x.secret))) process.exit(1)' "$decl" 2>/dev/null; then
  node "$H/variants.mjs" "$decl" "$STATE"
  echo "start: the entry declares $(node -e 'console.log(JSON.parse(process.argv[1]).map(x=>x.secret).join(" ")||"no secret")' "$decl"); variants in $STATE"
else
  echo "start: the entry declares no secrets (pnpm run entry --secrets gave no JSON list): no secret variants, PRODUCT_SECRET_VARIANTS unset"
fi
# readiness by the healthchecks, never a fixed sleep: the product and product-off must be healthy
dc up -d --no-build --wait --wait-timeout 600 product product-off
GIVEN='const fs=require("fs"); const name=process.argv[1]; let seen=false, len=null;
for (const p of fs.readdirSync("/proc")) { if (!/^[0-9]+$/.test(p)) continue; let a; try { a=fs.readFileSync("/proc/"+p+"/cmdline","utf8").split("\0"); } catch { continue; }
  if (!a.includes("--var")) continue; seen=true;
  for (let i=0; i<a.length-1; i++) if (a[i]==="--var" && a[i+1].startsWith(name+":")) len=a[i+1].length-name.length-1; }
console.log(!seen ? "unread" : len===null ? "absent" : String(len));'
# the variants: each healthy, or ended (a product that refuses to start without its secret is one way of refusing); waited, never slept
if [ -f "$STATE/variants.yml" ]; then
  vs=$(dc config --services | grep '^variant-' || true)
  # shellcheck disable=SC2086
  dc up -d --no-build $vs
  given=''
  for v in $vs; do
    n=0; while :; do s=$(docker inspect -f '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}' "$(dc ps -aq "$v")" 2>/dev/null || echo gone)
      case $s in 'running healthy') break ;; exited*|dead*|gone) echo "start: $v ended before it was healthy ($s): its URL answers nothing"; break ;; esac
      n=$((n + 1)); [ "$n" -lt 300 ] || { echo "start: $v not healthy within 600 s"; exit 1; }; sleep 2; done
    # what the variant was given, read from its own processes' command lines (wrangler's --var <NAME>:<value>): the length alone, never the value
    if [ "$s" = 'running healthy' ]; then
      sec=$(node -e 'const l=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")); console.log(l.find((x)=>x.name===process.argv[2]).secret)' "$STATE/variants.json" "$v")
      g=$(dc exec -T "$v" node -e "$GIVEN" "$sec" 2>/dev/null | tail -n 1); given="$given $v=${g:-unread}"
    fi
  done
  # shellcheck disable=SC2086
  node "$H/variants.mjs" --given "$STATE" $given
  echo "start: secret variants $(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).map((x)=>x.name+" "+x.secret+" "+x.state+(x.length===undefined?"":" "+x.length)).join(", "))' "$STATE/variants.json")"
fi
echo "start: $P ready, the product healthy at http://product:8787, product-off at http://product-off:8787"
