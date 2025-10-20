#!/bin/bash

# =============================================================================
# InvestFlow - Cleanup Redundant Files Script
# =============================================================================
# This script removes all redundant setup files and keeps only the essential ones
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "============================================================================="
echo "InvestFlow - Cleanup Redundant Files"
echo "============================================================================="
echo "This script will remove redundant setup files and keep only essential ones."
echo "============================================================================="
echo ""

# List of files to remove (redundant setup scripts)
REDUNDANT_FILES=(
    "add-bonus-code-attributes.bat"
    "add-bonus-code-attributes.sh"
    "add-missing-attributes.ps1"
    "add-missing-attributes.sh"
    "add-preferences-attribute.bat"
    "add-preferences-attribute.sh"
    "add-updated-at-attribute.bat"
    "add-updated-at-attribute.sh"
    "create-storage-bucket.sh"
    "fix-notifications-permissions.bat"
    "fix-notifications-permissions.sh"
    "fix-transfers-permissions.bat"
    "fix-transfers-permissions.ps1"
    "fix-transfers-permissions.sh"
    "setup-bonus-codes.bat"
    "setup-bonus-codes.sh"
    "setup-database.sh"
    "setup-earnings-collections.sh"
    "setup-env.bat"
    "setup-env.sh"
    "setup-payment-method-types.bat"
    "setup-payment-method-types.sh"
    "setup-payment-methods.bat"
    "setup-payment-methods.sh"
    "setup-payment-qr-storage.bat"
    "setup-payment-qr-storage.sh"
    "setup-transfers.bat"
    "setup-transfers.sh"
    "update-users-collection.sh"
    "test-storage-bucket.html"
)

# List of documentation files to remove (redundant)
REDUNDANT_DOCS=(
    "DATABASE_FIXES_SUMMARY.md"
    "DATABASE_UPDATE_INSTRUCTIONS.md"
    "DOWNLOAD_READY.md"
    "EARNINGS_SYSTEM_README.md"
    "MANUAL_BUCKET_SETUP.md"
    "NOTIFICATION_SYSTEM.md"
    "PAYMENT_METHOD_TYPES_README.md"
    "PAYMENT_METHOD_TYPES_SETUP.md"
    "PLATFORM_FIXES_SUMMARY.md"
    "QR_CODE_INTEGRATION_README.md"
    "STORAGE_BUCKET_SETUP.md"
    "STORAGE_TROUBLESHOOTING.md"
)

# List of files to keep (essential)
ESSENTIAL_FILES=(
    "setup-complete.sh"
    "setup-complete.bat"
    "cleanup-redundant-files.sh"
    "README.md"
    "package.json"
    "package-lock.json"
    "vite.config.ts"
    "vite.config.js"
    "tailwind.config.js"
    "postcss.config.js"
    "tsconfig.json"
    "tsconfig.node.json"
    "appwrite.config.json"
    "index.html"
)

print_status "Removing redundant setup files..."
for file in "${REDUNDANT_FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        print_success "Removed: $file"
    fi
done

print_status "Removing redundant documentation files..."
for file in "${REDUNDANT_DOCS[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        print_success "Removed: $file"
    fi
done

print_status "Cleaning up duplicate config files..."
# Remove duplicate vite config if both exist
if [ -f "vite.config.js" ] && [ -f "vite.config.ts" ]; then
    rm "vite.config.js"
    print_success "Removed duplicate: vite.config.js (keeping vite.config.ts)"
fi

print_status "Cleaning up unused assets..."
# Remove unused QR code images from assets (they should be uploaded via admin panel)
if [ -d "src/assets/qr-codes" ]; then
    rm -rf "src/assets/qr-codes"
    print_success "Removed unused QR code assets (use admin panel to upload QR codes)"
fi

print_status "Cleaning up dist folder if it exists..."
if [ -d "dist" ]; then
    rm -rf "dist"
    print_success "Removed dist folder (will be regenerated on build)"
fi

echo ""
echo "============================================================================="
echo "CLEANUP COMPLETE"
echo "============================================================================="
echo ""
print_success "Cleanup completed successfully!"
echo ""
echo "Files kept (essential):"
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    fi
done
echo ""
echo "What was removed:"
echo "• All redundant setup scripts (${#REDUNDANT_FILES[@]} files)"
echo "• All redundant documentation files (${#REDUNDANT_DOCS[@]} files)"
echo "• Duplicate config files"
echo "• Unused QR code assets"
echo "• Build artifacts"
echo ""
echo "Your project is now clean and optimized! 🚀"
echo ""
echo "To set up your project, run:"
echo "  chmod +x setup-complete.sh"
echo "  ./setup-complete.sh"
echo ""
echo "Or on Windows:"
echo "  setup-complete.bat"
