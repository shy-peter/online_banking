# InvestFlow Earnings System

This document explains the automated daily earnings system and admin controls for InvestFlow.

## Overview

The earnings system automatically calculates and processes daily earnings for all active investments, and provides admin controls for manual adjustments.

## Features

### 🔄 Automatic Daily Earnings
- **Daily Processing**: Automatically calculates earnings for all active investments every 24 hours
- **Interest Calculation**: Uses annual interest rates converted to daily rates
- **Transaction Records**: Creates transaction records for all earnings
- **Balance Updates**: Automatically updates user balances

### 👨‍💼 Admin Controls
- **Manual Adjustments**: Admins can increase or decrease user earnings
- **Audit Trail**: All adjustments are tracked with reasons and admin IDs
- **Approval System**: Adjustments can be approved/rejected
- **Bulk Processing**: Process earnings for all users at once

### 📊 Earnings Tracking
- **History**: Complete earnings history for each user
- **Statistics**: Total, average, and period-based earnings stats
- **Investment Breakdown**: Earnings by individual investment
- **Date Range Filtering**: Filter earnings by custom date ranges

## Setup Instructions

### 1. Database Setup

Run the earnings collections setup script:

```bash
chmod +x setup-earnings-collections.sh
./setup-earnings-collections.sh
```

This creates:
- `daily-earnings` collection: Tracks daily earnings for each investment
- `earnings-adjustments` collection: Tracks manual admin adjustments

### 2. Environment Variables

Ensure your `.env` file contains:

```env
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=investflow-db
```

### 3. Admin Access

To access admin features, ensure your user profile has:
- Email containing "admin" OR
- Name containing "Admin"

Example admin users:
- Email: `admin@investflow.com`
- Name: `Admin User`

## Usage

### Automatic Daily Processing

The system automatically processes earnings every 24 hours. In development, you can:

1. **Manual Trigger**: Use the "Process Daily Earnings" button in the admin dashboard
2. **Force Run**: Call `cronService.forceRunEarnings()` in the browser console

### Admin Dashboard

Access the admin dashboard at `/admin` (only visible to admin users).

**Features:**
- View system statistics
- Process daily earnings manually
- Adjust user earnings
- View all earnings adjustments
- Search and filter adjustments

### Manual Earnings Adjustment

1. Go to Admin Dashboard
2. Click "Adjust Earnings"
3. Fill in:
   - User ID
   - Amount (in dollars)
   - Type (Increase/Decrease)
   - Reason
4. Click "Adjust Earnings"

### User Earnings View

Users can view their earnings history in the dashboard:
- Total earnings
- Last 7/30 days earnings
- Average daily earnings
- Complete earnings history with filtering

## API Reference

### Core Functions

#### `processDailyEarnings()`
Processes daily earnings for all active investments.

```typescript
const result = await processDailyEarnings();
// Returns: { success: boolean, processed: number, error?: string }
```

#### `adjustUserEarnings(userId, amount, type, reason, adminId)`
Manually adjusts user earnings.

```typescript
const result = await adjustUserEarnings(
  'user123',
  10000, // $100.00 in cents
  'increase',
  'Bonus payment',
  'admin456'
);
```

#### `calculateDailyEarnings(investment)`
Calculates daily earnings for a specific investment.

```typescript
const dailyAmount = calculateDailyEarnings(investment);
```

### React Hooks

#### `useEarnings()`
Hook for managing earnings data in React components.

```typescript
const {
  earningsHistory,
  dailyEarnings,
  stats,
  loading,
  error,
  fetchEarningsHistory
} = useEarnings();
```

### Cron Service

#### `cronService.startDailyEarningsCron()`
Starts the automatic daily processing.

#### `cronService.stopDailyEarningsCron()`
Stops the automatic processing.

#### `cronService.getStatus()`
Gets the current status of the cron job.

## Database Schema

### Daily Earnings Collection

```typescript
interface DailyEarnings {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;           // User who owns the investment
  investmentId: string;     // Investment that generated earnings
  amount: number;           // Earnings amount in cents
  date: string;             // Date in YYYY-MM-DD format
  status: 'pending' | 'processed' | 'failed';
  type: 'automatic' | 'manual';
  adminId?: string;         // Admin who made manual adjustment
  notes?: string;           // Additional notes
}
```

### Earnings Adjustments Collection

```typescript
interface EarningsAdjustment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;           // User whose earnings were adjusted
  amount: number;           // Adjustment amount in cents (can be negative)
  type: 'increase' | 'decrease';
  reason: string;           // Reason for adjustment
  adminId: string;          // Admin who made the adjustment
  status: 'pending' | 'approved' | 'rejected';
}
```

## Security

- **Admin Access**: Only users with admin privileges can access admin features
- **Audit Trail**: All earnings adjustments are logged with admin IDs
- **Permissions**: Database collections have proper read/write permissions
- **Validation**: All amounts are validated before processing

## Monitoring

### Logs
The system logs all earnings processing activities:
- Daily processing results
- Manual adjustments
- Errors and failures

### Statistics
Admin dashboard shows:
- Total investments
- Active investments
- Total invested amount
- Total transactions

## Troubleshooting

### Common Issues

1. **Earnings not processing**
   - Check if cron service is running
   - Verify database permissions
   - Check for active investments

2. **Admin access denied**
   - Ensure user email/name contains "admin"
   - Check user profile in database

3. **Database errors**
   - Run the setup script again
   - Check Appwrite project configuration
   - Verify environment variables

### Manual Processing

If automatic processing fails, you can manually trigger it:

```javascript
// In browser console
import { processDailyEarnings } from './lib/earnings';
const result = await processDailyEarnings();
console.log(result);
```

## Future Enhancements

- **Scheduled Processing**: Use external cron services for production
- **Email Notifications**: Notify users of earnings
- **Advanced Analytics**: More detailed earnings reports
- **Bulk Operations**: Process multiple users at once
- **API Endpoints**: REST API for external integrations
