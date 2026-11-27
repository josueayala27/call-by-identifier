#!/bin/sh
# Purpose: leftovers: prints what is still up of this RUN_ID's compose project, nothing when clear
set -u
. "$(dirname "$0")/lib.sh"
f="label=com.docker.compose.project=$P"
{ docker ps -aq --filter "$f" | sed 's/^/container /'
  docker network ls -q --filter "$f" | sed 's/^/network /'
  docker volume ls -q --filter "$f" | sed 's/^/volume /'; } 2>/dev/null | tr '\n' ' ' | sed 's/ $//'
