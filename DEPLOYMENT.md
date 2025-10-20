# InvestFlow - Deployment Guide

## Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shy-peter/online_banking.git
   cd online_banking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Appwrite project details
   ```

4. **Run the complete setup script**
   ```bash
   chmod +x setup-complete.sh
   ./setup-complete.sh
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your GitHub repository
2. Set environment variables in your hosting platform
3. Deploy automatically on push to main branch

### Environment Variables Required
- `DATABASE_ID`: Your Appwrite database ID
- `PROJECT_ID`: Your Appwrite project ID
- `APPWRITE_ENDPOINT`: Your Appwrite endpoint (optional)

## Features Included

✅ **Complete Banking System**
- User registration and authentication
- Investment management
- Transaction history
- Payment methods management
- Admin dashboard

✅ **Payment Method Types**
- PayPal, Venmo, Cash App
- Cryptocurrency (Bitcoin, Ethereum, USDT)
- QR code support
- Dynamic payment method configuration

✅ **Advanced Features**
- Click-to-copy functionality
- Real-time notifications
- Responsive design
- Admin panel
- Document upload
- Bonus codes system

## Support

For issues or questions, please check the repository or create an issue on GitHub.
