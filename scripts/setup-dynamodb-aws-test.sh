#!/bin/bash

# Script to set up ProductInventory-test table in AWS DynamoDB
# This is a safe test table that won't affect production data

set -e

REGION="ap-southeast-1"
TABLE_NAME="ProductInventory-test"

echo "🚀 Setting up DynamoDB TEST table in AWS..."
echo "Region: $REGION"
echo "Table: $TABLE_NAME"
echo ""
echo "ℹ️  This is a TEST table - safe to use for testing!"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "❌ AWS credentials not configured!"
  echo "   Run: aws configure"
  exit 1
fi

echo "✅ AWS credentials configured"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "   Account ID: $ACCOUNT_ID"
echo ""

# Create the table
echo "📦 Creating ProductInventory-test table..."

aws dynamodb create-table \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=product_id,AttributeType=S \
  --key-schema \
    AttributeName=product_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=MicroservicesEcommerce Key=Service,Value=Inventory Key=Environment,Value=Test \
  2>/dev/null || echo "⚠️  Table might already exist (that's okay)"

echo ""
echo "⏳ Waiting for table to be active..."
aws dynamodb wait table-exists \
  --region "$REGION" \
  --table-name "$TABLE_NAME"

echo ""
echo "✅ Test table created successfully!"
echo ""
echo "📋 Verifying table..."
aws dynamodb describe-table \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --query 'Table.[TableName,TableStatus,KeySchema,TableSizeBytes]' \
  --output table

echo ""
echo "✨ Setup complete!"
echo ""
echo "To use with your service, set these environment variables:"
echo "  INVENTORY_TABLE_NAME=$TABLE_NAME"
echo "  AWS_REGION=$REGION"
echo "  (Don't set DYNAMODB_ENDPOINT - use real AWS)"
echo ""
echo "Example test item:"
echo 'aws dynamodb put-item --region ap-southeast-1 --table-name ProductInventory-test --item '\''{"product_id":{"S":"1"},"product_name":{"S":"Test Product"},"product_slug":{"S":"test-product"},"quantity_l":{"N":"10"},"quantity_m":{"N":"15"},"quantity_s":{"N":"8"},"stock_threshold":{"N":"5"}}'\'''
echo ""
echo "💡 To clean up later (delete test table):"
echo "   aws dynamodb delete-table --region $REGION --table-name $TABLE_NAME"

