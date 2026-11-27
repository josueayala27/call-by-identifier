#!/bin/sh
# Purpose: run: runs the selection in ENGINE inside the tests container, each case stopped at CASE_LIMIT, the JUnit report written to RESULTS.
# The products are reached by name on the run's own network. A staging run (run.sh --against: BASE_URL and SIGNIN set, nothing started)
# runs the same image against that address, on a network with a route out, with the test inbox and the work folder's captures/.
set -u
. "$(dirname "$0")/lib.sh"
mkdir -p "$RESULTS_DIR"
if [ -n "${BASE_URL:-}" ]; then
  # the test inbox (DIF-001, SEAM-001): STAGING_INBOX and STAGING_INBOX_URL from the caller's environment, else the work folder's staging-inbox.env
  # (two KEY=value lines, never committed); unset, those cases error "setup:"
  [ -n "${STAGING_INBOX:-}${STAGING_INBOX_URL:-}" ] || [ ! -f "$WORK/staging-inbox.env" ] || . "$WORK/staging-inbox.env"
  mkdir -p "$WORK/captures"
  docker image inspect "$TESTS_IMAGE" > /dev/null 2>&1 || docker build -q -t "$TESTS_IMAGE" -f "$H/tests.Dockerfile" "$H" > /dev/null
  exec docker run --rm --init -w /app -v "$CHECKOUT:/app:ro" -v "$H:/harness:ro" -v "$RESULTS_DIR:/vid-results" -v "$WORK/captures:/captures" \
    -e CI=1 -e NO_COLOR=1 -e FORCE_COLOR=0 -e ENGINE="${ENGINE:-chromium}" -e SELECTION="${SELECTION:-}" -e CASE_LIMIT="${CASE_LIMIT:-180}" -e NO_PRODUCT= \
    -e PRODUCT_URL="$BASE_URL" -e PRODUCT_OFF_URL="$BASE_URL" -e PRODUCT_OFF_MAIL_URL= -e SIGNIN="${SIGNIN:-}" \
    -e STAGING_INBOX="${STAGING_INBOX:-}" -e STAGING_INBOX_URL="${STAGING_INBOX_URL:-}" -e CAPTURES_DIR=/captures \
    -e RESULTS_NAME="$RESULTS_NAME" "$TESTS_IMAGE" sh /harness/runtests.sh
fi
if [ "${NO_PRODUCT:-}" = 1 ]; then PRODUCT_URL=''; PRODUCT_OFF_URL=''; PRODUCT_OFF_MAIL_URL=''; PRODUCT_RESTART_URL=''; PRODUCT_SECRET_VARIANTS=''
else PRODUCT_URL=http://product:8787; PRODUCT_OFF_URL=http://product-off:8787; PRODUCT_OFF_MAIL_URL=http://product-off:8789/
  PRODUCT_RESTART_URL=http://product:8788/restart
  PRODUCT_SECRET_VARIANTS=$(cat "$STATE/variants.json" 2>/dev/null || true); fi
export PRODUCT_URL PRODUCT_OFF_URL PRODUCT_OFF_MAIL_URL PRODUCT_RESTART_URL PRODUCT_SECRET_VARIANTS
dc run --rm --no-deps -T tests
