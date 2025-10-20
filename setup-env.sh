#!/bin/bash

echo "Setting up environment variables for Payment Method Types..."
echo ""
echo "Please enter your Appwrite project details:"
echo ""

read -p "Enter your DATABASE_ID: " DATABASE_ID
read -p "Enter your PROJECT_ID: " PROJECT_ID
read -p "Enter your API_ENDPOINT (e.g., https://fra.cloud.appwrite.io/v1): " API_ENDPOINT

echo ""
echo "Creating .env file..."

cat > .env << EOF
DATABASE_ID=$DATABASE_ID
PROJECT_ID=$PROJECT_ID
API_ENDPOINT=$API_ENDPOINT
EOF

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "You can now run:"
echo "  chmod +x setup-payment-method-types.sh"
echo "  ./setup-payment-method-types.sh"
echo ""
