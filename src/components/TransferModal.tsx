import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mail, Hash, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/appwrite';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, createTransfer, validateRecipient, transactions } = useAuth();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<{
    name: string;
    email: string;
    accountNumber: string;
  } | null>(null);
  const [isValidatingRecipient, setIsValidatingRecipient] = useState(false);
  const [showTransferPhraseWarning, setShowTransferPhraseWarning] = useState(false);

  // Calculate available balance the same way as dashboard (from transactions)
  const totalEarnings = transactions
    .filter(t => (t.type === 'earning' || t.type === 'transfer_in') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => (t.type === 'withdrawal' || t.type === 'transfer_out') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const availableBalance = totalEarnings - totalWithdrawals;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validate recipient when typing
    if (name === 'recipient' && value.trim()) {
      validateRecipientAsync(value.trim());
    } else if (name === 'recipient' && !value.trim()) {
      setRecipientInfo(null);
    }
  };

  const validateRecipientAsync = async (identifier: string) => {
    setIsValidatingRecipient(true);
    try {
      const result = await validateRecipient(identifier);
      if (result.success && result.recipient) {
        setRecipientInfo({
          name: result.recipient.name,
          email: result.recipient.email,
          accountNumber: result.recipient.accountNumber
        });
      } else {
        setRecipientInfo(null);
      }
    } catch (error) {
      console.error('Error validating recipient:', error);
      setRecipientInfo(null);
    } finally {
      setIsValidatingRecipient(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient email or account number is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (amount * 100 > availableBalance) {
        newErrors.amount = 'Insufficient available balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has set transfer phrase first
    if (!userProfile?.secretPhrase) {
      setShowTransferPhraseWarning(true);
      return;
    }
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await createTransfer(
        formData.recipient.trim(),
        parseFloat(formData.amount),
        formData.description.trim() || undefined
      );

      if (result.success) {
        // Reset form
        setFormData({
          recipient: '',
          amount: '',
          description: ''
        });
        setRecipientInfo(null);
        onClose();
      }
    } catch (error) {
      console.error('Transfer error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      recipient: '',
      amount: '',
      description: ''
    });
    setRecipientInfo(null);
    setErrors({});
    setShowTransferPhraseWarning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Transfer Funds</h2>
                <p className="text-sm text-gray-600">Send money to another InvestFlow user</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Available Balance Display */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-1">Available Balance</div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatCurrency(availableBalance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Only available balance can be transferred
              </div>
            </div>
          </div>

          {/* Transfer Phrase Warning */}
          {showTransferPhraseWarning && !userProfile?.secretPhrase && (
            <div className="p-6 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">Transfer Phrase Required</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    You need to set up a transfer phrase before you can transfer funds. Please go to your profile settings to set it up.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      window.location.href = '/profile';
                    }}
                    className="text-sm font-medium text-yellow-600 hover:text-yellow-700 underline"
                  >
                    Go to Profile Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email or Account Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 text-white pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent ${
                    errors.recipient ? 'border-red-300' : recipientInfo ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email or account number"
                />
                {isValidatingRecipient && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#d8ed36]"></div>
                  </div>
                )}
                {recipientInfo && !isValidatingRecipient && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
              {errors.recipient && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.recipient}
                </p>
              )}
              {recipientInfo && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {recipientInfo.name}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {recipientInfo.email} • Account: {recipientInfo.accountNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  max={availableBalance / 100}
                  className={`w-full pl-10 bg-gray-800 text-white pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Availabel balance: {formatCurrency(availableBalance)}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-3 bg-gray-800 text-white py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent resize-none"
                  placeholder="Add a note for this transfer..."
                />
              </div>
            </div>

            {/* Transfer Summary */}
            {formData.amount && !errors.amount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Transfer Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount:</span>
                    <span className="font-medium text-blue-900">
                      {formatCurrency(parseFloat(formData.amount) * 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">From Balance:</span>
                    <span className="font-medium text-blue-900">
                      Available Balance
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Recipient:</span>
                    <span className="font-medium text-blue-900">
                      {recipientInfo ? recipientInfo.name : formData.recipient}
                    </span>
                  </div>
                  {recipientInfo && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">To Balance:</span>
                      <span className="font-medium text-blue-900">
                        Available Balance
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-blue-700">Remaining Available Balance:</span>
                    <span className="font-medium text-blue-900">
                      {formatCurrency(availableBalance - (parseFloat(formData.amount) * 100))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.recipient || !formData.amount}
                className="flex-1 px-4 py-2 text-sm font-medium text-[#160319] bg-[#67620d] rounded-lg hover:bg-[#e9df14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#dded63] mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Transfer
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransferModal;
