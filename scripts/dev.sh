#!/usr/bin/env sh
# Preview the site with the embedded terminal, laid out like production:
#   /                    this repo
#   /nextcube-terminal/  ../nextcube-terminal (clone it next to this repo)
# Usage: scripts/dev.sh [port]
set -e
PORT="${1:-8000}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TERM_REPO="$HERE/../nextcube-terminal"
[ -d "$TERM_REPO" ] || { echo "Clone github.com/dhairyab0069/nextcube-terminal next to this repo first." >&2; exit 1; }
ROOT="$(mktemp -d)"
trap 'rm -rf "$ROOT"' EXIT INT TERM
for f in "$HERE"/* ; do ln -s "$f" "$ROOT/"; done
ln -s "$TERM_REPO" "$ROOT/nextcube-terminal"
echo "Serving http://localhost:$PORT (terminal at /nextcube-terminal/)"
cd "$ROOT" && python3 -m http.server "$PORT"
