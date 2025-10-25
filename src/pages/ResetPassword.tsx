import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  useEffect(() => {
    if (!userId || !secret) {
      setError('Invalid reset link');
      setResetStatus('error');
    }
  }, [userId, secret]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId || !secret) return;

    setIsResetting(true);
    setError('');

    try {
      const result = await resetPassword(userId, secret, formData.password);
      
      if (result.success) {
        setResetStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Password reset failed');
        setResetStatus('error');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setResetStatus('error');
    } finally {
      setIsResetting(false);
    }
  };

  const renderContent = () => {
    if (resetStatus === 'success') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
          <p className="text-gray-300 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
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

    if (resetStatus === 'error') {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Reset Failed</h2>
          <p className="text-gray-300 mb-6">
            {error || 'There was an error resetting your password.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#d8ed36] text-black w-full py-3 px-6 rounded-lg font-semibold hover:bg-[#c4d630] transition-colors"
            >
              Back to Login
            </button>
            <p className="text-sm text-gray-400">
              You may need to request a new password reset link.
            </p>
          </div>
        </div>
      );
    }

    // Default state - show reset form
    return (
      <div>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#d8ed36] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
          <p className="text-gray-300">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className={`bg-gray-800 border border-gray-700 text-white w-full placeholder-gray-400 pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#d8ed36]" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-[#d8ed36]" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`bg-gray-800 border border-gray-700 text-white w-full placeholder-gray-400 pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#d8ed36]" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-[#d8ed36]" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isResetting}
            className="bg-[#d8ed36] text-black w-full py-3 text-lg font-semibold disabled:opacity-50 rounded-lg hover:bg-[#c4d630] transition-colors"
          >
            {isResetting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
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
            <Lock className="w-7 h-7 text-black" />
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

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mt-8 text-center"
      >
        <div className="text-sm text-gray-400 max-w-md mx-auto">
          <p className="mb-2">
            <strong>Password Security Tips:</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• Use at least 8 characters</li>
            <li>• Include uppercase and lowercase letters</li>
            <li>• Add numbers and special characters</li>
            <li>• Avoid using personal information</li>
            <li>• Don't reuse passwords from other accounts</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
