# InvestFlow - Smart Investment Platform

A modern, responsive investment platform built with React, TypeScript, and Appwrite.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Appwrite CLI installed ([Install Guide](https://appwrite.io/docs/command-line))
- Appwrite account and project

### 1. Clone and Install

```bash
git clone <your-repo>
cd investflow
npm install
```

### 2. Setup Appwrite Infrastructure

**Linux/Mac:**
```bash
chmod +x setup-complete.sh
./setup-complete.sh
```

**Windows:**
```cmd
setup-complete.bat
```

This single script will:
- ✅ Set up environment variables
- ✅ Create storage bucket for QR codes
- ✅ Create payment method types collection
- ✅ Add default payment methods (PayPal, Venmo, Cash App, USDT, Ethereum, Bitcoin)
- ✅ Configure proper permissions
- ✅ Verify setup

### 3. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see your application.

## 🎯 Features

### Core Features
- **User Authentication** - Secure login/register with Appwrite
- **Investment Management** - Create and track investments
- **Transaction History** - Complete transaction tracking
- **Admin Dashboard** - Full administrative control
- **Responsive Design** - Works on all devices

### Advanced Features
- **Dynamic Payment Methods** - Admin-configurable payment types
- **QR Code Integration** - Upload and display QR codes for payments
- **Click-to-Copy** - Easy copying of emails, phone numbers, account details
- **Real-time Notifications** - Investment status updates
- **Bulk Operations** - Efficient data management

## 🛠️ Admin Panel

Access the admin panel at `/admin` to:

- **Manage Users** - View, edit, and manage user accounts
- **Payment Method Types** - Add/edit/remove payment methods and QR codes
- **Transaction Management** - Monitor and manage all transactions
- **System Settings** - Configure platform settings

### Adding Payment Methods

1. Go to Admin Panel → Payment Method Types
2. Click "Add New Type"
3. Fill in details (name, description, category, required fields)
4. Upload QR code image (JPG, PNG, GIF, WebP)
5. Set as active and configure sort order

## 📱 User Experience

### For Users
- **Easy Registration** - Simple signup process
- **Investment Tracking** - Real-time investment status
- **Multiple Payment Methods** - PayPal, Venmo, Cash App, Crypto
- **QR Code Payments** - Scan QR codes for easy deposits
- **Notifications** - Stay updated on investment status

### For Admins
- **User Management** - Complete user oversight
- **Payment Configuration** - Flexible payment method setup
- **Transaction Monitoring** - Real-time transaction tracking
- **Bulk Operations** - Efficient data management

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Appwrite (Database, Auth, Storage)
- **Icons**: Lucide React
- **State Management**: React Context

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ClickToCopy.tsx  # Copy-to-clipboard functionality
│   ├── PaymentMethodSelector.tsx
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── pages/              # Application pages
│   ├── Dashboard.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── lib/                # Utility libraries
│   ├── appwrite.ts
│   └── ...
└── types/              # TypeScript definitions
    └── appwrite.ts
```

## 🗄️ Database Collections

### Core Collections
- `users` - User profiles and settings
- `investments` - Investment records
- `transactions` - Transaction history
- `notifications` - User notifications

### Admin Collections
- `payment-method-types` - Configurable payment methods
- `payment-methods` - User payment method details

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Create a `.env` file with:
```env
DATABASE_ID=your_database_id
PROJECT_ID=your_project_id
API_ENDPOINT=https://your-appwrite-endpoint/v1
```

## 🧹 Cleanup

To remove redundant files and optimize your project:

**Linux/Mac:**
```bash
chmod +x cleanup-redundant-files.sh
./cleanup-redundant-files.sh
```

**Windows:**
```cmd
cleanup-redundant-files.bat
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security Features

- **Appwrite Authentication** - Secure user management
- **Permission-based Access** - Role-based permissions
- **Input Validation** - Client and server-side validation
- **Secure File Upload** - Validated file types and sizes

## 🎨 Customization

### Adding New Payment Methods

1. Use the admin panel to add new payment method types
2. Configure required/optional fields
3. Upload QR codes
4. Set categories and sort order

### Styling

- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Component-specific styles use Tailwind classes

## 🐛 Troubleshooting

### Common Issues

1. **Setup Script Fails**
   - Ensure Appwrite CLI is installed and logged in
   - Check environment variables are correct
   - Verify project permissions

2. **QR Code Upload Issues**
   - Check file format (JPG, PNG, GIF, WebP only)
   - Ensure file size is under 10MB
   - Verify storage bucket permissions

3. **Payment Methods Not Showing**
   - Check if payment method types are active
   - Verify collection permissions
   - Check browser console for errors

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Appwrite documentation
3. Check browser console for errors
4. Verify environment setup

## 🎉 Success!

Your InvestFlow platform is now ready! The setup script has configured everything you need for a production-ready investment platform.

**Next Steps:**
1. Customize payment methods via admin panel
2. Upload QR codes for each payment method
3. Configure your branding and styling
4. Deploy to your preferred hosting platform

Happy investing! 🚀
