#!/bin/bash

# InvestFlow Database Setup Script for Appwrite CLI v10.0.0
# This script creates the complete database structure for InvestFlow

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

echo "🚀 InvestFlow Database Setup"
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

echo "📊 Creating database: InvestFlow Database"
appwrite databases create \
  --database-id $DATABASE_ID \
  --name "InvestFlow Database"

echo "✅ Database created"

echo "👥 Creating Users collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --name "Users" \
  --document-security true

# Add attributes to Users collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "name" \
  --size 255 \
  --required true

appwrite databases create-email-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "email" \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "phone" \
  --size 20 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "accountNumber" \
  --size 20 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "totalBalance" \
  --required true \
  --min 0

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "availableBalance" \
  --required true \
  --min 0

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "status" \
  --size 50 \
  --required true

appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "createdAt" \
  --required true

echo "💼 Creating Investments collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --name "Investments" \
  --document-security true

# Add attributes to Investments collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "amount" \
  --required true \
  --min 1

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "plan" \
  --size 100 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "status" \
  --size 50 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "interestRate" \
  --required true \
  --min 0

appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "startDate" \
  --required true

appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "endDate" \
  --required true

appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "createdAt" \
  --required true

echo "🧾 Creating Transactions collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --name "Transactions" \
  --document-security true

# Add attributes to Transactions collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "type" \
  --size 50 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "amount" \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "description" \
  --size 500 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "status" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "reference" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "investmentId" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "paymentMethod" \
  --size 100 \
  --required false

echo "🔔 Creating Notifications collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --name "Notifications" \
  --document-security true

# Add attributes to Notifications collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "type" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "title" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "message" \
  --size 1000 \
  --required true

appwrite databases create-boolean-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "isRead" \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "transactionId" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "investmentId" \
  --size 255 \
  --required false

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "priority" \
  --size 20 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "actionUrl" \
  --size 500 \
  --required false

appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "createdAt" \
  --required true

echo "💰 Creating Interest Payments collection..."
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --name "Interest Payments" \
  --document-security true

# Add attributes to Interest Payments collection
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "userId" \
  --size 255 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "investmentId" \
  --size 255 \
  --required true

appwrite databases create-integer-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "amount" \
  --required true \
  --min 1

appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "paymentDate" \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "status" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "transactionId" \
  --size 255 \
  --required false

echo "🔗 Creating performance indexes..."
appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "accountNumber-index" \
  --type "key" \
  --attributes "accountNumber"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "userId-index" \
  --type "key" \
  --attributes "userId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "userId-index" \
  --type "key" \
  --attributes "userId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "userId-type-index" \
  --type "key" \
  --attributes userId --attributes type


appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "userId-index" \
  --type "key" \
  --attributes "userId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "userId-index" \
  --type "key" \
  --attributes "userId"

appwrite databases create-index \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "userId-isRead-index" \
  --type "key" \
  --attributes userId --attributes isRead

echo "🔐 Setting up permissions..."

echo "Setting permissions for users..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "users" \
  --name "Users" \
  --permissions '["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"]'


echo "Setting permissions for investments..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "investments" \
  --name "Investments" \
  --permissions '["read(\"any\")", "create(\"any\")", "update(\"any\")"]'


echo "Setting permissions for transactions..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "transactions" \
  --name "Transactions" \
  --permissions '["read(\"any\")", "create(\"any\")", "update(\"any\")"]'


echo "Setting permissions for interest-payments..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "interest-payments" \
  --name "Interest Payments" \
  --permissions '["read(\"any\")", "create(\"any\")", "update(\"any\")"]'

echo "Setting permissions for notifications..."
appwrite databases update-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "notifications" \
  --name "Notifications" \
  --permissions '["read(\"any\")", "create(\"any\")", "update(\"any\")", "delete(\"any\")"]'



echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "✅ Created collections:"
echo "   - users (with accountNumber field)"
echo "   - investments"
echo "   - transactions"
echo "   - notifications"
echo "   - interest-payments"
echo ""
echo "✅ Set up permissions and indexes"
echo ""
echo "🚀 Your InvestFlow app is ready!"
echo "   Run: npm run dev"