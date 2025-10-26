#!/bin/bash

# =============================================================================
# InvestFlow - Chat Setup Script
# =============================================================================
# This script sets up the chat functionality including:
# - Chat messages collection
# - Chat sessions collection
# - Indexes for real-time queries
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
        export $(cat .env | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}')
        print_success "Environment variables loaded from .env"
    else
        print_warning ".env file not found. Using default values."
        export DATABASE_ID="investflow-db"
        export PROJECT_ID="68d9353a00112ca03052"
        export APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
    fi
}

# Function to create chat messages collection
create_chat_messages_collection() {
    print_status "Setting up chat messages collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "chat_messages" &> /dev/null; then
        print_success "Chat messages collection already exists"
    else
        print_status "Creating chat messages collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "chat_messages" \
            --name "Chat Messages" \
            --permissions "create(\"any\")" \
            --permissions "read(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"

        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "message" --size 2048 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "userId" --size 255 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "email" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "phone" --size 20 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "status" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "type" --size 20 --required true
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "sessionId" --size 255 --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "chat_messages" --key "timestamp" --required true

        print_success "Chat messages collection created with all attributes"
    fi
}

# Function to create chat sessions collection
create_chat_sessions_collection() {
    print_status "Setting up chat sessions collection..."
    
    if appwrite databases get-collection --database-id "$DATABASE_ID" --collection-id "chat_sessions" &> /dev/null; then
        print_success "Chat sessions collection already exists"
    else
        print_status "Creating chat sessions collection..."
        appwrite databases create-collection \
            --database-id "$DATABASE_ID" \
            --collection-id "chat_sessions" \
            --name "Chat Sessions" \
            --permissions "create(\"any\")" \
            --permissions "read(\"any\")" \
            --permissions "update(\"any\")" \
            --permissions "delete(\"any\")"
        
        # Add attributes
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_sessions" --key "userId" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_sessions" --key "email" --size 255 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_sessions" --key "phone" --size 20 --required false
        appwrite databases create-string-attribute --database-id "$DATABASE_ID" --collection-id "chat_sessions" --key "status" --size 20 --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "chat_sessions" --key "startedAt" --required true
        appwrite databases create-datetime-attribute --database-id "$DATABASE_ID" --collection-id "chat_sessions" --key "lastActivityAt" --required true

        print_success "Chat sessions collection created with all attributes"
    fi
}

# Function to create chat indexes
create_chat_indexes() {
    print_status "Creating chat indexes..."

    # Message indexes
    print_status "Creating chat message indexes..."
    appwrite databases create-index \
        --database-id "$DATABASE_ID" \
        --collection-id "chat_messages" \
        --key "session_timestamp" \
        --type "key" \
        --attributes sessionId \
        --attributes timestamp

    # Session indexes
    print_status "Creating chat session indexes..."
    appwrite databases create-index \
        --database-id "$DATABASE_ID" \
        --collection-id "chat_sessions" \
        --key "user_status" \
        --type "key" \
        --attributes userId \
        --attributes status

    print_success "Chat indexes created successfully"
}

# Main setup function
main() {
    echo "============================================================================="
    echo "                    InvestFlow - Chat Setup Script"
    echo "============================================================================="
    echo ""
    
    # Pre-flight checks
    check_appwrite_cli
    check_appwrite_login
    load_env
    
    echo ""
    print_status "Starting chat setup..."
    echo ""
    
    # Create collections and indexes
    create_chat_messages_collection
    create_chat_sessions_collection
    create_chat_indexes
    
    echo ""
    echo "============================================================================="
    print_success "Chat setup completed successfully!"
    echo "============================================================================="
    echo ""
    print_status "Your chat system is now ready to use!"
    print_status "Database ID: $DATABASE_ID"
    print_status "Project ID: $PROJECT_ID"
    echo ""
}

# Run main function
main "$@"
