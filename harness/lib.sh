# Purpose: shared names for the harness scripts: the compose project of this run, its state folder, the compose files, the images
H=$(cd "$(dirname "$0")" && pwd -P)
P=cbi-$(printf '%s' "${RUN_ID:-manual}" | tr 'A-Z' 'a-z' | tr -cd 'a-z0-9')
CHECKOUT=${CHECKOUT:-$(pwd -P)}
TESTS_IMAGE=cbi-tests:$(cat "$H/tests.Dockerfile" "$H/toolchain/package-lock.json" | cksum | cut -d' ' -f1)
PRODUCT_IMAGE=$P-product:run
# the run's own state, written by start: and read by run: (the secret variants' compose file and list); stop: removes it
STATE=/tmp/cbi-state/$P
WORK=$(dirname "$H")
RESULTS=${RESULTS:-/tmp/cbi-results.xml}
HARNESS=$H; export CHECKOUT TESTS_IMAGE PRODUCT_IMAGE HARNESS
RESULTS_DIR=$(cd "$(dirname "$RESULTS")" 2>/dev/null && pwd -P || echo /tmp); RESULTS_NAME=$(basename "$RESULTS")
export RESULTS_DIR RESULTS_NAME
dc() { if [ -f "$STATE/variants.yml" ]; then docker compose -p "$P" -f "$H/compose.yml" -f "$STATE/variants.yml" "$@"; else docker compose -p "$P" -f "$H/compose.yml" "$@"; fi; }
