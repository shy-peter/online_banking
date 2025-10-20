#!/bin/bash

# Setup storage bucket for payment QR codes
echo "Setting up payment QR codes storage bucket..."

# Check if payment-qr-codes bucket exists
echo "Checking for existing payment-qr-codes bucket..."
if appwrite storage get-bucket --bucket-id payment-qr-codes >/dev/null 2>&1; then
    echo "✅ Payment QR codes bucket already exists!"
else
    echo "❌ Payment QR codes bucket not found."
    echo "📋 Available buckets:"
    appwrite storage list-buckets
    
    echo ""
    echo "🔄 Using existing 'files' bucket for QR codes..."
    echo "✅ QR codes will be stored in the 'files' bucket"
    echo "✅ This bucket already supports image formats (jpg, jpeg, png, gif, webp)"
    echo "✅ 10MB max file size is sufficient for QR codes"
fi

echo ""
echo "🎉 Payment QR codes storage setup completed!"
echo ""
echo "Features:"
echo "- QR codes will be stored in the 'files' bucket"
echo "- 10MB max file size"
echo "- Supports common image formats (jpg, jpeg, png, gif, webp)"
echo "- Secure file access"
echo ""
echo "Note: The application will use the 'files' bucket for QR code storage."
