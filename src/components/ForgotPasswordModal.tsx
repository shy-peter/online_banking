import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const { sendPasswordRecoveryEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendPasswordRecoveryEmail(email);
      
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Failed to send recovery email');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  const handleBackToForm = () => {
    setIsSuccess(false);
    setEmail('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isSuccess ? 'Check Your Email' : 'Reset Password'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isSuccess 
                        ? 'We sent you a recovery link'
                        : 'Enter your email to receive a reset link'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Email Sent Successfully!
                  </h4>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleBackToForm}
                      className="btn-secondary w-full py-3 md:py-4"
                    >
                      Send to Different Email
                    </button>
                    <button
                      onClick={handleClose}
                      className="btn-primary w-full py-3 md:py-4"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <strong>Didn't receive the email?</strong>
                    </p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li>• Check your spam/junk folder</li>
                      <li>• Make sure you entered the correct email</li>
                      <li>• Wait a few minutes and try again</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="form-label">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input pl-10 py-2 md:py-3"
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="btn-secondary flex-1 py-3 md:py-4 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Notice */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        For your security, password reset links expire after 1 hour. 
                        If you don't receive an email, please try again.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
