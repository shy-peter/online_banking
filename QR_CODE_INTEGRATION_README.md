# QR Code Integration for Payment Methods

## Overview

The QR Code Integration feature allows administrators to upload and manage QR codes for each payment method type, which are then displayed to users when they want to make deposits or investments. This provides a seamless payment experience where users can scan QR codes directly from the platform.

## Features

### 1. QR Code Management for Payment Method Types
- **Upload QR Codes**: Admins can upload QR code images for each payment method type
- **Storage**: QR codes are stored in the `payment-qr-codes` storage bucket
- **Display**: QR codes are shown in the admin interface with visual indicators
- **Update/Replace**: Admins can update or replace existing QR codes

### 2. User-Facing QR Code Display
- **Payment Method Selection**: Users see QR codes when selecting payment methods for deposits
- **Modal Display**: Large, clear QR code display in modal windows
- **Scan Instructions**: Clear instructions on how to use the QR codes
- **Payment Method Info**: Additional context about each payment method

### 3. Dynamic Integration
- **Real-time Updates**: QR codes update immediately when changed by admins
- **Fallback Handling**: Graceful handling when QR codes are not available
- **Responsive Design**: QR codes display properly on all device sizes

## Database Schema Updates

### Payment Method Types Collection
Added new field to the `payment-method-types` collection:

```typescript
interface PaymentMethodType {
  // ... existing fields
  qrCodeUrl?: string; // URL to the QR code image
}
```

### Storage Bucket
QR codes are stored in the `payment-qr-codes` storage bucket:
- **Bucket ID**: `payment-qr-codes`
- **File Types**: Images (jpg, jpeg, png, gif, webp)
- **Max File Size**: 10MB
- **Access**: Public read access for QR code display

## Admin Interface Updates

### AdminPaymentMethodTypes Component
Enhanced with QR code management:

#### New Features:
- **QR Code Upload Field**: File input for uploading QR code images
- **QR Code Display**: Visual indicator showing if QR code is available
- **Current QR Code Status**: Shows existing QR code status when editing
- **File Validation**: Validates image file types and sizes

#### Form Fields:
```typescript
interface FormData {
  // ... existing fields
  qrCodeFile: File | null; // New QR code file upload
}
```

#### Upload Process:
1. User selects QR code image file
2. File is uploaded to `payment-qr-codes` storage bucket
3. URL is generated and stored in the payment method type
4. Changes are immediately reflected in the admin interface

## User Interface Components

### PaymentMethodSelector Component
New component for displaying payment method types with QR codes:

#### Features:
- **Grid Layout**: Responsive grid showing all active payment method types
- **QR Code Buttons**: "View QR Code" buttons for methods with QR codes
- **Category Display**: Color-coded categories for different payment types
- **Selection State**: Visual feedback for selected payment methods
- **QR Code Modal**: Full-screen QR code display with instructions

#### Props:
```typescript
interface PaymentMethodSelectorProps {
  onSelect?: (paymentMethodType: PaymentMethodType) => void;
  showQRCode?: boolean;
  title?: string;
  description?: string;
}
```

#### Usage:
```tsx
<PaymentMethodSelector
  onSelect={(type) => setSelectedType(type)}
  showQRCode={true}
  title="Select Payment Method"
  description="Choose your preferred payment method for deposits"
/>
```

### QR Code Modal
Dedicated modal for displaying QR codes:

#### Features:
- **Large Display**: High-resolution QR code display
- **Payment Method Info**: Context about the selected payment method
- **Scan Instructions**: Clear instructions for users
- **Responsive Design**: Works on all device sizes

## Integration Points

### 1. Investment Modal
Updated to use the new PaymentMethodSelector:

```tsx
<PaymentMethodSelector
  onSelect={(paymentMethodType) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: paymentMethodType.type,
      selectedPaymentMethodType: paymentMethodType
    }));
  }}
  showQRCode={true}
  title="Select Payment Method"
  description="Choose your preferred payment method for this investment"
/>
```

### 2. Withdrawal Modal
Maintains existing functionality but could be enhanced to show QR codes for user's verified payment methods.

### 3. Settings Page
Payment method selection now uses dynamic payment method types with QR code support.

## File Upload Process

### 1. File Selection
```tsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => setFormData(prev => ({ 
    ...prev, 
    qrCodeFile: e.target.files?.[0] || null 
  }))}
/>
```

### 2. File Upload
```typescript
const handleFileUpload = async (file: File): Promise<string> => {
  try {
    const fileId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const response = await storage.createFile(
      'payment-qr-codes',
      fileId,
      file
    );
    return response.$id;
  } catch (error) {
    throw new Error('Failed to upload QR code');
  }
};
```

### 3. URL Generation
```typescript
const qrCodeUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/payment-qr-codes/files/${fileId}/view?project=investflow`;
```

## QR Code Display

### 1. Admin Interface
Shows QR code status in payment method type cards:
```tsx
{type.qrCodeUrl && (
  <div className="mb-3">
    <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code:</h4>
    <div className="flex items-center space-x-2">
      <QrCode className="w-4 h-4 text-primary-600" />
      <span className="text-xs text-green-600">QR Code Available</span>
    </div>
  </div>
)}
```

### 2. User Interface
QR code buttons in payment method selection:
```tsx
{showQRCode && type.qrCodeUrl && (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <button
      onClick={() => handleViewQR(type)}
      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
    >
      <QrCode className="w-4 h-4" />
      <span>View QR Code</span>
    </button>
  </div>
)}
```

### 3. QR Code Modal
Full-screen QR code display:
```tsx
<div className="text-center">
  <div className="bg-gray-50 rounded-lg p-4 mb-4">
    <img
      src={selectedType.qrCodeUrl}
      alt={`${selectedType.name} QR Code`}
      className="max-w-full h-auto mx-auto rounded-lg"
      style={{ maxHeight: '300px' }}
    />
  </div>
  <p className="text-sm text-gray-600">
    Scan this QR code with your {selectedType.name} app
  </p>
</div>
```

## Setup Instructions

### 1. Database Schema Update
Run the updated setup scripts to add the QR code field:

**Linux/Mac:**
```bash
./setup-payment-method-types.sh
```

**Windows:**
```cmd
setup-payment-method-types.bat
```

### 2. Storage Bucket Setup
Ensure the `payment-qr-codes` storage bucket exists:

```bash
./setup-payment-qr-storage.sh
```

### 3. Upload QR Codes
1. Go to Admin Dashboard → Payment Methods → Manage Types
2. Edit each payment method type
3. Upload QR code images
4. Save changes

## Usage Guide

### For Administrators

#### Adding QR Codes:
1. Navigate to Admin Dashboard → Payment Methods → Manage Types
2. Click "Edit" on a payment method type
3. Scroll to "QR Code Image" section
4. Click "Choose File" and select QR code image
5. Click "Update Payment Method Type"

#### Managing QR Codes:
- **View Status**: QR code availability is shown in the type cards
- **Update**: Upload new QR code to replace existing one
- **Remove**: Leave QR code field empty to remove

### For Users

#### Making Deposits:
1. Click "Invest" or "Make Deposit"
2. Select investment amount
3. Choose payment method from the grid
4. Click "View QR Code" if available
5. Scan QR code with payment app
6. Complete payment

#### QR Code Scanning:
1. Open your payment app (PayPal, Venmo, Cash App, etc.)
2. Look for "Scan QR Code" or "Pay with QR" option
3. Point camera at the QR code
4. Follow app instructions to complete payment

## Technical Implementation

### File Upload Flow:
1. **File Selection**: User selects image file
2. **Validation**: Check file type and size
3. **Upload**: Send to Appwrite storage
4. **URL Generation**: Create public URL
5. **Database Update**: Store URL in payment method type
6. **UI Update**: Refresh interface to show changes

### Error Handling:
- **File Type Validation**: Only allow image files
- **File Size Limits**: Enforce 10MB maximum
- **Upload Errors**: Show user-friendly error messages
- **Network Issues**: Handle connection problems gracefully

### Performance Considerations:
- **Image Optimization**: QR codes should be optimized for web display
- **Lazy Loading**: QR code images load only when needed
- **Caching**: Browser caching for frequently accessed QR codes
- **CDN**: Use Appwrite's CDN for fast image delivery

## Security Features

### File Upload Security:
- **File Type Validation**: Only allow image files
- **File Size Limits**: Prevent large file uploads
- **Virus Scanning**: Appwrite handles file security
- **Access Control**: Admin-only upload permissions

### QR Code Security:
- **Public Access**: QR codes need public read access for user display
- **No Sensitive Data**: QR codes should not contain sensitive information
- **Regular Updates**: Allow admins to update QR codes as needed

## Troubleshooting

### Common Issues:

1. **QR Code Not Displaying**
   - Check if QR code URL is properly stored
   - Verify storage bucket permissions
   - Ensure image file is accessible

2. **Upload Failures**
   - Check file size (must be under 10MB)
   - Verify file type (must be image)
   - Check network connection

3. **QR Code Not Scanning**
   - Ensure QR code is high quality
   - Check if QR code contains correct payment information
   - Verify QR code is not corrupted

### Solutions:

1. **Refresh Data**: Reload the page to get latest QR codes
2. **Check Permissions**: Verify storage bucket permissions
3. **Re-upload**: Try uploading QR code again
4. **Contact Support**: For persistent issues, contact system administrator

## Future Enhancements

### Planned Features:
- **QR Code Generation**: Auto-generate QR codes from payment information
- **Multiple QR Codes**: Support for different QR codes per payment method
- **QR Code Analytics**: Track QR code usage and scan rates
- **Custom QR Code Styling**: Allow custom colors and logos

### Potential Improvements:
- **Batch Upload**: Upload multiple QR codes at once
- **QR Code Templates**: Pre-defined QR code formats
- **Mobile Optimization**: Better mobile QR code scanning experience
- **Offline Support**: Cache QR codes for offline access

## Support

For technical support or feature requests related to QR Code Integration, please contact the development team or create an issue in the project repository.
