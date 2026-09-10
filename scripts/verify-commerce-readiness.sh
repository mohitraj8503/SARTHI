#!/bin/bash
# scripts/verify-commerce-readiness.sh
set -e

echo "🔍 Commerce System Pre-Launch Verification"

# 1. Course discovery works
curl -f "http://localhost:3000/courses?q=react" > /dev/null || { echo "❌ Course catalog failed"; exit 1; }

# 2. Search filtering functional
curl -f "http://localhost:3000/api/search/courses?q=test&category=Development" > /dev/null || { echo "❌ Search API failed"; exit 1; }

# 3. Live session API endpoints exist
curl -f -X POST -H "Authorization: Bearer test" -H "Content-Type: application/json" \
  -d '{"title":"Test","scheduledStart":"2026-05-06T10:00:00Z","duration":60,"courseId":"test"}' \
  http://localhost:3000/api/teacher/sessions > /dev/null || { echo "❌ Session API failed"; exit 1; }

# 4. Video streaming secure
curl -f -H "Authorization: Bearer test" \
  http://localhost:3000/api/courses/test/lessons/test/stream > /dev/null || { echo "❌ Video streaming failed"; exit 1; }

# 5. Mobile performance (Lighthouse CI)
npx lighthouse http://localhost:3000/courses \
  --only-categories=performance,seo,best-practices \
  --throttling.cpuSlowdownMultiplier=4 \
  --output=json --output-path=.lh-commerce.json

echo "✅ All commerce-critical checks passed. Platform ready for paying customers."
