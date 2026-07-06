#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js no está instalado."
  exit 1
fi

if [ ! -d node_modules/playwright ]; then
  echo "Instalando Playwright localmente..."
  npm install --no-save playwright
fi

APP_URL="${APP_URL:-http://127.0.0.1:4173?mode=demo}"
OUT_DIR="${OUT_DIR:-artifacts/responsive}"
DEMO_USER="${DEMO_USER:-admin}"
DEMO_PASS="${DEMO_PASS:-admin123}"

APP_URL="$APP_URL" OUT_DIR="$OUT_DIR" DEMO_USER="$DEMO_USER" DEMO_PASS="$DEMO_PASS" node scripts/take-responsive-screenshots.mjs
