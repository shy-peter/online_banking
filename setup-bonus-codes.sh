#!/bin/bash

# Setup Bonus Codes Collection
echo "Setting up Bonus Codes collection..."

# Create the collection
appwrite databases create-collection \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --name "Bonus Codes" \
  --document-security false

# Add attributes
echo "Adding attributes..."

# Code (string, required, unique)
appwrite databases create-string-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "code" \
  --size 50 \
  --required true

# Description (string, optional)
appwrite databases create-string-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "description" \
  --size 255 \
  --required false

# Daily Rate (float, required)
appwrite databases create-float-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "dailyRate" \
  --required true

# Monthly Rate (float, required)
appwrite databases create-float-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "monthlyRate" \
  --required true

# Is Active (boolean, required)
appwrite databases create-boolean-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "isActive" \
  --required true

# Usage Limit (integer, optional)
appwrite databases create-integer-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "usageLimit" \
  --required false

# Usage Count (integer, required)
appwrite databases create-integer-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "usageCount" \
  --required true

# Expiry Date (datetime, optional)
appwrite databases create-datetime-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "expiryDate" \
  --required false

# Created By (string, required)
appwrite databases create-string-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "createdBy" \
  --size 255 \
  --required true

# Created At (datetime, required)
appwrite databases create-datetime-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "createdAt" \
  --required true

# Updated At (datetime, required)
appwrite databases create-datetime-attribute \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "updatedAt" \
  --required true

# Add indexes
echo "Adding indexes..."

# Index on code for fast lookups
appwrite databases create-index \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "code_unique" \
  --type "unique" \
  --attributes "code"

# Index on isActive for filtering active codes
appwrite databases create-index \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --key "isActive" \
  --type "key" \
  --attributes "isActive"

# Set permissions
echo "Setting permissions..."

# Allow users to read active bonus codes
appwrite databases update-collection \
  --database-id "investflow-db" \
  --collection-id "bonus-codes" \
  --name "Bonus Codes" \
  --document-security false \
  --permissions "read(\"any\")" \
  --permissions "create(\"users\")" \
  --permissions "update(\"users\")" \
  --permissions "delete(\"users\")"

echo "Bonus Codes collection setup complete!"
