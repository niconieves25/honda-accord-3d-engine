#!/bin/sh
# Builds engine-explorer/index.html: one offline file (three.js, fonts and styles inlined) from app/main.js, with the
# teardown skill's bundler. Then runs the timing checks.
#   engine-explorer/scripts/build.sh
set -e
cd "$(dirname "$0")/.."
SKILL_DIR=${SKILL_DIR:-"$HOME/.claude/skills/teardown"}
TEARDOWN_OUT="$PWD/.build" node "$SKILL_DIR/sims/build.mjs" ./app
cp .build/dist/app.html index.html
node tests/timing.mjs > /dev/null && echo "timing checks passed"
echo "built $(pwd)/index.html"
