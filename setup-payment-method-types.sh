#!/bin/bash

# Setup Payment Method Types collection
echo "Setting up Payment Method Types collection..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check if required environment variables are set
if [ -z "$DATABASE_ID" ]; then
    echo "❌ Error: DATABASE_ID environment variable is not set"
    echo "Please set DATABASE_ID in your .env file or environment"
    exit 1
fi

echo "📊 Creating Payment Method Types collection..."

# Create the collection
appwrite databases create-collection \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --name "Payment Method Types" \
  --permissions "read(\"any\")" \
  --permissions "create(\"any\")" \
  --permissions "update(\"any\")" \
  --permissions "delete(\"any\")"

echo "🔧 Adding collection attributes..."

# Add attributes
appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "type" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "name" \
  --size 100 \
  --required true

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "description" \
  --size 500 \
  --required false

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "icon" \
  --size 50 \
  --required false

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "category" \
  --size 50 \
  --required true

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "requiredFields" \
  --size 1000 \
  --required false

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "optionalFields" \
  --size 1000 \
  --required false

appwrite databases create-boolean-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "isActive" \
  --required true

appwrite databases create-integer-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "sortOrder" \
  --required true

appwrite databases create-string-attribute \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "qrCodeUrl" \
  --size 500 \
  --required false

echo "🔗 Creating performance indexes..."
appwrite databases create-index \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "type-index" \
  --type "unique" \
  --attributes "type"

appwrite databases create-index \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "category-index" \
  --type "key" \
  --attributes "category"

appwrite databases create-index \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "isActive-index" \
  --type "key" \
  --attributes "isActive"

appwrite databases create-index \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --key "sortOrder-index" \
  --type "key" \
  --attributes "sortOrder"

echo "📝 Adding default payment method types..."

# Add default payment method types
appwrite databases create-document \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --document-id "paypal" \
  --data '{
    "type": "paypal",
    "name": "PayPal",
    "description": "PayPal digital wallet and payment system",
    "icon": "CreditCard",
    "category": "digital_wallet",
    "requiredFields": "[\"email\"]",
    "optionalFields": "[\"username\", \"phoneNumber\"]",
    "isActive": true,
    "sortOrder": 1
  }'

appwrite databases create-document \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --document-id "venmo" \
  --data '{
    "type": "venmo",
    "name": "Venmo",
    "description": "Venmo mobile payment service",
    "icon": "Smartphone",
    "category": "mobile_payment",
    "requiredFields": "[\"username\", \"phoneNumber\"]",
    "optionalFields": "[\"email\"]",
    "isActive": true,
    "sortOrder": 2
  }'

appwrite databases create-document \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --document-id "cashapp" \
  --data '{
    "type": "cashapp",
    "name": "Cash App",
    "description": "Cash App mobile payment service",
    "icon": "Smartphone",
    "category": "mobile_payment",
    "requiredFields": "[\"username\", \"phoneNumber\"]",
    "optionalFields": "[\"email\"]",
    "isActive": true,
    "sortOrder": 3
  }'

appwrite databases create-document \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --document-id "usdt" \
  --data '{
    "type": "usdt",
    "name": "USDT (Tether)",
    "description": "USDT cryptocurrency wallet",
    "icon": "DollarSign",
    "category": "cryptocurrency",
    "requiredFields": "[\"address\"]",
    "optionalFields": "[\"name\"]",
    "isActive": true,
    "sortOrder": 4
  }'

appwrite databases create-document \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --document-id "ethereum" \
  --data '{
    "type": "ethereum",
    "name": "Ethereum",
    "description": "Ethereum cryptocurrency wallet",
    "icon": "DollarSign",
    "category": "cryptocurrency",
    "requiredFields": "[\"address\"]",
    "optionalFields": "[\"name\"]",
    "isActive": true,
    "sortOrder": 5
  }'

appwrite databases create-document \
  --database-id "$DATABASE_ID" \
  --collection-id "payment-method-types" \
  --document-id "bitcoin" \
  --data '{
    "type": "bitcoin",
    "name": "Bitcoin",
    "description": "Bitcoin cryptocurrency wallet",
    "icon": "DollarSign",
    "category": "cryptocurrency",
    "requiredFields": "[\"address\"]",
    "optionalFields": "[\"name\"]",
    "isActive": true,
    "sortOrder": 6
  }'

echo ""
echo "🎉 Payment Method Types collection setup completed successfully!"
echo ""
echo "✅ Created collection: payment-method-types"
echo "✅ Added all required attributes"
echo "✅ Set up permissions and indexes"
echo "✅ Added default payment method types"
echo ""
echo "Default types added:"
echo "- PayPal (Digital Wallet)"
echo "- Venmo (Mobile Payment)"
echo "- Cash App (Mobile Payment)"
echo "- USDT (Cryptocurrency)"
echo "- Ethereum (Cryptocurrency)"
echo "- Bitcoin (Cryptocurrency)"
