#!/bin/bash

# Fix permissions for transfers collection
# This script updates the permissions to allow users to create, read, update, and delete transfers

echo "Fixing permissions for transfers collection..."

# Update collection permissions
appwrite databases update-collection \
  --database-id investflow-db \
  --collection-id transfers \
  --permissions read \
  --permissions create \
  --permissions update \
  --permissions delete

echo "Permissions updated successfully!"
echo "Users can now create, read, update, and delete transfers."
