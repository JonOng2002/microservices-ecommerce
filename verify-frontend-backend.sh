#!/bin/bash

# Script to verify frontend is talking to Docker backend
# Run this while your frontend apps are running

echo "🔍 Verifying Frontend ↔️  Docker Backend Connection"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend services are running
echo "📊 Step 1: Checking Backend Services Status"
echo "-------------------------------------------"
docker ps --filter "name=test-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(product|order|payment|auth)" || echo "❌ No backend services found"
echo ""

# Test backend health endpoints
echo "🏥 Step 2: Testing Backend Health Endpoints"
echo "--------------------------------------------"
echo -n "Product Service (8000): "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Order Service (8001): "
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Payment Service (8002): "
if curl -s http://localhost:8002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "Auth Service (8003): "
if curl -s http://localhost:8003/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo ""

# Check if frontend apps are running
echo "🌐 Step 3: Checking Frontend Apps"
echo "----------------------------------"
echo -n "Client App (3002): "
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}⚠️  Not running (start with: pnpm --filter client dev)${NC}"
fi

echo -n "Admin App (3003): "
if curl -s http://localhost:3003 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${YELLOW}⚠️  Not running (start with: pnpm --filter admin dev)${NC}"
fi

echo ""

# Monitor backend logs for incoming requests
echo "📡 Step 4: Monitoring Backend Logs (last 5 lines)"
echo "--------------------------------------------------"
echo "Product Service logs:"
docker logs test-product-service --tail 5 2>&1 | grep -E "(GET|POST|PUT|DELETE)" | tail -3 || echo "  (No recent requests)"
echo ""

# Test CORS headers
echo "🔐 Step 5: Testing CORS Headers"
echo "--------------------------------"
echo "Testing Product Service CORS:"
curl -s -H "Origin: http://localhost:3002" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8000/products \
     -I 2>&1 | grep -i "access-control" || echo "  (CORS headers not visible in OPTIONS)"
echo ""

# Test actual API call
echo "🧪 Step 6: Testing API Endpoint"
echo "-------------------------------"
echo "GET /products:"
RESPONSE=$(curl -s http://localhost:8000/products)
if [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ API Responding${NC}"
    echo "Response: $RESPONSE" | head -c 100
    echo "..."
else
    echo -e "${RED}❌ No response${NC}"
fi

echo ""
echo "=================================================="
echo "✅ Verification Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Open browser DevTools (F12)"
echo "2. Go to Network tab"
echo "3. Visit http://localhost:3002"
echo "4. Look for requests to localhost:8000, 8001, 8002, 8003"
echo "5. Check backend logs: docker logs -f test-product-service"

