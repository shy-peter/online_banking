# Payment Method Types Management Feature

## Overview

The Payment Method Types Management feature allows administrators to dynamically manage available payment/deposit method types without requiring code changes. This system replaces hardcoded payment method types with a flexible, database-driven configuration.

## Features

### 1. Dynamic Payment Method Types
- **Add New Types**: Create new payment method types with custom configurations
- **Edit Existing Types**: Modify type properties, icons, categories, and field requirements
- **Delete Types**: Remove payment method types (with safety checks)
- **Activate/Deactivate**: Enable or disable payment method types without deletion

### 2. Type Configuration
- **Type ID**: Unique identifier for the payment method type
- **Display Name**: User-friendly name shown in the interface
- **Description**: Detailed description of the payment method
- **Icon**: Visual icon representation (CreditCard, Smartphone, DollarSign, etc.)
- **Category**: Classification (digital_wallet, mobile_payment, cryptocurrency, bank_transfer, other)
- **Required Fields**: JSON array of required field names
- **Optional Fields**: JSON array of optional field names
- **Sort Order**: Display order in dropdowns and lists
- **Active Status**: Enable/disable the payment method type

### 3. Admin Interface
- **Grid View**: Visual cards showing all payment method types
- **Filtering**: Filter by category, status, and search terms
- **Bulk Operations**: Activate/deactivate multiple types
- **Form Validation**: Comprehensive validation for all fields
- **Real-time Updates**: Immediate reflection of changes across the system

## Database Structure

### Collection: `payment-method-types`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | String | Yes | Unique identifier (e.g., "paypal", "venmo") |
| `name` | String | Yes | Display name (e.g., "PayPal", "Venmo") |
| `description` | String | No | Detailed description |
| `icon` | String | No | Icon name (CreditCard, Smartphone, DollarSign, etc.) |
| `category` | String | Yes | Category (digital_wallet, mobile_payment, cryptocurrency, bank_transfer, other) |
| `requiredFields` | String | No | JSON array of required field names |
| `optionalFields` | String | No | JSON array of optional field names |
| `isActive` | Boolean | Yes | Whether the type is active/enabled |
| `sortOrder` | Integer | Yes | Display order (lower numbers first) |

## Default Payment Method Types

The system comes with pre-configured payment method types:

### Digital Wallets
- **PayPal**: Digital wallet and payment system
  - Required: email
  - Optional: username, phoneNumber

### Mobile Payments
- **Venmo**: Mobile payment service
  - Required: username, phoneNumber
  - Optional: email
- **Cash App**: Mobile payment service
  - Required: username, phoneNumber
  - Optional: email

### Cryptocurrency
- **USDT (Tether)**: USDT cryptocurrency wallet
  - Required: address
  - Optional: name
- **Ethereum**: Ethereum cryptocurrency wallet
  - Required: address
  - Optional: name
- **Bitcoin**: Bitcoin cryptocurrency wallet
  - Required: address
  - Optional: name

## Setup Instructions

### 1. Run Setup Scripts

**For Linux/Mac:**
```bash
chmod +x setup-payment-method-types.sh
./setup-payment-method-types.sh
```

**For Windows:**
```cmd
setup-payment-method-types.bat
```

### 2. Verify Setup
1. Check that the `payment-method-types` collection was created
2. Verify that default payment method types were added
3. Confirm that indexes were created for performance

### 3. Access Admin Interface
1. Navigate to Admin Dashboard
2. Go to "Payment Methods Management" section
3. Click "Manage Types" button
4. Or directly visit `/admin/payment-method-types`

## Usage Guide

### Adding a New Payment Method Type

1. **Access Admin Interface**: Go to Admin Dashboard → Payment Methods → Manage Types
2. **Click "Add Payment Method Type"**: Opens the creation form
3. **Fill Required Fields**:
   - Type ID: Unique identifier (e.g., "zelle", "apple_pay")
   - Display Name: User-friendly name (e.g., "Zelle", "Apple Pay")
   - Category: Select appropriate category
   - Sort Order: Display position
4. **Configure Optional Fields**:
   - Description: Detailed explanation
   - Icon: Visual representation
   - Required Fields: JSON array (e.g., `["email", "phoneNumber"]`)
   - Optional Fields: JSON array (e.g., `["username"]`)
5. **Save**: Click "Add Payment Method Type"

### Editing Existing Types

1. **Find the Type**: Use filters or search to locate the type
2. **Click Edit**: Click the edit icon on the type card
3. **Modify Fields**: Update any fields as needed
4. **Save Changes**: Click "Update Payment Method Type"

### Managing Type Status

- **Activate**: Click the eye icon to enable a type
- **Deactivate**: Click the eye-off icon to disable a type
- **Delete**: Click the trash icon to permanently remove a type

### Field Configuration

#### Required Fields JSON Format
```json
["email", "username", "phoneNumber"]
```

#### Optional Fields JSON Format
```json
["address", "accountNumber"]
```

#### Available Icons
- `CreditCard`: Credit card icon
- `Smartphone`: Smartphone icon
- `DollarSign`: Dollar sign icon
- `Building2`: Building icon
- `MoreHorizontal`: More options icon

#### Categories
- `digital_wallet`: Digital wallet services
- `mobile_payment`: Mobile payment apps
- `cryptocurrency`: Cryptocurrency wallets
- `bank_transfer`: Bank transfer services
- `other`: Other payment methods

## Integration Points

### 1. Admin Payment Methods Page
- Uses dynamic types in dropdown selection
- Displays type-specific icons
- Validates against type requirements

### 2. User Settings Page
- Shows only active payment method types
- Sorts by sortOrder
- Validates required fields based on type configuration

### 3. Investment Modal
- Uses dynamic types for payment method selection
- Displays appropriate icons and names

## API Functions

### AuthContext Functions

```typescript
// Get all payment method types
getPaymentMethodTypes(): Promise<PaymentMethodType[]>

// Add new payment method type
addPaymentMethodType(paymentMethodType: Omit<PaymentMethodType, '$id' | '$createdAt' | '$updatedAt'>): Promise<{ success: boolean; error?: string; paymentMethodType?: PaymentMethodType }>

// Update existing payment method type
updatePaymentMethodType(paymentMethodTypeId: string, updates: Partial<PaymentMethodType>): Promise<{ success: boolean; error?: string }>

// Delete payment method type
deletePaymentMethodType(paymentMethodTypeId: string): Promise<{ success: boolean; error?: string }>
```

## Validation Rules

### Type ID
- Must be unique across all types
- Cannot be changed after creation
- Should be lowercase with underscores (e.g., "apple_pay")
- Cannot contain spaces or special characters

### Display Name
- Must be unique and descriptive
- Should be user-friendly
- Cannot be empty

### Required/Optional Fields
- Must be valid JSON arrays
- Field names should match form field names
- Cannot contain invalid characters

### Sort Order
- Must be a positive integer
- Lower numbers appear first
- Should be unique for better organization

## Error Handling

### Common Errors
1. **Duplicate Type ID**: Type ID already exists
2. **Invalid JSON**: Malformed requiredFields or optionalFields
3. **Missing Required Fields**: Required fields not provided
4. **Permission Errors**: Insufficient admin permissions

### Error Messages
- Clear, user-friendly error messages
- Specific validation feedback
- Toast notifications for success/error states

## Performance Considerations

### Indexes
- `type-index`: Unique index on type field
- `category-index`: Key index on category field
- `isActive-index`: Key index on isActive field
- `sortOrder-index`: Key index on sortOrder field

### Caching
- Payment method types are cached in component state
- Refreshed when changes are made
- Optimized queries with proper filtering

## Security Features

### Access Control
- Admin-only access to management interface
- Permission-based operations
- Secure database operations

### Data Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Type safety with TypeScript interfaces

## Troubleshooting

### Common Issues

1. **Types Not Appearing**
   - Check if types are marked as active
   - Verify sortOrder is set correctly
   - Ensure proper database permissions

2. **Form Validation Errors**
   - Check JSON format for required/optional fields
   - Verify all required fields are filled
   - Ensure unique type IDs

3. **Permission Errors**
   - Verify admin user permissions
   - Check database collection permissions
   - Ensure proper authentication

### Solutions

1. **Refresh Data**: Reload the page or refresh payment method types
2. **Check Logs**: Review browser console and server logs
3. **Verify Setup**: Ensure database collection and indexes are properly created
4. **Contact Support**: For persistent issues, contact system administrator

## Future Enhancements

### Planned Features
- **Bulk Import/Export**: CSV import/export for payment method types
- **Type Templates**: Predefined templates for common payment methods
- **Advanced Validation**: Custom validation rules per type
- **Audit Logging**: Track all changes to payment method types
- **API Integration**: External API integration for payment method validation

### Potential Improvements
- **Drag & Drop**: Reorder types with drag and drop
- **Type Dependencies**: Define relationships between types
- **Custom Icons**: Upload custom icons for payment methods
- **Multi-language Support**: Localized type names and descriptions

## Support

For technical support or feature requests related to Payment Method Types Management, please contact the development team or create an issue in the project repository.
