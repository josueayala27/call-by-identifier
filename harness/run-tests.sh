#!/bin/sh
# Purpose: run: runs the selection in ENGINE inside the tests container, each case stopped at CASE_LIMIT, the JUnit report written to RESULTS
set -u
. "$(dirname "$0")/lib.sh"
if [ "${NO_PRODUCT:-}" = 1 ]; then BASE_URL=''; else BASE_URL=http://product:8787; fi; export BASE_URL
mkdir -p "$RESULTS_DIR"
dc run --rm --no-deps -T tests
