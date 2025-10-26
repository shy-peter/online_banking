#!/bin/bash

# =============================================================================
# InvestFlow - Referrals Setup Script
# =============================================================================
# This script sets up the referrals collection including:
# - Collection creation with proper permissions
# - Required attributes for referral tracking
# - Indexes for efficient querying
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
        export DATABASE_ID="main"
    fi
}

# Function to create referrals collection
create_referrals_collection() {
    print_status "Setting up referrals collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "referrals" &> /dev/null; then
        print_success "Referrals collection already exists"
    else
        print_status "Creating referrals collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "referrals" \
            --name "Referrals" \
            --permissions "create(\"users\")" \
            --permissions "read(\"users\")" \
            --permissions "update(\"users\")" \
            --permissions "delete(\"users\")" \
            --document-security true
        
        # Add attributes
        print_status "Adding collection attributes..."
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "referrals" --key "referrerId" --size 36 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "referrals" --key "refereeId" --size 36 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "referrals" --key "referralCode" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "referrals" --key "status" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "referrals" --key "referralDate" --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "referrals" --key "completedAt" --required false

        # Create indexes
        print_status "Creating indexes..."
        appwrite databases create-index \
            --database-id "$DATABASE_ID" \
            --collection-id "referrals" \
            --key "referrer_idx" \
            --type "key" \
            --attributes "referrerId"

        appwrite databases create-index \
            --database-id "$DATABASE_ID" \
            --collection-id "referrals" \
            --key "code_idx" \
            --type "unique" \
            --attributes "referralCode"

        appwrite databases create-index \
            --database-id "$DATABASE_ID" \
            --collection-id "referrals" \
            --key "status_idx" \
            --type "key" \
            --attributes "status"
        
        print_success "Referrals collection created with all attributes and indexes"
    fi
}

# Main setup function
main() {
    echo "============================================================================="
    echo "                    InvestFlow - Referrals Setup Script"
    echo "============================================================================="
    echo ""
    
    # Pre-flight checks
    check_appwrite_cli
    check_appwrite_login
    load_env
    
    echo ""
    print_status "Starting referrals setup..."
    echo ""
    
    # Create referrals collection
    create_referrals_collection
    
    echo ""
    echo "============================================================================="
    print_success "Referrals setup completed successfully!"
    echo "============================================================================="
    echo ""
    print_status "Your referral system is now ready to use!"
    print_status "Database ID: $DATABASE_ID"
    echo ""
    print_status "Next steps:"
    print_status "1. Implement referral code generation in your application"
    print_status "2. Add referral tracking to user registration"
    print_status "3. Create referral analytics dashboard"
    echo ""
}

# Run main function
main "$@"