#!/bin/bash

# Update Users Collection Script
# This script adds new attributes to the users collection for enhanced signup features

set -euo pipefail

# Load environment variables safely
if [ -f .env ]; then
	set -a
	source .env
	set +a
fi

# Check if required environment variables are set
if [ -z "${APPWRITE_PROJECT_ID:-}" ]; then
	echo "❌ Error: APPWRITE_PROJECT_ID is not set in .env file"
	exit 1
fi

if [ -z "${APPWRITE_ENDPOINT:-}" ]; then
	echo "❌ Error: APPWRITE_ENDPOINT is not set in .env file"
	exit 1
fi

PROJECT_ID="$APPWRITE_PROJECT_ID"
COLLECTION_ID="users"

echo "🚀 Updating Users Collection with new attributes..."
echo "Project ID: $PROJECT_ID"
echo "Collection ID: $COLLECTION_ID"

# Add profilePicture attribute
echo "📸 Adding profilePicture attribute..."
appwrite databases create-string-attribute \
	--database-id "investflow-db" \
	--collection-id "$COLLECTION_ID" \
	--key "profilePicture" \
	--size 255 \
	--required false

# Add secretPhrase attribute
echo "🔐 Adding secretPhrase attribute..."
appwrite databases create-string-attribute \
	--database-id "investflow-db" \
	--collection-id "$COLLECTION_ID" \
	--key "secretPhrase" \
	--size 10 \
	--required false

# Add documents attribute (JSON object)
echo "📄 Adding documents attribute..."
appwrite databases create-string-attribute \
	--database-id "investflow-db" \
	--collection-id "$COLLECTION_ID" \
	--key "documents" \
	--size 2000 \
	--required false

# Add personalInfo attribute (JSON object)
echo "👤 Adding personalInfo attribute..."
appwrite databases create-string-attribute \
	--database-id "investflow-db" \
	--collection-id "$COLLECTION_ID" \
	--key "personalInfo" \
	--size 2000 \
	--required false

echo ""
echo "🎉 Users collection updated successfully!"
echo ""
echo "📋 New Attributes Added:"
echo "   - profilePicture: String (255 chars, optional)"
echo "   - secretPhrase: String (10 chars, optional)"
echo "   - documents: String (2000 chars, optional) - JSON object"
echo "   - personalInfo: String (2000 chars, optional) - JSON object"
echo ""
echo "💡 Next steps:"
echo "   1. Test profile picture upload functionality"
echo "   2. Test enhanced signup with documents"
echo "   3. Test secret phrase functionality"
echo ""
