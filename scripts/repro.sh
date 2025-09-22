#!/usr/bin/env bash
# scripts/repro.sh
# Quick reproduction script for CSS @import warning + missing /en translations
# Usage: bash scripts/repro.sh

set -euo pipefail

echo "=== Detecting package manager ==="
if [ -f "pnpm-lock.yaml" ]; then
  PM="pnpm"
elif [ -f "yarn.lock" ]; then
  PM="yarn"
else
  PM="npm"
fi
echo "Using package manager: $PM"

echo "=== Git status (short) ==="
git status --porcelain || true

echo "=== Package.json scripts ==="
cat package.json | grep -A3 scripts || true

echo "=== Searching for @import usage ==="
grep -n "@import" -R src . | head -20 || true

echo "=== Searching for layout.css references ==="
grep -n "layout.css" -R . | head -20 || true

echo "=== Searching for i18n / locale / supabase references ==="
grep -n "i18n\|locale\|translations\|supabase" -R src . | head -20 || true

echo "=== Starting dev server in background ==="
$PM run dev > repro_dev.log 2>&1 &
DEV_PID=$!
sleep 10

echo "=== Curling root page ==="
curl -s http://localhost:3000 | head -40

echo "=== Curling /en route ==="
curl -s http://localhost:3000/en | head -80 > repro_en.html
echo "Saved SSR output to repro_en.html"

echo "=== Checking for CSS file ==="
curl -s http://localhost:3000/layout.css?v=1758532155631 | sed -n '3800,3860p' > repro_layout.css
echo "Saved snippet to repro_layout.css"

echo "=== Killing dev server ==="
kill $DEV_PID || true

echo "=== Done. Check repro_dev.log, repro_en.html, repro_layout.css ==="
