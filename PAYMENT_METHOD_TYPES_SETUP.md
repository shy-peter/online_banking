# Payment Method Types Setup Guide

## Quick Fix for "Failed to fetch payment method types" Error

This error occurs because the `payment-method-types` collection doesn't exist in your Appwrite database yet.

## Setup Steps

### 1. Set Up Environment Variables (Required First!)

**For Windows:**
```bash
setup-env.bat
```

**For Linux/Mac:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

This will create a `.env` file with your Appwrite project details.

### 2. Create the Payment Method Types Collection

**For Windows:**
```bash
setup-payment-method-types.bat
```

**For Linux/Mac:**
```bash
chmod +x setup-payment-method-types.sh
./setup-payment-method-types.sh
```

### 3. Set Up QR Code Storage (Uses Existing Bucket)

**For Windows:**
```bash
setup-payment-qr-storage.bat
```

**For Linux/Mac:**
```bash
chmod +x setup-payment-qr-storage.sh
./setup-payment-qr-storage.sh
```

**Note:** This script now uses your existing `files` bucket instead of creating a new one (to avoid bucket limit errors).

### 4. Refresh the Admin Panel

After running the setup scripts, refresh your browser or click the "Retry After Setup" button in the admin panel.

## What These Scripts Do

### Payment Method Types Collection
- Creates the `payment-method-types` collection
- Adds all required attributes (type, name, description, icon, category, etc.)
- Sets up proper permissions for admin access
- Creates indexes for efficient querying

### QR Code Storage Bucket
- Creates the `payment-qr-codes` storage bucket
- Sets up proper permissions for file uploads
- Configures the bucket for QR code images

## Verification

After running the scripts, you should see:
1. No more "Failed to fetch payment method types" error
2. The admin panel shows "No payment method types found" (which is normal for a fresh setup)
3. You can now add your first payment method type

## Adding Your First Payment Method Type

1. Click "Add Payment Method Type" in the admin panel
2. Fill in the required fields:
   - **Type ID**: `paypal` (unique identifier)
   - **Display Name**: `PayPal`
   - **Category**: Choose appropriate category
   - **Icon**: Select an icon
3. Optionally upload a QR code image
4. Click "Add Payment Method Type"

## Troubleshooting

If you still get errors after running the scripts:

1. **Check Appwrite Console**: Make sure your project ID and API keys are correct
2. **Verify Permissions**: Ensure your admin user has the right permissions
3. **Check Network**: Make sure you can connect to your Appwrite instance
4. **Review Logs**: Check the browser console for detailed error messages

## Next Steps

Once the setup is complete, you can:
- Add multiple payment method types (PayPal, Venmo, Cash App, etc.)
- Upload QR codes for each payment method
- Configure required/optional fields for each type
- Set up categories and sorting
- Test the payment method selection in the investment modal
