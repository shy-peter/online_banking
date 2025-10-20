#!/bin/bash

# Payment Methods Collection Setup Script for Appwrite CLI
# This script adds the payment-methods collection to your existing InvestFlow database

set -euo pipefail

# Load environment variables safely (supports values with spaces)
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
    echo "See .env.example for reference"
    exit 1
fi

echo "🚀 Adding Payment Methods Collection"
echo "Project: $PROJECT_ID"
echo "Database: $DATABASE_ID"
echo "=========================="

echo "🔧 Please ensure you're logged in to Appwrite CLI"
echo "If not logged in, run: appwrite login"

# Set the project context
echo "🔧 Setting project context..."
appwrite client --project-id $PROJECT_ID

# Only prompt when running in an interactive terminal
if [ -t 0 ]; then
	read -p "Press Enter when ready to continue..." _
else
	echo "(Non-interactive mode detected; continuing without prompt)"
fi

echo "💳 Creating Payment Methods collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --name "Payment Methods" \
  --document-security true

# Add attributes to Payment Methods collection
echo "Adding attributes to Payment Methods collection..."

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "type" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "name" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "accountNumber" \
  --size 255 \
  --required true

appwrite databases create-boolean-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "isDefault" \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "status" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "email" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "username" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "phoneNumber" \
  --size 50 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "address" \
  --size 500 \
  --required false

echo "🔗 Creating performance indexes..."
appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "userId-index" \
  --type "key" \
  --attributes "userId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "userId-isDefault-index" \
  --type "key" \
  --attributes userId --attributes isDefault

echo "🔐 Setting up permissions..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-methods" \
  --name "Payment Methods" \
  --permissions "read(\"any\")" \
  --permissions "create(\"any\")" \
  --permissions "update(\"any\")" \
  --permissions "delete(\"any\")"

echo ""
echo "🎉 Payment Methods collection setup completed successfully!"
echo ""
echo "✅ Created collection: payment-methods"
echo "✅ Added all required attributes"
echo "✅ Set up permissions and indexes"
echo ""
echo "🚀 Payment methods functionality is now ready!"
echo "   You can now add, edit, and manage payment methods in your app"
