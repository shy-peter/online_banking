#!/bin/bash

# Add Missing Attributes Script for InvestFlow
# This script adds missing attributes to existing collections

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

echo "🔧 Adding Missing Attributes to InvestFlow Database"
echo "Project: $PROJECT_ID"
echo "Database: $DATABASE_ID"
echo "=========================="

# Set the project context
echo "🔧 Setting project context..."
appwrite client --project-id $PROJECT_ID

# Only prompt when running in an interactive terminal
if [ -t 0 ]; then
	read -p "Press Enter when ready to continue..." _
else
	echo "(Non-interactive mode detected; continuing without prompt)"
fi

echo "📝 Adding missing attributes to existing collections..."

# Add paymentMethod to transactions collection (if not exists)
echo "Adding paymentMethod to transactions collection..."
appwrite databases create-string-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "paymentMethod" \
  --size 100 \
  --required false || echo "paymentMethod attribute may already exist"

# Add updatedAt to transactions collection (if not exists)
echo "Adding updatedAt to transactions collection..."
appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --key "updatedAt" \
  --required false || echo "updatedAt attribute may already exist"

# Add updatedAt to investments collection (if not exists)
echo "Adding updatedAt to investments collection..."
appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "investments" \
  --key "updatedAt" \
  --required false || echo "updatedAt attribute may already exist"

# Add updatedAt to users collection (if not exists)
echo "Adding updatedAt to users collection..."
appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "users" \
  --key "updatedAt" \
  --required false || echo "updatedAt attribute may already exist"

# Add updatedAt to notifications collection (if not exists)
echo "Adding updatedAt to notifications collection..."
appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --key "updatedAt" \
  --required false || echo "updatedAt attribute may already exist"

# Add updatedAt to interest-payments collection (if not exists)
echo "Adding updatedAt to interest-payments collection..."
appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "interest-payments" \
  --key "updatedAt" \
  --required false || echo "updatedAt attribute may already exist"

echo ""
echo "🎉 Missing attributes added successfully!"
echo ""
echo "✅ Added attributes:"
echo "   - paymentMethod to transactions"
echo "   - updatedAt to all collections"
echo ""
echo "🚀 Your InvestFlow app should now work without attribute errors!"
echo "   Run: npm run dev"
