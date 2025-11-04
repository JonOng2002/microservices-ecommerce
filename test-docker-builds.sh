#!/bin/bash

# Test Docker Builds for All Microservices
# This script builds all Docker images to verify they work before pushing to ECR

set -e  # Exit on any error

echo "🐳 Testing Docker builds for all microservices..."
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build and test a service
build_service() {
    local service_name=$1
    local dockerfile_path=$2
    
    echo -e "${YELLOW}📦 Building ${service_name}...${NC}"
    
    if docker build -t ${service_name}:test -f ${dockerfile_path} . ; then
        echo -e "${GREEN}✅ ${service_name} build successful${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ ${service_name} build failed${NC}"
        echo ""
        return 1
    fi
}

# Track results
failed_builds=()

# Build all services
echo "Building backend services..."
echo ""

build_service "product-service" "apps/product-service/Dockerfile" || failed_builds+=("product-service")
build_service "order-service" "apps/order-service/Dockerfile" || failed_builds+=("order-service")
build_service "payment-service" "apps/payment-service/Dockerfile" || failed_builds+=("payment-service")
build_service "auth-service" "apps/auth-service/Dockerfile" || failed_builds+=("auth-service")
build_service "email-service" "apps/email-service/Dockerfile" || failed_builds+=("email-service")

echo "================================================"
echo ""

# Summary
if [ ${#failed_builds[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All Docker builds successful!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test running a container:"
    echo "   docker run -e DATABASE_URL=your_db_url -p 8000:8000 product-service:test"
    echo ""
    echo "2. Push to ECR when ready:"
    echo "   ./scripts/push-to-ecr.sh"
    exit 0
else
    echo -e "${RED}❌ Some builds failed:${NC}"
    for service in "${failed_builds[@]}"; do
        echo -e "${RED}   - ${service}${NC}"
    done
    exit 1
fi

