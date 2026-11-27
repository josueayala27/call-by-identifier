#!/bin/sh
# Purpose: services: prints `<name> died … exit <code>` for each service of this run that ended other than with 0; nothing while all live
set -u
. "$(dirname "$0")/lib.sh"
dc ps -a --format '{{.Service}} {{.State}} {{.ExitCode}}' product 2>/dev/null | awk '$2 == "exited" || $2 == "dead" { if ($3 != 0) print $1 " died, state " $2 ", exit " $3 }'
