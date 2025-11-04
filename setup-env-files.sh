#!/bin/bash

# Quick Environment Setup Script
# This creates all necessary .env files for teammates

echo "🔧 Setting up environment files for local development..."
echo ""

# Create .env files
echo "📁 Creating .env files..."

touch apps/product-service/.env
touch apps/order-service/.env
touch apps/payment-service/.env
touch apps/auth-service/.env
touch apps/email-service/.env
touch apps/client/.env.local
touch apps/admin/.env.local
# Note: packages/kafka/.env not needed - KAFKA_BROKERS is in each service's .env

echo "✅ Created all .env files"
echo ""
echo "📋 Files created:"
echo "  - apps/product-service/.env"
echo "  - apps/order-service/.env"
echo "  - apps/payment-service/.env"
echo "  - apps/auth-service/.env"
echo "  - apps/email-service/.env"
echo "  - apps/client/.env.local"
echo "  - apps/admin/.env.local"
echo "  (kafka/.env not needed - KAFKA_BROKERS in each service)"
echo ""
echo "📝 Next steps:"
echo "1. Copy values from ENV_TEMPLATES.txt to each .env file"
echo "2. Fill in your API keys (see ENV_SETUP_GUIDE.md)"
echo "3. Start Docker services:"
echo "   docker-compose -f docker-compose.local.yml up -d"
echo "4. Install dependencies:"
echo "   pnpm install"
echo "5. Run the app:"
echo "   pnpm dev"
echo ""
echo "📖 For detailed instructions, see ENV_SETUP_GUIDE.md"

