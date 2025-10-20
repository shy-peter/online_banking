import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { Toaster } from 'react-hot-toast'
import { cronService } from './lib/cron'

// Initialize cron service for daily earnings processing
if (process.env.NODE_ENV === 'development') {
  console.log('Starting earnings cron service...');
  cronService.startDailyEarningsCron();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <Toaster position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
)