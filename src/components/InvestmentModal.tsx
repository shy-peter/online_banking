import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Smartphone, Wallet, Bitcoin, AlertCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInvestmentPlan, formatCurrency } from '../lib/appwrite';
import LoadingSpinner from './LoadingSpinner';
import PaymentMethodSelector from './PaymentMethodSelector';
import type { InvestmentPlan, PaymentMethodType } from '../types/appwrite';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  amount: string;
  paymentMethod: string;
  bonusCode: string;
  selectedPaymentMethodType: PaymentMethodType | null;
}

interface Errors {
  amount?: string;
  paymentMethod?: string;
  bonusCode?: string;
  submit?: string;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose }) => {
  const { createInvestment, userProfile, validateBonusCode } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    paymentMethod: '',
    bonusCode: '',
    selectedPaymentMethodType: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<boolean>(false);
  const [bonusCodeInfo, setBonusCodeInfo] = useState<{ dailyRate: number; monthlyRate: number; description?: string } | null>(null);
  const [validatingBonusCode, setValidatingBonusCode] = useState<boolean>(false);

  useEffect(() => {
    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      if (amount >= 100) {
        const plan = getInvestmentPlan(amount);
        setSelectedPlan(plan);
        // Reset payment method if it's not available for the new amount
        if (plan && !plan.paymentMethods.includes(formData.paymentMethod)) {
          setFormData(prev => ({ ...prev, paymentMethod: '' }));
          setShowQRCode(false);
        }
      } else {
        setSelectedPlan(null);
        setShowQRCode(false);
      }
    } else {
      setSelectedPlan(null);
      setShowQRCode(false);
    }
  }, [formData.amount]);

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

  // Get QR code image for selected payment method
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

  // Get payment tag for the method
  const getPaymentTag = (method: string): string => {
    switch (method) {
      case 'venmo':
        return 'investflowvenmo';
      case 'cashapp':
        return 'investflowcashapp';
      case 'paypal':
        return 'investflowpaypal';
      case 'crypto':
        return 'investflowcrypto';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Show QR code when payment method is selected
    if (name === 'paymentMethod' && value) {
      setShowQRCode(true);
    }
    
    // Clear errors when user starts typing
    if (errors[name as keyof Errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    
    if (!formData.amount || parseFloat(formData.amount) < 100) {
      newErrors.amount = 'Minimum investment amount is $100';
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (!selectedPlan) {
      newErrors.amount = 'Invalid investment amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBonusCodeValidation = async (code: string): Promise<void> => {
    if (!code.trim()) {
      setBonusCodeInfo(null);
      setErrors(prev => ({ ...prev, bonusCode: undefined }));
      return;
    }

    setValidatingBonusCode(true);
    try {
      const result = await validateBonusCode(code);
      if (result.success && result.bonusCode) {
        setBonusCodeInfo({
          dailyRate: result.bonusCode.dailyRate,
          monthlyRate: result.bonusCode.monthlyRate,
          description: result.bonusCode.description
        });
        setErrors(prev => ({ ...prev, bonusCode: undefined }));
      } else {
        setBonusCodeInfo(null);
        setErrors(prev => ({ ...prev, bonusCode: result.error || 'Invalid bonus code' }));
      }
    } catch (error) {
      setBonusCodeInfo(null);
      setErrors(prev => ({ ...prev, bonusCode: 'Failed to validate bonus code' }));
    } finally {
      setValidatingBonusCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const amount = parseFloat(formData.amount);
      const result = await createInvestment(amount, formData.paymentMethod, formData.bonusCode || undefined);
      
      if (result.success) {
        // Reset form and close modal
        setFormData({ amount: '', paymentMethod: '', bonusCode: '' });
        setSelectedPlan(null);
        setErrors({});
        setShowQRCode(false);
        setBonusCodeInfo(null);
        onClose();
      } else {
        // Show error message
        setErrors({ submit: result.error || 'Failed to create investment' });
      }
    } catch (error: any) {
      console.error('Investment creation error:', error);
      setErrors({ submit: error.message || 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string): React.ReactElement => {
    switch (method) {
      case 'venmo':
        return <Smartphone className="w-5 h-5" />;
      case 'cashapp':
        return <Smartphone className="w-5 h-5" />;
      case 'paypal':
        return <Wallet className="w-5 h-5" />;
      case 'crypto':
        return <Bitcoin className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const getPaymentMethodName = (method: string): string => {
    switch (method) {
      case 'venmo':
        return 'Venmo';
      case 'cashapp':
        return 'CashApp';
      case 'paypal':
        return 'PayPal';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return method;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-soft-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">New Investment</h2>
              <p className="text-sm text-gray-600">Start earning high returns today</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Investment Amount */}
          <div>
            <label htmlFor="amount" className="form-label">
              Investment Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                id="amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min="100"
                step="0.01"
                required
                className={`input-field pl-10 ${errors.amount ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Enter amount (min. $100)"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            {errors.amount && (
              <div className="flex items-center mt-1 text-sm text-danger-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.amount}
              </div>
            )}
          </div>

          {/* Investment Plan Preview */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-50 border border-primary-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-primary-900">{selectedPlan.name}</h4>
                <span className="text-2xl font-bold text-primary-600">{selectedPlan.interestRate}%</span>
              </div>
              <p className="text-sm text-primary-700 mb-3">{selectedPlan.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-primary-600 font-medium">Monthly Income:</span>
                  <div className="text-primary-900 font-semibold">
                    {formData.amount ? formatCurrency((parseFloat(formData.amount) * (selectedPlan.interestRate / 100)) / 12 * 100) : '$0.00'}
                  </div>
                </div>
                <div>
                  <span className="text-primary-600 font-medium">Yearly Income:</span>
                  <div className="text-primary-900 font-semibold">
                    {formData.amount ? formatCurrency(parseFloat(formData.amount) * (selectedPlan.interestRate / 100) * 100) : '$0.00'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Method */}
          {selectedPlan && (
            <div>
              <PaymentMethodSelector
                onSelect={(paymentMethodType) => {
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: paymentMethodType.type,
                    selectedPaymentMethodType: paymentMethodType
                  }));
                }}
                showQRCode={true}
                title="Select Payment Method"
                description="Choose your preferred payment method for this investment"
              />
              {errors.paymentMethod && (
                <div className="flex items-center mt-2 text-sm text-danger-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.paymentMethod}
                </div>
              )}
            </div>
          )}

          {/* Bonus Code */}
          {selectedPlan && (
            <div>
              <label htmlFor="bonusCode" className="form-label">
                Bonus Code (Optional)
              </label>
              <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-3 shadow-sm ring-1 ring-green-200">
                <input
                  id="bonusCode"
                  name="bonusCode"
                  type="text"
                  className={`w-full px-3 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 ${errors.bonusCode ? 'text-red-600' : 'text-gray-900'}`}
                  placeholder="Enter bonus code for enhanced earnings"
                  value={formData.bonusCode}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, bonusCode: e.target.value }));
                    // Debounce validation
                    const timeoutId = setTimeout(() => {
                      handleBonusCodeValidation(e.target.value);
                    }, 500);
                    return () => clearTimeout(timeoutId);
                  }}
                />
                {validatingBonusCode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
              {errors.bonusCode && (
                <div className="flex items-center mt-1 text-sm text-danger-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.bonusCode}
                </div>
              )}
              {bonusCodeInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center mb-2">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Bonus Code Applied!</span>
                  </div>
                  {bonusCodeInfo.description && (
                    <p className="text-sm text-green-700 mb-2">{bonusCodeInfo.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">Daily Rate:</span>
                      <div className="text-green-900 font-semibold">
                        {bonusCodeInfo.dailyRate}%
                      </div>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">Monthly Rate:</span>
                      <div className="text-green-900 font-semibold">
                        {bonusCodeInfo.monthlyRate}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* QR Code Display */}
          {showQRCode && formData.paymentMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6"
            >
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {getPaymentMethodName(formData.paymentMethod)} Payment
                </h4>
                
                {/* QR Code Image */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <img
                      src={getQRCodeImage(formData.paymentMethod)}
                      alt={`${getPaymentMethodName(formData.paymentMethod)} QR Code`}
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>

                {/* Payment Tag */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Payment Tag:</p>
                  <div className="bg-white border border-gray-300 rounded-lg p-2 text-center">
                    <span className="font-mono text-lg font-semibold text-primary-600">
                      {getPaymentTag(formData.paymentMethod)}
                    </span>
                  </div>
                </div>

                {/* Account Number Reminder */}
                {userProfile?.accountNumber ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-2">⚠️ IMPORTANT: Include Your Account Number!</p>
                        <p className="mb-3">
                          Always include your unique account number as a comment/note when making payment to avoid loss of funds:
                        </p>
                        <div className="bg-white border border-yellow-300 rounded-lg p-3 flex items-center justify-between">
                          <span className="font-mono text-lg font-bold text-gray-900">
                            {userProfile.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={copyAccountNumber}
                            className="ml-2 p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Copy account number"
                          >
                            {copiedAccountNumber ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {copiedAccountNumber && (
                          <p className="text-xs text-green-600 mt-1">Account number copied!</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">📋 Account Number Required</p>
                        <p className="mb-3">
                          You need an account number for payment identification. 
                        </p>
                        <button
                          type="button"
                          onClick={() => window.location.href = '/profile'}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Get Account Number
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  Scan the QR code with your {getPaymentMethodName(formData.paymentMethod)} app to make payment
                </p>
              </div>
            </motion.div>
          )}

          {/* Important Notes */}
          {selectedPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Investments are subject to terms and conditions</li>
                    <li>Returns are calculated monthly and compounded</li>
                    <li>Processing time may vary by payment method</li>
                    {parseFloat(formData.amount) >= 100000 && (
                      <li>Amounts $100k+ require cryptocurrency payment</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-danger-600 mt-0.5" />
                <div className="text-sm text-danger-800">
                  <p className="font-medium mb-1">Investment Failed</p>
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedPlan || !formData.paymentMethod}
              className="btn-primary flex-1 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                `Invest ${formData.amount ? formatCurrency(parseFloat(formData.amount) * 100) : ''}`
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default InvestmentModal;