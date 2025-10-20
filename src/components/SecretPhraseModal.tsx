import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface SecretPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phrase: string) => Promise<boolean>;
  mode: 'setup' | 'verify';
  title?: string;
  description?: string;
}

const SecretPhraseModal: React.FC<SecretPhraseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  mode,
  title,
  description
}) => {
  const [phrase, setPhrase] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [showConfirmPhrase, setShowConfirmPhrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate random 6-digit phrase for setup mode
  const generateRandomPhrase = () => {
    const digits = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return result;
  };

  useEffect(() => {
    if (isOpen && mode === 'setup') {
      setPhrase(generateRandomPhrase());
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'setup') {
      if (phrase !== confirmPhrase) {
        setError('Secret phrases do not match');
        return;
      }
      if (phrase.length !== 6) {
        setError('Secret phrase must be exactly 6 digits');
        return;
      }
    } else {
      if (phrase.length !== 6) {
        setError('Secret phrase must be exactly 6 digits');
        return;
      }
    }

    setIsLoading(true);
    try {
      const success = await onConfirm(phrase);
      if (success) {
        onClose();
        setPhrase('');
        setConfirmPhrase('');
      } else {
        setError('Invalid secret phrase');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPhrase('');
      setConfirmPhrase('');
      setError('');
      onClose();
    }
  };

  const handlePhraseChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setPhrase(digitsOnly);
  };

  const handleConfirmPhraseChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setConfirmPhrase(digitsOnly);
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
                    <Lock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title || (mode === 'setup' ? 'Set Secret Phrase' : 'Enter Secret Phrase')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {description || (mode === 'setup' ? 'Create a 6-digit secret phrase for account security' : 'Enter your 6-digit secret phrase to continue')}
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

              {/* Warning for setup mode */}
              {mode === 'setup' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important Security Notice</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This secret phrase will be used to verify your identity when changing your password. 
                        Please save it securely and do not share it with anyone.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Secret Phrase Input */}
                <div>
                  <label className="form-label">
                    {mode === 'setup' ? 'Generated Secret Phrase' : 'Secret Phrase'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPhrase ? 'text' : 'password'}
                      value={phrase}
                      onChange={(e) => handlePhraseChange(e.target.value)}
                      className="form-input pr-10 text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      disabled={mode === 'setup' || isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPhrase(!showPhrase)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === 'setup' && (
                    <p className="text-xs text-gray-500 mt-1">
                      This phrase has been generated for you. Please confirm it below.
                    </p>
                  )}
                </div>

                {/* Confirm Phrase (only for setup mode) */}
                {mode === 'setup' && (
                  <div>
                    <label className="form-label">Confirm Secret Phrase</label>
                    <div className="relative">
                      <input
                        type={showConfirmPhrase ? 'text' : 'password'}
                        value={confirmPhrase}
                        onChange={(e) => handleConfirmPhraseChange(e.target.value)}
                        className="form-input pr-10 text-center text-2xl font-mono tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPhrase(!showConfirmPhrase)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showConfirmPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
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
                    disabled={isLoading || (mode === 'setup' && phrase !== confirmPhrase)}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {mode === 'setup' ? 'Confirm & Save' : 'Verify'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security Tips */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Security Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Store your secret phrase in a secure location</li>
                  <li>• Never share it with anyone</li>
                  <li>• Use it only for password recovery</li>
                  <li>• Contact support if you forget it</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SecretPhraseModal;
