#!/bin/bash

# Script to set up ProductInventory table in LocalStack
# Make sure LocalStack is running: docker-compose -f docker-compose.local.yml up localstack

set -e

ENDPOINT_URL="http://localhost:4566"
REGION="ap-southeast-1"
TABLE_NAME="ProductInventory"

echo "🚀 Setting up DynamoDB table in LocalStack..."
echo "Endpoint: $ENDPOINT_URL"
echo "Region: $REGION"
echo "Table: $TABLE_NAME"
echo ""

# Check if LocalStack is running
if ! curl -s "$ENDPOINT_URL/_localstack/health" > /dev/null; then
  echo "❌ LocalStack is not running!"
  echo "   Start it with: docker-compose -f docker-compose.local.yml up localstack"
  exit 1
fi

echo "✅ LocalStack is running"
echo ""

# Create the table
echo "📦 Creating ProductInventory table..."

aws dynamodb create-table \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=product_id,AttributeType=S \
  --key-schema \
    AttributeName=product_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  2>/dev/null || echo "⚠️  Table might already exist (that's okay)"

echo ""
echo "✅ Table created successfully!"
echo ""
echo "📋 Verifying table..."
aws dynamodb describe-table \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --query 'Table.[TableName,TableStatus,KeySchema]' \
  --output table

echo ""
echo "✨ Setup complete!"
echo ""
echo "To test with your service, set this environment variable:"
echo "  DYNAMODB_ENDPOINT=$ENDPOINT_URL"
echo "  INVENTORY_TABLE_NAME=$TABLE_NAME"
echo "  AWS_REGION=$REGION"
echo ""
echo "Example test item:"
echo 'aws dynamodb put-item --endpoint-url http://localhost:4566 --region ap-southeast-1 --table-name ProductInventory --item '\''{"product_id":{"S":"1"},"product_name":{"S":"Test Product"},"product_slug":{"S":"test-product"},"quantity_l":{"N":"10"},"quantity_m":{"N":"15"},"quantity_s":{"N":"8"},"stock_threshold":{"N":"5"}}'\'''

