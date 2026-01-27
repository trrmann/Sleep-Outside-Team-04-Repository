#!/usr/bin/env bash
set -euo pipefail

# Simple script to probe backend and local proxy endpoints.
# Usage: ./scripts/api-check.sh [PROXY_URL] [BACKEND_URL]

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/src/.env.production.local"
TOKEN=""
if [[ -f "$ENV_FILE" ]]; then
  TOKEN=$(grep -m1 '^BACKEND_API_TOKEN=' "$ENV_FILE" | cut -d= -f2- || true)
fi

if [[ -z "$TOKEN" ]]; then
  echo "No token found in $ENV_FILE; proceeding without Authorization header"
else
  echo "Using token from $ENV_FILE"
fi

PROXY_URL="${1:-http://localhost:3000}"
BACKEND_URL="${2:-https://wdd330-backend.onrender.com}"

URLS=(
  "$PROXY_URL/api/openapi.json"
  "$PROXY_URL/api/1.0/product/927vj/"
  "$PROXY_URL/api/1.0/products/s~sleeping-bags/"
  "$BACKEND_URL/openapi.json"
)

for u in "${URLS[@]}"; do
  echo
  echo "=== $u ==="
  if [[ -n "$TOKEN" ]]; then
    curl -i -sS -H "Authorization: Bearer $TOKEN" "$u" || true
  else
    curl -i -sS "$u" || true
  fi
done

echo
echo "Done."
