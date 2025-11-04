#!/bin/bash

# Build Docker images for both ARM64 (Mac M1/M2) and AMD64 (AWS ECS)
# This ensures images work locally AND in production

set -e

echo "🐳 Building multi-platform Docker images..."
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build multi-platform image
build_multiplatform() {
    local service_name=$1
    local dockerfile_path=$2
    
    echo -e "${YELLOW}📦 Building ${service_name} for ARM64 + AMD64...${NC}"
    
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        -t ${service_name}:latest \
        -f ${dockerfile_path} \
        --load \
        .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${service_name} build successful${NC}"
        echo ""
    else
        echo -e "${RED}❌ ${service_name} build failed${NC}"
        echo ""
        return 1
    fi
}

# Check if buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "⚠️  Docker buildx not found. Setting up..."
    docker buildx create --name multiplatform --use
    docker buildx inspect --bootstrap
fi

echo "Building all services..."
echo ""

# Build each service
build_multiplatform "product-service" "apps/product-service/Dockerfile"
build_multiplatform "order-service" "apps/order-service/Dockerfile"
build_multiplatform "payment-service" "apps/payment-service/Dockerfile"
build_multiplatform "auth-service" "apps/auth-service/Dockerfile"
build_multiplatform "email-service" "apps/email-service/Dockerfile"

echo "=============================================="
echo -e "${GREEN}🎉 All multi-platform builds complete!${NC}"
echo ""
echo "Images work on:"
echo "  ✅ Your Mac (ARM64)"
echo "  ✅ AWS ECS (AMD64)"

