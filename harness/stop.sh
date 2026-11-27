#!/bin/sh
# Purpose: stop: takes down all that start: started for this RUN_ID (containers, network, volumes, the product image); exits 1 when anything is left
set -u
. "$(dirname "$0")/lib.sh"
dc down --volumes --remove-orphans --rmi local --timeout 10 > /dev/null 2>&1
left=$(sh "$H/leftovers.sh")
[ -z "$left" ] || { echo "stop: still up: $left"; exit 1; }
echo "stop: $P down"
