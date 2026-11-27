#!/bin/sh
# Purpose: stop: takes down all that start: started for this RUN_ID (containers, network, volumes, the product image, the state folder); exits 1 when anything is left
set -u
. "$(dirname "$0")/lib.sh"
dc down --volumes --remove-orphans --timeout 10 > /dev/null 2>&1
docker image rm -f "$PRODUCT_IMAGE" > /dev/null 2>&1
rm -rf "$STATE"
left=$(sh "$H/leftovers.sh")
[ -z "$left" ] || { echo "stop: still up: $left"; exit 1; }
echo "stop: $P down"
