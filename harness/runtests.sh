#!/bin/sh
# Purpose: inside the tests container: Vitest (HTTP and WebSocket cases, *.test.ts) and Playwright (browser cases, *.spec.ts) over
# tests/invariants/, against PRODUCT_URL; each case stopped at CASE_LIMIT; one JUnit report at /vid-results/$RESULTS_NAME
set -u
PRIMARY=chromium
OUT=$(mktemp -d); MS=$(( ${CASE_LIMIT:-180} * 1000 ))
# SELECTION: names (row ids) become one pattern on case names; a token with / is a file filter
RE=''; FILES=''
for w in ${SELECTION:-}; do case $w in */*) FILES="$FILES $w" ;; *) e=$(printf '%s' "$w" | sed 's/[][\.*^$(){}+?|]/\\&/g'); RE="${RE:+$RE|}$e" ;; esac; done
[ -z "$RE" ] || RE="(^|[^A-Za-z0-9])($RE)([^A-Za-z0-9]|\$)"
rc=0
if [ "${ENGINE:-$PRIMARY}" = "$PRIMARY" ]; then
  echo "== vitest, engine-free cases, in the $PRIMARY pass"
  # shellcheck disable=SC2086
  node /node_modules/vitest/vitest.mjs run --config /harness/vitest.config.mjs --root /app \
    --reporter=default --reporter=junit --outputFile.junit="$OUT/vitest.xml" \
    --testTimeout="$MS" --hookTimeout="$MS" --passWithNoTests ${RE:+-t "$RE"} $FILES || rc=$?
fi
echo "== playwright, engine ${ENGINE:-$PRIMARY}"
# shellcheck disable=SC2086
PLAYWRIGHT_JUNIT_OUTPUT_NAME="$OUT/playwright.xml" node /node_modules/@playwright/test/cli.js test --config /harness/playwright.config.mjs \
  --project "${ENGINE:-$PRIMARY}" --timeout "$MS" --pass-with-no-tests ${RE:+--grep "$RE"} $FILES || { r=$?; [ "$rc" -ne 0 ] || rc=$r; }
node /harness/merge-junit.mjs "$OUT/vitest.xml" "$OUT/playwright.xml" > "$OUT/merged.xml" && cp "$OUT/merged.xml" "/vid-results/$RESULTS_NAME"
exit "$rc"
