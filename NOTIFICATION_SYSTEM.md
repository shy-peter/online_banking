# Notification System

## Overview
The InvestFlow app now includes a comprehensive notification system that alerts users about transaction status changes, investment updates, and other important events.

## Features

### 🔔 Real-time Notifications
- **Transaction Updates**: Get notified when transactions are completed or failed
- **Investment Updates**: Receive alerts for new investments and status changes
- **System Notifications**: Important system updates and announcements
- **Security Alerts**: Security-related notifications

### 📱 Notification Bell
- Located in the header navigation bar
- Shows unread notification count with a red badge
- Click to open the notification dropdown

### 📋 Notification Dropdown
- **View All Notifications**: See all your notifications in chronological order
- **Mark as Read**: Click on notifications to mark them as read
- **Mark All as Read**: Bulk action to mark all notifications as read
- **Clear Notifications**: Remove individual or all notifications
- **Priority Indicators**: Color-coded priority levels (high, medium, low)

### 🎯 Smart Notifications
- **Automatic Creation**: Notifications are automatically created when:
  - New investments are created
  - Transaction status changes (pending → completed/failed)
  - System events occur
- **Contextual Information**: Each notification includes relevant details and action URLs
- **Real-time Updates**: Notifications are fetched every 30 seconds

## How to Test

### 1. Create a New Investment
1. Go to the Investments page
2. Create a new investment
3. Check the notification bell - you should see a new notification about the investment creation

### 2. Simulate Transaction Status Changes
1. Go to the Transactions page
2. Find a pending transaction
3. Click the "Complete" or "Fail" buttons to simulate status changes
4. Check the notification bell for new notifications about the status change

### 3. View Notifications
1. Click the notification bell in the header
2. View all your notifications in the dropdown
3. Click on notifications to mark them as read
4. Use "Mark all read" or "Clear all" for bulk actions

## Database Setup

The notification system requires a new `notifications` collection in your Appwrite database. Run the updated setup script:

```bash
./setup-database.sh
```

This will create the notifications collection with the following attributes:
- `userId`: User who owns the notification
- `type`: Notification type (transaction_update, investment_update, system, security)
- `title`: Notification title
- `message`: Detailed notification message
- `isRead`: Whether the notification has been read
- `priority`: Priority level (low, medium, high)
- `transactionId`: Related transaction ID (optional)
- `investmentId`: Related investment ID (optional)
- `actionUrl`: URL to navigate to when clicked (optional)
- `createdAt`: When the notification was created

## Technical Implementation

### Components
- `NotificationDropdown`: Main notification UI component
- `NotificationContext`: Context for managing notification state
- `AuthContext`: Extended with notification creation functions

### Key Functions
- `addNotification()`: Create new notifications
- `markAsRead()`: Mark individual notifications as read
- `markAllAsRead()`: Mark all notifications as read
- `clearNotification()`: Remove individual notifications
- `clearAllNotifications()`: Remove all notifications
- `simulateTransactionStatusChange()`: Demo function for testing

### Integration Points
- **Investment Creation**: Automatically creates notifications when investments are made
- **Transaction Updates**: Creates notifications when transaction status changes
- **Real-time Polling**: Fetches new notifications every 30 seconds
- **Header Integration**: Notification bell with unread count

## Customization

### Adding New Notification Types
1. Update the `Notification` type in `src/types/appwrite.ts`
2. Add new notification creation logic in `AuthContext`
3. Update the notification icon mapping in `NotificationDropdown`

### Styling
- Notification colors are based on priority levels
- Unread notifications have a blue background
- Priority indicators use color-coded left borders

### Polling Frequency
- Currently set to 30 seconds
- Can be adjusted in `NotificationContext.tsx`

## Future Enhancements
- Push notifications for mobile devices
- Email notifications for important events
- Notification preferences and settings
- Sound notifications
- Notification categories and filtering
