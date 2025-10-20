#!/bin/bash

# Add updatedAt attribute to Payment Methods collection
# This script adds the missing updatedAt attribute to track when payment methods are modified

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

echo "🚀 Adding updatedAt attribute to Payment Methods collection"
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

echo "📅 Adding updatedAt attribute to payment-methods collection..."
appwrite databases create-datetime-attribute \
  --database-id $DATABASE_ID \
  --collection-id "payment-methods" \
  --key "updatedAt" \
  --required false

echo ""
echo "🎉 updatedAt attribute added successfully!"
echo ""
echo "✅ Payment methods collection now has updatedAt tracking"
echo "✅ You can now approve/reject payment methods without errors"
echo ""
echo "🚀 The admin payment method verification system is now fully functional!"
