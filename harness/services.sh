#!/bin/sh
# Purpose: services: prints `<name> died … exit <code>` for each service of this run that ended other than with 0, nothing while all live.
# A secret variant that ended is expected (refusing to run without its secret) unless killed for memory (137)
set -u
. "$(dirname "$0")/lib.sh"
dc ps -a --format '{{.Service}} {{.State}} {{.ExitCode}}' 2>/dev/null | awk '$1 != "tests" && ($2 == "exited" || $2 == "dead") && $3 != 0 && ($1 !~ /^variant-/ || $3 == 137) { print $1 " died, state " $2 ", exit " $3 }'
