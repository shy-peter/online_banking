#!/bin/bash

# =============================================================================
# InvestFlow - Complete Setup Script
# =============================================================================
# This script sets up the entire InvestFlow application including:
# - Database collections and attributes
# - Storage buckets
# - Permissions and indexes
# - Payment method types
# - QR code storage
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Appwrite CLI is installed
check_appwrite_cli() {
    if ! command -v appwrite &> /dev/null; then
        print_error "Appwrite CLI is not installed!"
        print_status "Please install it from: https://appwrite.io/docs/command-line"
        exit 1
    fi
    print_success "Appwrite CLI is installed"
}

# Function to check if user is logged in
check_appwrite_login() {
    if ! appwrite account get &> /dev/null; then
        print_error "You are not logged in to Appwrite!"
        print_status "Please run: appwrite login"
        exit 1
    fi
    print_success "Logged in to Appwrite"
}

# Function to load environment variables
load_env() {
    if [ -f .env ]; then
            export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
        print_success "Environment variables loaded from .env"
    else
        print_warning ".env file not found. Using default values."
        export DATABASE_ID="investflow-db"
        export PROJECT_ID="68d9353a00112ca03052"
    fi
}

# Function to create database if it doesn't exist
create_database() {
    print_status "Setting up database..."
    
    # Check if database exists
    if appwrite databases get --database-id "$DATABASE_ID" &> /dev/null; then
        print_success "Database '$DATABASE_ID' already exists"
    else
        print_status "Creating database '$DATABASE_ID'..."
        appwrite databases create --database-id "$DATABASE_ID" --name "InvestFlow Database"
        print_success "Database created successfully"
    fi
}

# Function to create users collection
create_users_collection() {
    print_status "Setting up users collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "users" &> /dev/null; then
        print_success "Users collection already exists"
    else
        print_status "Creating users collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "users" \
            --name "Users" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "name" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "email" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "phone" --size 20 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "accountNumber" --size 20 --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "totalBalance" --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "availableBalance" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "status" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "secretPhrase" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "documents" --size 2000 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "personalInfo" --size 2000 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "users" --key "preferences" --size 1000 --required false
        
        print_success "Users collection created with all attributes"
    fi
}

# Function to create investments collection
create_investments_collection() {
    print_status "Setting up investments collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "investments" &> /dev/null; then
        print_success "Investments collection already exists"
    else
        print_status "Creating investments collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "investments" \
            --name "Investments" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "userId" --size 255 --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "amount" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "plan" --size 50 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "status" --size 20 --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "interestRate" --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "startDate" --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "endDate" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "bonusCodeId" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "bonusCode" --size 50 --required false
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "dailyRate" --required false
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "investments" --key "monthlyRate" --required false
        
        print_success "Investments collection created with all attributes"
    fi
}

# Function to create transactions collection
create_transactions_collection() {
    print_status "Setting up transactions collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "transactions" &> /dev/null; then
        print_success "Transactions collection already exists"
    else
        print_status "Creating transactions collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "transactions" \
            --name "Transactions" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "userId" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "type" --size 50 --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "amount" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "description" --size 500 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "status" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "reference" --size 100 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "investmentId" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transactions" --key "paymentMethod" --size 100 --required false
        
        print_success "Transactions collection created with all attributes"
    fi
}

# Function to create payment methods collection
create_payment_methods_collection() {
    print_status "Setting up payment methods collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "payment-methods" &> /dev/null; then
        print_success "Payment methods collection already exists"
    else
        print_status "Creating payment methods collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "payment-methods" \
            --name "Payment Methods" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "userId" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "type" --size 50 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "name" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "accountNumber" --size 255 --required true
        appwrite databases create-boolean-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "isDefault" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "status" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "email" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "username" --size 100 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "phoneNumber" --size 20 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-methods" --key "address" --size 500 --required false
        
        print_success "Payment methods collection created with all attributes"
    fi
}

# Function to create payment method types collection
create_payment_method_types_collection() {
    print_status "Setting up payment method types collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "payment-method-types" &> /dev/null; then
        print_success "Payment method types collection already exists"
    else
        print_status "Creating payment method types collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "payment-method-types" \
            --name "Payment Method Types" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "type" --size 50 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "name" --size 100 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "description" --size 500 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "icon" --size 50 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "category" --size 50 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "requiredFields" --size 1000 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "optionalFields" --size 1000 --required false
        appwrite databases create-boolean-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "isActive" --required true
        appwrite databases create-integer-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "sortOrder" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "qrCodeUrl" --size 500 --required false
        
        # Create indexes
        appwrite databases create-index --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "type-index" --type "unique" --attributes "type"
        appwrite databases create-index --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "category-index" --type "key" --attributes "category"
        appwrite databases create-index --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "isActive-index" --type "key" --attributes "isActive"
        appwrite databases create-index --database-id "$DATABASE_ID" --collection-id "payment-method-types" --key "sortOrder-index" --type "key" --attributes "sortOrder"
        
        print_success "Payment method types collection created with all attributes and indexes"
    fi
}

# Function to create notifications collection
create_notifications_collection() {
    print_status "Setting up notifications collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "notifications" &> /dev/null; then
        print_success "Notifications collection already exists"
    else
        print_status "Creating notifications collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "notifications" \
            --name "Notifications" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "userId" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "type" --size 50 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "title" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "message" --size 1000 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "priority" --size 20 --required true
        appwrite databases create-boolean-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "isRead" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "transactionId" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "investmentId" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "notifications" --key "actionUrl" --size 500 --required false
        
        print_success "Notifications collection created with all attributes"
    fi
}

# Function to create bonus codes collection
create_bonus_codes_collection() {
    print_status "Setting up bonus codes collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "bonus-codes" &> /dev/null; then
        print_success "Bonus codes collection already exists"
    else
        print_status "Creating bonus codes collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "bonus-codes" \
            --name "Bonus Codes" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "code" --size 50 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "description" --size 500 --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "dailyRate" --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "monthlyRate" --required true
        appwrite databases create-integer-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "usageCount" --required true
        appwrite databases create-integer-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "maxUsage" --required true
        appwrite databases create-boolean-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "isActive" --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "bonus-codes" --key "expiresAt" --required false
        
        print_success "Bonus codes collection created with all attributes"
    fi
}

# Function to create transfers collection
create_transfers_collection() {
    print_status "Setting up transfers collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "transfers" &> /dev/null; then
        print_success "Transfers collection already exists"
    else
        print_status "Creating transfers collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "transfers" \
            --name "Transfers" \
            --permissions "read(\"any\")" \
            --permissions "create(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transfers" --key "senderId" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transfers" --key "recipientId" --size 255 --required true
        appwrite databases create-double-attribute --database-id "$DATABASE_ID" --collection-id "transfers" --key "amount" --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transfers" --key "status" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transfers" --key "reference" --size 100 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "transfers" --key "notes" --size 500 --required false
        
        print_success "Transfers collection created with all attributes"
    fi
}

# Function to create storage bucket
create_storage_bucket() {
    print_status "Setting up storage bucket..."
    
    if appwrite storage get-bucket --bucket-id "files" &> /dev/null; then
        print_success "Storage bucket 'files' already exists"
        
        # Update bucket permissions to ensure it works
        print_status "Updating bucket permissions..."
        appwrite storage update-bucket \
            --bucket-id "files" \
            --name "Files" \
            --permissions "create(\"any\")" \
            --permissions "read(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")" \
            --allowed-file-extensions "jpg" \
            --allowed-file-extensions "jpeg" \
            --allowed-file-extensions "png" \
            --allowed-file-extensions "gif" \
            --allowed-file-extensions "webp"
        
        print_success "Storage bucket permissions updated"
    else
        print_status "Creating storage bucket 'files'..."
        appwrite storage create-bucket \
            --bucket-id "files" \
            --name "Files" \
            --permissions "create(\"any\")" \
            --permissions "read(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")" \
            --allowed-file-extensions "jpg" \
            --allowed-file-extensions "jpeg" \
            --allowed-file-extensions "png" \
            --allowed-file-extensions "gif" \
            --allowed-file-extensions "webp"
        
        print_success "Storage bucket created successfully"
    fi
}

# Function to add default payment method types
add_default_payment_method_types() {
    print_status "Adding default payment method types..."
    
    # PayPal
    if ! appwrite databases get-document --database-id "$DATABASE_ID" --collection-id "payment-method-types" --document-id "paypal" &> /dev/null; then
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
        print_success "Added PayPal payment method type"
    fi
    
    # Venmo
    if ! appwrite databases get-document --database-id "$DATABASE_ID" --collection-id "payment-method-types" --document-id "venmo" &> /dev/null; then
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
        print_success "Added Venmo payment method type"
    fi
    
    # Cash App
    if ! appwrite databases get-document --database-id "$DATABASE_ID" --collection-id "payment-method-types" --document-id "cashapp" &> /dev/null; then
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
        print_success "Added Cash App payment method type"
    fi
    
    # USDT
    if ! appwrite databases get-document --database-id "$DATABASE_ID" --collection-id "payment-method-types" --document-id "usdt" &> /dev/null; then
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
        print_success "Added USDT payment method type"
    fi
    
    # Ethereum
    if ! appwrite databases get-document --database-id "$DATABASE_ID" --collection-id "payment-method-types" --document-id "ethereum" &> /dev/null; then
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
        print_success "Added Ethereum payment method type"
    fi
    
    # Bitcoin
    if ! appwrite databases get-document --database-id "$DATABASE_ID" --collection-id "payment-method-types" --document-id "bitcoin" &> /dev/null; then
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
        print_success "Added Bitcoin payment method type"
    fi
}

# Main setup function
main() {
    echo "============================================================================="
    echo "                    InvestFlow - Complete Setup Script"
    echo "============================================================================="
    echo ""
    
    # Pre-flight checks
    check_appwrite_cli
    check_appwrite_login
    load_env
    
    echo ""
    print_status "Starting InvestFlow setup..."
    echo ""
    
    # Create database and collections
    create_database
    create_users_collection
    create_investments_collection
    create_transactions_collection
    create_payment_methods_collection
    create_payment_method_types_collection
    create_notifications_collection
    create_bonus_codes_collection
    create_transfers_collection
    
    # Setup storage
    create_storage_bucket
    
    # Add default data
    add_default_payment_method_types
    
    echo ""
    echo "============================================================================="
    print_success "InvestFlow setup completed successfully!"
    echo "============================================================================="
    echo ""
    print_status "Your InvestFlow application is now ready to use!"
    print_status "Database ID: $DATABASE_ID"
    print_status "Project ID: $PROJECT_ID"
    echo ""
    print_status "Next steps:"
    print_status "1. Start your development server: npm run dev"
    print_status "2. Visit your application in the browser"
    print_status "3. Create your first user account"
    echo ""
}

# Run main function
main "$@"