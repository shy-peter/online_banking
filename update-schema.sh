#!/bin/bash

echo "🚀 Updating Appwrite Users Collection Schema"
echo "============================================="

# Database and Collection IDs
DATABASE_ID="investflow-db"
COLLECTION_ID="users"

echo "Adding secretPhrase attribute..."
appwrite databases create-string-attribute \
    --database-id="$DATABASE_ID" \
    --collection-id="$COLLECTION_ID" \
    --key="secretPhrase" \
    --size=255 \
    --required=false \
    --array=false

echo "Adding documents attribute..."
appwrite databases create-string-attribute \
    --database-id="$DATABASE_ID" \
    --collection-id="$COLLECTION_ID" \
    --key="documents" \
    --size=10000 \
    --required=false \
    --array=false

echo "Adding personalInfo attribute..."
appwrite databases create-string-attribute \
    --database-id="$DATABASE_ID" \
    --collection-id="$COLLECTION_ID" \
    --key="personalInfo" \
    --size=10000 \
    --required=false \
    --array=false

echo "Adding isVerified attribute..."
appwrite databases create-boolean-attribute \
    --database-id="$DATABASE_ID" \
    --collection-id="$COLLECTION_ID" \
    --key="isVerified" \
    --required=false \
    --array=false

echo "Adding verificationStatus attribute..."
appwrite databases create-string-attribute \
    --database-id="$DATABASE_ID" \
    --collection-id="$COLLECTION_ID" \
    --key="verificationStatus" \
    --size=50 \
    --required=false \
    --array=false

echo ""
echo "✅ Schema update completed!"
echo "You can now update your AuthContext.tsx to use these fields:"
echo "- secretPhrase (string)"
echo "- documents (object as JSON string)"
echo "- personalInfo (object as JSON string)"
echo "- isVerified (boolean)"
echo "- verificationStatus (string)"
