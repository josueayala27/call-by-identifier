#!/bin/sh
# Purpose: run: runs the selection in ENGINE inside the tests container, each case stopped at CASE_LIMIT, the JUnit report written to RESULTS.
# The product is reached by name on the run's own network. A staging run (run.sh --against: BASE_URL and SIGNIN set, nothing started)
# runs the same image against that address, on a network with a route out.
set -u
. "$(dirname "$0")/lib.sh"
mkdir -p "$RESULTS_DIR"
if [ -n "${BASE_URL:-}" ]; then
  docker image inspect "$TESTS_IMAGE" > /dev/null 2>&1 || docker build -q -t "$TESTS_IMAGE" -f "$H/tests.Dockerfile" "$H" > /dev/null
  exec docker run --rm --init -w /app -v "$CHECKOUT:/app:ro" -v "$H:/harness:ro" -v "$RESULTS_DIR:/vid-results" \
    -e CI=1 -e ENGINE="${ENGINE:-chromium}" -e SELECTION="${SELECTION:-}" -e CASE_LIMIT="${CASE_LIMIT:-180}" -e NO_PRODUCT= \
    -e PRODUCT_URL="$BASE_URL" -e SIGNIN="${SIGNIN:-}" -e RESULTS_NAME="$RESULTS_NAME" "$TESTS_IMAGE" sh /harness/runtests.sh
fi
if [ "${NO_PRODUCT:-}" = 1 ]; then PRODUCT_URL=''; else PRODUCT_URL=http://product:8787; fi; export PRODUCT_URL
dc run --rm --no-deps -T tests
