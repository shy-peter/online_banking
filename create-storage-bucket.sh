#!/bin/bash

# Create Storage Bucket Script
# This script creates the necessary storage bucket for file uploads

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
BUCKET_ID="files"

echo "🚀 Creating storage bucket for file uploads..."
echo "Project ID: $PROJECT_ID"
echo "Bucket ID: $BUCKET_ID"

# Create the files bucket
echo "📁 Creating files bucket..."

appwrite storage create-bucket \
	--bucket-id "$BUCKET_ID" \
	--name "Files" \
	--file-security true \
	--allowed-file-extensions jpg,jpeg,png,gif,webp,pdf,doc,docx,txt \
	--maximum-file-size 10485760 \
	--encryption false \
	--antivirus false

echo "✅ Files bucket created successfully!"

# Set bucket permissions
echo "🔐 Setting bucket permissions..."

appwrite storage update-bucket \
	--bucket-id "$BUCKET_ID" \
	--name "Files" \
	--file-security true \
	--allowed-file-extensions jpg,jpeg,png,gif,webp,pdf,doc,docx,txt \
	--maximum-file-size 10485760 \
	--encryption false \
	--antivirus false \
	--permissions "read(\"any\")" \
	--permissions "create(\"any\")" \
	--permissions "update(\"any\")" \
	--permissions "delete(\"any\")"

echo "✅ Bucket permissions set successfully!"

echo ""
echo "🎉 Storage bucket setup completed!"
echo ""
echo "📋 Bucket Details:"
echo "   - Bucket ID: $BUCKET_ID"
echo "   - Name: Files"
echo "   - File Security: Enabled"
echo "   - Max File Size: 10MB"
echo "   - Allowed Extensions: jpg, jpeg, png, gif, webp, pdf, doc, docx, txt"
echo "   - Permissions: Full access for all users"
echo ""
echo "💡 Next steps:"
echo "   1. Test file upload functionality"
echo "   2. Update signup form with ID type selection"
echo "   3. Test document upload for different ID types"
echo ""
