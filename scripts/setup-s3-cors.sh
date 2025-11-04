#!/bin/bash

# Setup CORS for S3 bucket to allow browser uploads

BUCKET_NAME="is458-products-img"

echo "Setting up CORS configuration for bucket: $BUCKET_NAME"

# Create CORS configuration
cat > /tmp/cors-config.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3003",
        "http://localhost:3000",
        "http://localhost:3001"
      ],
      "ExposeHeaders": ["ETag", "x-amz-request-id"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration file:///tmp/cors-config.json \
  --region ap-southeast-1

if [ $? -eq 0 ]; then
  echo "✅ CORS configuration applied successfully!"
  echo ""
  echo "Verifying CORS configuration..."
  aws s3api get-bucket-cors --bucket "$BUCKET_NAME" --region ap-southeast-1
else
  echo "❌ Failed to apply CORS configuration"
  exit 1
fi

# Clean up
rm /tmp/cors-config.json

