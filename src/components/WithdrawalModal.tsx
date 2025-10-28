import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClickToCopy from './ClickToCopy';
import {
  X,
  AlertCircle,
  Smartphone,
  Wallet,
  Bitcoin,
  CreditCard,
  Banknote,
  Copy,
  Check,
  Plus,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/appwrite';
import { canMakeWithdrawal, checkProfileCompletion } from '../lib/verification';
import PaymentMethodSelector from './PaymentMethodSelector';
import VerificationBadge from './VerificationBadge';
import type { InvestmentPlan, PaymentMethodType } from '../types/appwrite';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod?: () => void;
}

interface FormData {
  amount: string;
  withdrawalMethod: string;
  accountDetails: string;
  selectedPaymentMethodType: PaymentMethodType | null;
}

interface Errors {
  amount?: string;
  withdrawalMethod?: string;
  accountDetails?: string;
  submit?: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onAddPaymentMethod }) => {
  const { userProfile, createWithdrawal, investments, transactions, paymentMethods } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    withdrawalMethod: '',
    accountDetails: '',
    selectedPaymentMethodType: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<boolean>(false);

  // Calculate available balance (earnings minus completed withdrawals)
  const totalEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const availableBalance = totalEarnings - totalWithdrawals;

  // Check if user can make withdrawals
  const canWithdraw = canMakeWithdrawal(userProfile);
  const profileCompletion = checkProfileCompletion(userProfile);

  // Get verified payment methods for withdrawal
  const verifiedPaymentMethods = paymentMethods.filter(method => method.status === 'verified');
  
  
  // Icon mapping for payment method types
  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'paypal': return Wallet;
      case 'venmo': return Smartphone;
      case 'cashapp': return Smartphone;
      case 'bitcoin': return Bitcoin;
      case 'ethereum': return Bitcoin;
      case 'usdt': return Bitcoin;
      default: return CreditCard;
    }
  };

  useEffect(() => {
    if (formData.withdrawalMethod) {
      const selectedMethod = verifiedPaymentMethods.find(method => method.$id === formData.withdrawalMethod);
      if (selectedMethod) {
        setShowQRCode(['venmo', 'cashapp', 'paypal', 'bitcoin', 'ethereum', 'usdt'].includes(selectedMethod.type));
      }
    } else {
      setShowQRCode(false);
    }
  }, [formData.withdrawalMethod, verifiedPaymentMethods]);

  // Copy account number to clipboard
  const copyAccountNumber = async (): Promise<void> => {
    if (userProfile?.accountNumber) {
      try {
        await navigator.clipboard.writeText(userProfile.accountNumber);
        setCopiedAccountNumber(true);
        setTimeout(() => setCopiedAccountNumber(false), 2000);
      } catch (err) {
        console.error('Failed to copy account number:', err);
      }
    }
  };

  // Get QR code image for selected withdrawal method
  const getQRCodeImage = (method: string): string | null => {
    switch (method) {
      case 'venmo':
        return venmoQR;
      case 'cashapp':
        return cashappQR;
      case 'paypal':
        return paypalQR;
      case 'crypto':
        return cryptoQR;
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) < 50) {
      newErrors.amount = 'Minimum withdrawal amount is $50';
    } else if (parseFloat(formData.amount) > availableBalance / 100) {
      newErrors.amount = 'Insufficient balance for withdrawal';
    }

    if (!formData.withdrawalMethod) {
      newErrors.withdrawalMethod = verifiedPaymentMethods.length === 0 
        ? 'Please add a verified payment method first'
        : 'Please select a withdrawal method';
    }

    if (!formData.accountDetails.trim()) {
      newErrors.accountDetails = 'Please provide your account details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      const selectedMethod = verifiedPaymentMethods.find(method => method.$id === formData.withdrawalMethod);
      const methodName = selectedMethod ? selectedMethod.name : formData.withdrawalMethod;
      const result = await createWithdrawal(amount, methodName, formData.accountDetails);
      
      if (result.success) {
        // Reset form and close modal
        setFormData({ amount: '', withdrawalMethod: '', accountDetails: '' });
        setErrors({});
        setShowQRCode(false);
        onClose();
      } else {
        // Show error message
        setErrors({ submit: result.error || 'Failed to create withdrawal request' });
      }
    } catch (error: any) {
      console.error('Withdrawal creation error:', error);
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const getWithdrawalMethodIcon = (methodId: string): React.ReactElement => {
    const method = verifiedPaymentMethods.find(m => m.$id === methodId);
    if (method) {
      const IconComponent = getPaymentMethodIcon(method.type);
      return <IconComponent className="w-5 h-5" />;
    }
    return <Wallet className="w-5 h-5" />;
  };

  const getWithdrawalMethodName = (methodId: string): string => {
    const method = verifiedPaymentMethods.find(m => m.$id === methodId);
    return method ? method.name : 'Unknown Method';
  };

  const getWithdrawalMethodDescription = (methodId: string): string => {
    const method = verifiedPaymentMethods.find(m => m.$id === methodId);
    if (method) {
      switch (method.type) {
        case 'paypal': return 'Global payment platform';
        case 'venmo': return 'Fast and secure mobile payments';
        case 'cashapp': return 'Quick cash transfers';
        case 'bitcoin': return 'Bitcoin cryptocurrency transfer';
        case 'ethereum': return 'Ethereum cryptocurrency transfer';
        case 'usdt': return 'USDT stablecoin transfer';
        default: return 'Payment method';
      }
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
            <p className="text-sm text-gray-600 mt-1">
              Withdraw your earnings to your preferred method
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Verification Warning */}
          {!canWithdraw && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                    Profile Verification Required
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    You need to complete your profile verification before making withdrawals.
                  </p>
                  <div className="flex items-center space-x-2">
                    <VerificationBadge 
                      status={profileCompletion.isComplete ? 'pending' : 'incomplete'} 
                      size="sm" 
                    />
                    <span className="text-xs text-yellow-600">
                      {profileCompletion.completionPercentage}% complete
                    </span>
                  </div>
                  {!profileCompletion.isComplete && (
                    <div className="mt-3">
                      <p className="text-xs text-yellow-700 mb-2">Missing fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {profileCompletion.missingFields.slice(0, 5).map((field, index) => (
                          <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            {field}
                          </span>
                        ))}
                        {profileCompletion.missingFields.length > 5 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            +{profileCompletion.missingFields.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Available Earnings */}
          {userProfile && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-900">Available Balance</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">
                    {formatCurrency(availableBalance)}
                  </p>
                  <p className="text-xs text-primary-700 mt-1">
                    Earnings minus completed withdrawals
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-700">Account #{userProfile.accountNumber}</p>
                  <button
                    type="button"
                    onClick={copyAccountNumber}
                    className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 mt-1"
                  >
                    {copiedAccountNumber ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="form-label">Withdrawal Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder={canWithdraw ? "0.00" : "Complete verification first"}
                min="50"
                step="0.01"
                disabled={!canWithdraw}
                className={`form-input pl-8 ${!canWithdraw ? 'bg-gray-100 cursor-not-allowed' : ''} ${errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <div className="flex items-center mt-2 text-sm text-danger-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: $50.00</p>
          </div>

          {/* Withdrawal Method */}
          <div>
            <label className="form-label">Withdrawal Method</label>
            
            {verifiedPaymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 mt-2">
                {verifiedPaymentMethods.map((method) => (
                  <motion.label
                    key={method.$id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.withdrawalMethod === method.$id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value={method.$id}
                      checked={formData.withdrawalMethod === method.$id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                      formData.withdrawalMethod === method.$id
                        ? 'border-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.withdrawalMethod === method.$id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500"></div>
                      )}
                    </div>
                    <div className={`mr-3 ${
                      formData.withdrawalMethod === method.$id ? 'text-primary-600' : 'text-gray-600'
                    }`}>
                      {getWithdrawalMethodIcon(method.$id)}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        formData.withdrawalMethod === method.$id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {method.name}
                      </div>
                      <ClickToCopy text={method.accountNumber} copyMessage="Account number copied to clipboard!">
                        <div className={`text-sm ${
                          formData.withdrawalMethod === method.$id ? 'text-primary-600' : 'text-gray-500'
                        }`}>
                          {method.accountNumber}
                        </div>
                      </ClickToCopy>
                      <div className="text-xs text-gray-500">{getWithdrawalMethodDescription(method.$id)}</div>
                    </div>
                    {method.isDefault && (
                      <div className="ml-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      </div>
                    )}
                  </motion.label>
                ))}
              </div>
            ) : (
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Verified Payment Methods</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You need to add and verify at least one payment method before you can make withdrawals.
                  </p>
                  {onAddPaymentMethod && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onAddPaymentMethod();
                      }}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {verifiedPaymentMethods.length > 0 && onAddPaymentMethod && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddPaymentMethod();
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Payment Method
                </button>
              </div>
            )}
            
            {errors.withdrawalMethod && (
              <div className="flex items-center mt-2 text-sm text-danger-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.withdrawalMethod}
              </div>
            )}
          </div>

          {/* Account Details */}
          <div>
            <label className="form-label">Account Details</label>
            <textarea
              name="accountDetails"
              value={formData.accountDetails}
              onChange={handleChange}
              placeholder="Enter your account details (e.g., email, phone number, wallet address, bank account details)"
              rows={3}
              className={`form-input ${errors.accountDetails ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.accountDetails && (
              <div className="flex items-center mt-2 text-sm text-danger-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.accountDetails}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Provide the account details where you want to receive your withdrawal
            </p>
          </div>

          {/* QR Code Display */}
          {showQRCode && formData.withdrawalMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-2">
                {getWithdrawalMethodName(formData.withdrawalMethod)} QR Code
              </h4>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                  <img
                    src={getQRCodeImage(formData.withdrawalMethod) || ''}
                    alt={`${getWithdrawalMethodName(formData.withdrawalMethod)} QR Code`}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Scan this QR code with your {getWithdrawalMethodName(formData.withdrawalMethod)} app to complete the withdrawal.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure to include your account number: #{userProfile?.accountNumber}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !canWithdraw}
              className={`btn-primary py-2 px-1 flex-1 ${!canWithdraw ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : !canWithdraw ? 'Complete Verification First' : 'Withdrawal'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default WithdrawalModal;
