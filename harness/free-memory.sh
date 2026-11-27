#!/bin/sh
# Purpose: free-memory: MiB free now in the container engine: its total less what running containers use
set -u
t=$(docker info --format '{{.MemTotal}}' 2>/dev/null || echo 0)
u=$(docker stats --no-stream --format '{{.MemUsage}}' 2>/dev/null | awk '{ v = $1; m = 1; if (v ~ /GiB$/) m = 1024; else if (v ~ /KiB$/) m = 1 / 1024; else if (v ~ /B$/ && v !~ /MiB$/) m = 1 / 1048576; gsub(/[A-Za-z]/, "", v); s += v * m } END { printf "%d", s }')
echo $(( t / 1048576 - ${u:-0} ))
