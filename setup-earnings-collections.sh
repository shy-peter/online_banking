#!/bin/bash

# InvestFlow Earnings Collections Setup Script
# This script adds the necessary collections for earnings tracking

set -euo pipefail

# Load environment variables safely
if [ -f .env ]; then
	set -a
	. ./.env
	set +a
fi

PROJECT_ID="${VITE_APPWRITE_PROJECT_ID}"
DATABASE_ID="${VITE_APPWRITE_DATABASE_ID:-investflow-db}"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: VITE_APPWRITE_PROJECT_ID not found in .env file"
    echo "Please create a .env file with your Appwrite project configuration"
    exit 1
fi

echo "🚀 InvestFlow Earnings Collections Setup"
echo "Project: $PROJECT_ID"
echo "Database: $DATABASE_ID"
echo "========================================"

# Set the project context
echo "🔧 Setting project context..."
appwrite client --project-id $PROJECT_ID

echo "📊 Creating Daily Earnings collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --name "Daily Earnings" \
  --document-security true

# Add attributes to Daily Earnings collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "investmentId" \
  --size 255 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "amount" \
  --required true \
  --min 0

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "date" \
  --size 10 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "status" \
  --size 20 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "type" \
  --size 20 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "adminId" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "notes" \
  --size 500 \
  --required false

echo "💰 Creating Earnings Adjustments collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --name "Earnings Adjustments" \
  --document-security true

# Add attributes to Earnings Adjustments collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "amount" \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "type" \
  --size 20 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "reason" \
  --size 1000 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "adminId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "status" \
  --size 20 \
  --required true

echo "🔍 Creating indexes for Daily Earnings..."
appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "userId-date-index" \
  --type "key" \
  --attributes "userId" --attributes "date"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "investmentId-date-index" \
  --type "key" \
  --attributes "investmentId" --attributes "date"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "daily-earnings" \
  --key "date-status-index" \
  --type "key" \
  --attributes "date" --attributes "status"

echo "🔍 Creating indexes for Earnings Adjustments..."
appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "userId-index" \
  --type "key" \
  --attributes "userId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "adminId-index" \
  --type "key" \
  --attributes "adminId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "earnings-adjustments" \
  --key "status-index" \
  --type "key" \
  --attributes "status"

echo "🔐 Setting up permissions..."

echo "Setting permissions for daily-earnings..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "daily-earnings" \
  --name "Daily Earnings" \
  --permissions "read(\"any\")" \
  --permissions "create(\"any\")" \
  --permissions "update(\"any\")" \
  --permissions "delete(\"any\")"

echo "Setting permissions for earnings-adjustments..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "earnings-adjustments" \
  --name "Earnings Adjustments" \
  --permissions "read(\"any\")" \
  --permissions "create(\"any\")" \
  --permissions "update(\"any\")" \
  --permissions "delete(\"any\")"

echo ""
echo "🎉 Earnings collections setup completed successfully!"
echo ""
echo "✅ Created collections:"
echo "   - daily-earnings (tracks daily earnings for each investment)"
echo "   - earnings-adjustments (tracks manual admin adjustments)"
echo ""
echo "✅ Set up permissions and indexes"
echo ""
echo "🚀 Your InvestFlow earnings system is ready!"
echo "   - Daily earnings will be processed automatically"
echo "   - Admins can manually adjust earnings"
echo "   - All earnings are tracked and auditable"
