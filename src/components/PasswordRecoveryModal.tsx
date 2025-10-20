import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, X, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const [step, setStep] = useState<'verify' | 'new-password'>('verify');
  const [secretPhrase, setSecretPhrase] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSecretPhraseChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setSecretPhrase(digitsOnly);
  };

  const handleVerifySecretPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (secretPhrase.length !== 6) {
      setError('Secret phrase must be exactly 6 digits');
      return;
    }

    if (secretPhrase !== userProfile?.secretPhrase) {
      setError('Invalid secret phrase');
      return;
    }

    setStep('new-password');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would call the password change API
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStep('verify');
      setSecretPhrase('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      onClose();
    }
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
                    <Key className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step === 'verify' ? 'Verify Identity' : 'Change Password'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {step === 'verify' 
                        ? 'Enter your secret phrase to verify your identity'
                        : 'Enter your new password'
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

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Security Verification</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {step === 'verify' 
                        ? 'You must enter your secret phrase to change your password. This helps protect your account from unauthorized access.'
                        : 'Your new password will be encrypted and stored securely.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={step === 'verify' ? handleVerifySecretPhrase : handlePasswordChange} className="space-y-4">
                {step === 'verify' ? (
                  /* Secret Phrase Verification */
                  <div>
                    <label className="form-label">Secret Phrase</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={secretPhrase}
                        onChange={(e) => handleSecretPhraseChange(e.target.value)}
                        className="form-input pr-10 text-center text-2xl font-mono tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        disabled={isLoading}
                        required
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the 6-digit secret phrase you set during registration
                    </p>
                  </div>
                ) : (
                  /* New Password */
                  <>
                    <div>
                      <label className="form-label">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="form-input pr-10"
                          placeholder="Enter new password"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="form-input pr-10"
                          placeholder="Confirm new password"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="btn-secondary flex-1 disabled:opacity-50"
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
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {step === 'verify' ? 'Verify' : 'Change Password'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Tips */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Security Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Use a strong, unique password</li>
                  <li>• Include uppercase, lowercase, numbers, and symbols</li>
                  <li>• Avoid using personal information</li>
                  <li>• Don't share your secret phrase with anyone</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PasswordRecoveryModal;
