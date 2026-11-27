#!/bin/sh
# Purpose: start: brings up this run's environment and returns once it is ready. With NO_PRODUCT=1 the product is not built or started.
# Runs in the checkout. Images are built from cache: dependencies are fetched only when a lockfile changed, never per run.
set -eu
. "$(dirname "$0")/lib.sh"
docker image inspect "$TESTS_IMAGE" > /dev/null 2>&1 || docker build -q -t "$TESTS_IMAGE" -f "$H/tests.Dockerfile" "$H"
if [ "${NO_PRODUCT:-}" = 1 ]; then echo "start: no product (NO_PRODUCT=1); the tests image $TESTS_IMAGE is ready"; exit 0; fi
[ -f "$CHECKOUT/package.json" ] && [ -f "$CHECKOUT/pnpm-lock.yaml" ] || { echo "start: the checkout has no package.json or pnpm-lock.yaml: no product to start"; exit 1; }
dc build product
# readiness by the product's healthcheck, never a fixed sleep
dc up -d --no-build --wait --wait-timeout 600 product
echo "start: $P ready, the product healthy at http://product:8787"
