import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import EnhancedSignup from './pages/EnhancedSignup';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminTransactions from './pages/AdminTransactions';
import AdminPaymentMethods from './pages/AdminPaymentMethods';
import AdminPaymentMethodTypes from './pages/AdminPaymentMethodTypes';
import AdminReferrals from './pages/AdminReferrals';
import SecurityCenter from './pages/SecurityCenter';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <ChatProvider>
        <div className="App px-2 md:px-4">
          <ChatWidget />
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {!user ? (
            // Public routes
            <>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<EnhancedSignup />} />
              <Route path="/signup" element={<EnhancedSignup />} />
              <Route path="/security" element={<SecurityCenter />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // Private routes
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="investments" element={<Investments />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/transactions" element={<AdminTransactions />} />
              <Route path="admin/payment-methods" element={<AdminPaymentMethods />} />
              <Route path="admin/payment-method-types" element={<AdminPaymentMethodTypes />} />
              <Route path="admin/referrals" element={<AdminReferrals />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </div>
    </ChatProvider>
    </Router>
  );
}

export default App;