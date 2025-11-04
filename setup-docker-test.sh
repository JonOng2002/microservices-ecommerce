#!/bin/bash

# Setup script for Docker testing environment
# This helps you quickly set up .env.docker-test from your existing service .env files

echo "🐳 Setting up Docker test environment..."
echo ""

# Check if template exists
if [ ! -f "env.docker-test.template" ]; then
    echo "❌ Error: env.docker-test.template not found"
    exit 1
fi

# Create .env.docker-test if it doesn't exist
if [ -f ".env.docker-test" ]; then
    echo "⚠️  .env.docker-test already exists"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

echo "📋 Creating .env.docker-test from your service .env files..."
echo ""

# Function to extract value from .env file
get_env_value() {
    local file=$1
    local key=$2
    if [ -f "$file" ]; then
        grep "^${key}=" "$file" | cut -d '=' -f2- | tr -d '\n'
    fi
}

# Extract values from service .env files
CLERK_SECRET=$(get_env_value "apps/auth-service/.env" "CLERK_SECRET_KEY")
CLERK_PUB=$(get_env_value "apps/auth-service/.env" "CLERK_PUBLISHABLE_KEY")
CLERK_WEBHOOK=$(get_env_value "apps/auth-service/.env" "CLERK_WEBHOOK_SECRET")
STRIPE_SECRET=$(get_env_value "apps/payment-service/.env" "STRIPE_SECRET_KEY")
STRIPE_WEBHOOK=$(get_env_value "apps/payment-service/.env" "STRIPE_WEBHOOK_SECRET")
GOOGLE_CLIENT=$(get_env_value "apps/email-service/.env" "GOOGLE_CLIENT_ID")
GOOGLE_SECRET=$(get_env_value "apps/email-service/.env" "GOOGLE_CLIENT_SECRET")
GOOGLE_REFRESH=$(get_env_value "apps/email-service/.env" "GOOGLE_REFRESH_TOKEN")

# Create .env.docker-test
cat > .env.docker-test << EOF
# ===============================================
# Docker Test Environment Variables
# ===============================================
# Auto-generated from service .env files
# Generated: $(date)
# ===============================================

# Clerk Authentication
CLERK_SECRET_KEY=${CLERK_SECRET:-sk_test_YOUR_KEY_HERE}
CLERK_PUBLISHABLE_KEY=${CLERK_PUB:-pk_test_YOUR_KEY_HERE}
CLERK_WEBHOOK_SECRET=${CLERK_WEBHOOK:-whsec_YOUR_SECRET_HERE}

# Stripe Payment
STRIPE_SECRET_KEY=${STRIPE_SECRET:-sk_test_YOUR_KEY_HERE}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK:-whsec_YOUR_SECRET_HERE}

# Google OAuth (for Email Service)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT}
GOOGLE_CLIENT_SECRET=${GOOGLE_SECRET}
GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH}
EOF

echo "✅ Created .env.docker-test"
echo ""

# Check which values were found
echo "📊 Values extracted:"
[ -n "$CLERK_SECRET" ] && echo "  ✅ CLERK_SECRET_KEY" || echo "  ⚠️  CLERK_SECRET_KEY (not found)"
[ -n "$CLERK_PUB" ] && echo "  ✅ CLERK_PUBLISHABLE_KEY" || echo "  ⚠️  CLERK_PUBLISHABLE_KEY (not found)"
[ -n "$STRIPE_SECRET" ] && echo "  ✅ STRIPE_SECRET_KEY" || echo "  ⚠️  STRIPE_SECRET_KEY (not found)"
[ -n "$GOOGLE_CLIENT" ] && echo "  ✅ GOOGLE_CLIENT_ID" || echo "  ⚠️  GOOGLE_CLIENT_ID (not found, optional)"

echo ""
echo "📝 Next steps:"
echo "1. Review .env.docker-test and add any missing values"
echo "2. Build Docker images: ./test-docker-builds.sh"
echo "3. Start services: docker-compose -f docker-compose.test.yml --env-file .env.docker-test up"
echo ""
echo "📖 For full instructions, see TEST_DOCKER_LOCALLY.md"

