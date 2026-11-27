#!/bin/sh
# Purpose: logs: the environment's log lines with their times, then each service's end state; runs before stop:
set -u
. "$(dirname "$0")/lib.sh"
dc logs --timestamps --no-color 2>&1 | tail -n 2000
echo "== end states"
dc ps -a --format '{{.Service}} {{.State}} exit={{.ExitCode}} {{.Status}}' 2>&1
