#!/bin/sh
# Build the offline engine viewer with the project's presentation assets.
set -e
cd "$(dirname "$0")/.."
node scripts/build-engine.mjs
node tests/timing.mjs
