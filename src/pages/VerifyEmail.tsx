import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    if (userId && secret) {
      handleVerification();
    }
  }, [userId, secret]);

  const handleVerification = async () => {
    if (!userId || !secret) {
      setError('Invalid verification link');
      setVerificationStatus('error');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyEmail(userId, secret);
      
      if (result.success) {
        setVerificationStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Verification failed');
        setVerificationStatus('error');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendVerificationEmail();
      if (result.success) {
        // Show success message
      }
    } catch (error) {
      // Error is handled by the toast in the context
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
          <p className="text-gray-300">Please wait while we verify your email address.</p>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-gray-300 mb-6">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#d8ed36] text-black w-full py-3 px-6 rounded-lg font-semibold hover:bg-[#c4d630] transition-colors"
            >
              Go to Login
            </button>
            <p className="text-sm text-gray-400">
              You will be redirected automatically in a few seconds...
            </p>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-gray-300 mb-6">
            {error || 'There was an error verifying your email address.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="bg-[#d8ed36] text-black w-full py-3 px-6 rounded-lg font-semibold hover:bg-[#c4d630] transition-colors disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="text-[#d8ed36] hover:text-[#c4d630] font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }

    // Default state - no verification parameters
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#d8ed36] rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
        <p className="text-gray-300 mb-6">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="bg-[#d8ed36] text-black w-full py-3 px-6 rounded-lg font-semibold hover:bg-[#c4d630] transition-colors disabled:opacity-50"
          >
            {isResending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend Verification Email
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-[#d8ed36] hover:text-[#c4d630] font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center mb-8"
      >
        <button
          onClick={() => navigate('/login')}
          className="absolute left-0 top-0 flex items-center text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </button>
        
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center">
            <Mail className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white ml-3">InvestFlow</h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative max-w-md mx-auto"
      >
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
          {renderContent()}
        </div>
      </motion.div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mt-8 text-center"
      >
        <div className="text-sm text-gray-400 max-w-md mx-auto">
          <p className="mb-2">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Wait a few minutes and try resending</li>
            <li>• Contact support if you continue to have issues</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
