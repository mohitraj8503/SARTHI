#!/bin/bash
# scripts/verify-live-class.sh
set -e

echo "🔍 Live Class System Pre-Launch Verification"

# 1. Token generation check
echo "Checking Token API..."
response=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"roomName":"test","userId":"teacher1","role":"teacher"}' \
  http://localhost:3000/api/livekit/token)
echo "$response" | grep -q "token" || { echo "❌ Token API failed"; exit 1; }
echo "✅ Token API OK"

# 2. Build verification
echo "Running Next.js build check..."
npx cross-env DATABASE_MODE=mock NODE_OPTIONS="--max-old-space-size=4096" next build || { echo "❌ Build failed"; exit 1; }
echo "✅ Build OK"

echo "🎉 All live class checks passed. System ready for production."
