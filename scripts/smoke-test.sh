#!/usr/bin/env bash
# Smoke test for Ngula Analytics.
# 1) builds the backend, 2) checks /health, 3) logs in, 4) hits client-data endpoints.
# Usage: BASE_URL=http://localhost:5000 bash scripts/smoke-test.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
EMAIL="${EMAIL:-exec@ngula.demo}"
PASSWORD="${PASSWORD:-Demo@2025}"

echo "==> [1/4] Building backend"
dotnet build src/NgulAnalytics.Api/NgulAnalytics.Api.csproj -c Release --nologo

echo "==> [2/4] Health check: $BASE_URL/health"
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$code" != "200" ]; then
  echo "FAIL: /health returned $code"; exit 1
fi
echo "OK: /health = 200"

echo "==> [3/4] Login as $EMAIL"
token=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')
if [ -z "${token:-}" ]; then
  echo "FAIL: no JWT returned from login"; exit 1
fi
echo "OK: received JWT (${#token} chars)"

echo "==> [4/4] Client-data endpoints"
curl -sf -H "Authorization: Bearer $token" "$BASE_URL/api/plant-data/production/summary" >/dev/null \
  && echo "OK: /api/plant-data/production/summary"
curl -sf -H "Authorization: Bearer $token" "$BASE_URL/api/plant-data/engineering/summary" >/dev/null \
  && echo "OK: /api/plant-data/engineering/summary"

echo "ALL SMOKE TESTS PASSED"
