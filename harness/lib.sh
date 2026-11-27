# Purpose: shared names for the harness scripts: the compose project of this run, the compose file, the tests image
H=$(cd "$(dirname "$0")" && pwd -P)
P=cbi-$(printf '%s' "${RUN_ID:-manual}" | tr 'A-Z' 'a-z' | tr -cd 'a-z0-9')
CHECKOUT=${CHECKOUT:-$(pwd -P)}
TESTS_IMAGE=cbi-tests:$(cat "$H/tests.Dockerfile" "$H/toolchain/package-lock.json" | cksum | cut -d' ' -f1)
RESULTS=${RESULTS:-/tmp/cbi-results.xml}
export CHECKOUT TESTS_IMAGE
RESULTS_DIR=$(cd "$(dirname "$RESULTS")" 2>/dev/null && pwd -P || echo /tmp); RESULTS_NAME=$(basename "$RESULTS")
export RESULTS_DIR RESULTS_NAME
dc() { docker compose -p "$P" -f "$H/compose.yml" "$@"; }
