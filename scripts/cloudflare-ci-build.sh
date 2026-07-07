#!/usr/bin/env bash
# Cloudflare Pages native Git build entrypoint.
# Use as Build command in dashboard: bash scripts/cloudflare-ci-build.sh
set -euo pipefail

export SOURCE_DATE_EPOCH="${SOURCE_DATE_EPOCH:-$(git log -1 --format=%ct 2>/dev/null || date +%s)}"

echo "Cloudflare CI build (Node $(node -v), SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH)"

npm ci
npm run build
npm run verify:build

echo "OK: dist/ ready for deploy"
