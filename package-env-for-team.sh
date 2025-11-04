#!/bin/bash

# Package .env files for teammates
# This creates an encrypted zip with all environment files

echo "📦 Packaging environment files for teammates..."
echo ""

# Check if all .env files exist
missing_files=()

files=(
  "apps/product-service/.env"
  "apps/order-service/.env"
  "apps/payment-service/.env"
  "apps/auth-service/.env"
  "apps/email-service/.env"
  "apps/client/.env.local"
  "apps/admin/.env.local"
  # Note: kafka/.env not needed - KAFKA_BROKERS is in each service's .env
)

for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
  fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
  echo "❌ Missing files:"
  for file in "${missing_files[@]}"; do
    echo "   - $file"
  done
  echo ""
  echo "Please create these files first."
  exit 1
fi

# Create encrypted zip
echo "Creating encrypted zip file..."
echo "You will be prompted to enter a password."
echo ""

zip -e -r team-env-files.zip \
  apps/product-service/.env \
  apps/order-service/.env \
  apps/payment-service/.env \
  apps/auth-service/.env \
  apps/email-service/.env \
  apps/client/.env.local \
  apps/admin/.env.local \
  ENV_SETUP_GUIDE.md \
  ENV_TEMPLATES.txt \
  setup-env-files.sh 2>/dev/null

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Package created: team-env-files.zip"
  echo ""
  echo "📤 Next steps:"
  echo "1. Upload team-env-files.zip to Google Drive / Dropbox"
  echo "2. Share the password via Telegram secret chat (separately!)"
  echo "3. Tell teammates to:"
  echo "   - Download the zip"
  echo "   - Extract with password"
  echo "   - Run ./setup-env-files.sh (if needed)"
  echo ""
  echo "🔒 Security tips:"
  echo "   - Use a strong password"
  echo "   - Share password separately from the zip file"
  echo "   - Delete the zip after everyone has it"
else
  echo "❌ Failed to create package"
  exit 1
fi

