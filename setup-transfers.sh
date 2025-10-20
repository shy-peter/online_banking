#!/bin/bash

# Setup transfers collection for InvestFlow
# This script creates the transfers collection with all necessary attributes and permissions

echo "Setting up transfers collection..."

# Create the transfers collection
appwrite databases create-collection \
  --database-id investflow-db \
  --collection-id transfers \
  --name "Transfers" \
  --document-security false

echo "Collection created successfully!"

# Add attributes
echo "Adding attributes..."

# fromUserId - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key fromUserId \
  --size 255 \
  --required true \
  --array false

# toUserId - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key toUserId \
  --size 255 \
  --required true \
  --array false

# fromUserEmail - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key fromUserEmail \
  --size 255 \
  --required true \
  --array false

# toUserEmail - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key toUserEmail \
  --size 255 \
  --required true \
  --array false

# fromUserName - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key fromUserName \
  --size 255 \
  --required true \
  --array false

# toUserName - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key toUserName \
  --size 255 \
  --required true \
  --array false

# amount - integer, required (stored in cents)
appwrite databases create-integer-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key amount \
  --required true \
  --min 1 \
  --max 999999999 \
  --array false

# status - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key status \
  --size 50 \
  --required true \
  --array false

# description - string, optional
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key description \
  --size 500 \
  --required false \
  --array false

# transferType - string, required
appwrite databases create-string-attribute \
  --database-id investflow-db \
  --collection-id transfers \
  --key transferType \
  --size 50 \
  --required true \
  --array false

echo "Attributes added successfully!"

# Add indexes
echo "Adding indexes..."

# Index on fromUserId for querying transfers from a user
appwrite databases create-index \
  --database-id investflow-db \
  --collection-id transfers \
  --key fromUserId \
  --type key \
  --attributes fromUserId

# Index on toUserId for querying transfers to a user
appwrite databases create-index \
  --database-id investflow-db \
  --collection-id transfers \
  --key toUserId \
  --type key \
  --attributes toUserId

# Index on status for filtering by status
appwrite databases create-index \
  --database-id investflow-db \
  --collection-id transfers \
  --key status \
  --type key \
  --attributes status

# Index on createdAt for ordering
appwrite databases create-index \
  --database-id investflow-db \
  --collection-id transfers \
  --key createdAt \
  --type key \
  --attributes createdAt

echo "Indexes added successfully!"

# Set permissions
echo "Setting permissions..."

# Read permission for any user (users can see their own transfers)
appwrite databases update-collection \
  --database-id investflow-db \
  --collection-id transfers \
  --permissions read

# Create permission for authenticated users
appwrite databases update-collection \
  --database-id investflow-db \
  --collection-id transfers \
  --permissions create

# Update permission for authenticated users
appwrite databases update-collection \
  --database-id investflow-db \
  --collection-id transfers \
  --permissions update

# Delete permission for authenticated users
appwrite databases update-collection \
  --database-id investflow-db \
  --collection-id transfers \
  --permissions delete

echo "Permissions set successfully!"
echo "Transfers collection setup completed!"
echo ""
echo "Users can now:"
echo "- Create transfers to other users"
echo "- View their transfer history"
echo "- Transfer funds using email or account number"
