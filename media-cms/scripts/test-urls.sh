#!/bin/bash

# Test the exact URL that the frontend would generate
STRAPI_URL="http://127.0.0.1:1337"
FRONTEND_URL="http://127.0.0.1:3000"

echo "=== Testing Strapi API Directly ==="
echo ""

echo "1. Getting categories list:"
curl -s "${STRAPI_URL}/api/categories?pagination[pageSize]=100" | jq '.data[] | {id, name, slug}' | head -20

echo ""
echo "2. Getting articles with Politique filter (slug='category'):"
curl -s "${STRAPI_URL}/api/articles?pagination[pageSize]=100&populate=category,author&filters[category][slug][\$eq]=category&filters[publishedAt][\$notNull]=true" | jq '.data[] | {id, title, published_at: .publishedAt, category: .category.name}'

echo ""
echo "3. Testing URL with ID filter instead (category ID=1):"
curl -s "${STRAPI_URL}/api/articles?pagination[pageSize]=100&populate=category&filters[category][id][\$eq]=1&filters[publishedAt][\$notNull]=true" | jq '.data | length' 2>/dev/null || echo "Connection failed - Strapi may not be running"

echo ""
echo "4. Frontend page test:"
echo "   URL: ${FRONTEND_URL}/articles?category=category"
echo "   (Try opening this in your browser)"
