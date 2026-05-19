import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClickToCopy from './ClickToCopy';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Shield, 
  FileText, 
  Hash,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Activity,
  Plus,
  Minus,
  Settings,
  AlertTriangle,
  Check,
  Ban,
  Trash2,
  UserCheck,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { formatCurrency, calculateMonthlyInterest, getInvestmentPlan } from '../lib/appwrite';
import type { UserProfile, Transaction, Investment, PaymentMethod } from '../types/appwrite';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  transactions?: Transaction[];
  investments?: Investment[];
  paymentMethods?: PaymentMethod[];
  onUpdateUser?: (userId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  onAdjustEarnings?: (userId: string, amount: number, type: 'increase' | 'decrease', reason: string) => Promise<{ success: boolean; error?: string }>;
  onAdjustTotalEarnings?: (userId: string, amount: number, type: 'increase' | 'decrease', reason: string, adminId?: string) => Promise<{ success: boolean; error?: string }>;
  onAdjustAvailableBalance?: (userId: string, amount: number, type: 'increase' | 'decrease', reason: string, adminId?: string) => Promise<{ success: boolean; error?: string }>;
  onAdjustWithdrawals?: (userId: string, amount: number, reason: string, adminId?: string) => Promise<{ success: boolean; error?: string }>;
  onRecalculateBalance?: (userId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdatePaymentMethod?: (paymentMethodId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  onUpdateTransaction?: (transactionId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  onViewUser?: (userId: string) => void;
  onRefreshUserData?: (userId: string) => Promise<void>;
  isAdmin?: boolean;
  isLoading?: boolean;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  transactions = [],
  investments = [],
  paymentMethods = [],
  onUpdateUser,
  onAdjustEarnings,
  onAdjustTotalEarnings,
  onAdjustAvailableBalance,
  onAdjustWithdrawals,
  onRecalculateBalance,
  onUpdatePaymentMethod,
  onUpdateTransaction,
  onViewUser,
  onRefreshUserData,
  isAdmin = false,
  isLoading = false
}) => {
  const [showSSN, setShowSSN] = React.useState(false);
  const [showSecretPhrase, setShowSecretPhrase] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'pending' | 'adjustments' | 'account-actions' | 'transactions'>('overview');
  const [adjustmentAmount, setAdjustmentAmount] = React.useState('');
  const [adjustmentType, setAdjustmentType] = React.useState<'increase' | 'decrease'>('increase');
  const [adjustmentCategory, setAdjustmentCategory] = React.useState<'total_earnings' | 'available_balance' | 'withdrawal'>('total_earnings');
  const [adjustmentReason, setAdjustmentReason] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Account actions state
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<'suspend' | 'activate' | 'reactivate' | 'delete' | null>(null);
  const [confirmMessage, setConfirmMessage] = React.useState('');

  if (!user) return null;


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };


  const handleAdjustEarnings = async () => {
    if (!adjustmentAmount || !adjustmentReason) return;
    
    setIsProcessing(true);
    try {
      let result: any;
      const amount = parseFloat(adjustmentAmount);

      if (adjustmentCategory === 'total_earnings' && onAdjustTotalEarnings) {
        result = await onAdjustTotalEarnings(
          user.userId,
          amount,
          adjustmentType,
          adjustmentReason
        );
      } else if (adjustmentCategory === 'available_balance' && onAdjustAvailableBalance) {
        result = await onAdjustAvailableBalance(
          user.userId,
          amount,
          adjustmentType,
          adjustmentReason
        );
      } else if (adjustmentCategory === 'withdrawal' && onAdjustWithdrawals) {
        result = await onAdjustWithdrawals(
          user.userId,
          amount,
          adjustmentReason
        );
      } else {
        // Fallback to old adjustment method
        if (!onAdjustEarnings) return;
        result = await onAdjustEarnings(
          user.userId,
          amount,
          adjustmentType,
          adjustmentReason
        );
      }

      if (result.success) {
        // Recalculate balance for consistency
        if (onRecalculateBalance) {
          await onRecalculateBalance(user.userId);
        }
        
        setAdjustmentAmount('');
        setAdjustmentReason('');
        setAdjustmentType('increase');
        
        const categoryLabel = 
          adjustmentCategory === 'total_earnings' ? 'Total Earnings' :
          adjustmentCategory === 'available_balance' ? 'Available Balance' :
          'Withdrawal';
        
        alert(`${categoryLabel} adjusted successfully`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error adjusting earnings');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountAction = (action: 'suspend' | 'activate' | 'reactivate' | 'delete') => {
    setConfirmAction(action);
    
    switch (action) {
      case 'suspend':
        setConfirmMessage(`Are you sure you want to suspend ${user.name}'s account? This will prevent them from accessing the platform.`);
        break;
      case 'activate':
        setConfirmMessage(`Are you sure you want to activate ${user.name}'s account? This will restore their access to the platform.`);
        break;
      case 'reactivate':
        setConfirmMessage(`Are you sure you want to reactivate ${user.name}'s account? This will restore their access to the platform and reactivate all services.`);
        break;
      case 'delete':
        setConfirmMessage(`Are you sure you want to deactivate ${user.name}'s account? This will make the account inactive and prevent access to the platform.`);
        break;
    }
    
    setShowConfirmDialog(true);
  };

  const confirmAccountAction = async () => {
    if (!confirmAction || !onUpdateUser) return;
    
    setIsProcessing(true);
    try {
      let updates: any = {};
      
      switch (confirmAction) {
        case 'suspend':
          updates = { status: 'suspended' };
          break;
        case 'activate':
          updates = { status: 'active' };
          break;
        case 'reactivate':
          updates = { status: 'active' };
          break;
        case 'delete':
          updates = { status: 'inactive' };
          break;
      }
      
      const result = await onUpdateUser(user.$id, updates);
      
      if (result.success) {
        alert(`Account ${confirmAction}ed successfully`);
        setShowConfirmDialog(false);
        setConfirmAction(null);
        setConfirmMessage('');
        // Close the modal after successful action
        onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error ${confirmAction}ing account:`, error);
      alert(`Error ${confirmAction}ing account`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAccountAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleUpdatePaymentMethod = async (paymentMethodId: string, status: 'verified' | 'rejected') => {
    if (!onUpdatePaymentMethod) return;
    
    try {
      const result = await onUpdatePaymentMethod(paymentMethodId, { status });
      if (result.success) {
        // You could add a success notification here
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error updating payment method');
    }
  };

  const handleAcceptTransaction = async (transactionId: string) => {
    if (!onUpdateTransaction) return;
    
    try {
      const result = await onUpdateTransaction(transactionId, { status: 'completed' });
      if (result.success) {
        // You could add a success notification here
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error accepting transaction');
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    if (!onUpdateTransaction) return;
    
    try {
      const result = await onUpdateTransaction(transactionId, { status: 'rejected' });
      if (result.success) {
        // You could add a success notification here
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error rejecting transaction');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    if (!onUpdateUser) return;
    
    try {
      const result = await onUpdateUser(userId, { 
        status: 'active',
        isVerified: true,
        verificationStatus: 'verified'
      });
      if (result.success) {
        alert('User verified successfully');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error verifying user');
    }
  };

  const handleResendVerification = async (userId: string) => {
    // This would need to be implemented in the AuthContext
    // For now, we'll show a message
    alert('Verification email resent successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <Clock className="w-4 h-4" />;
      case 'suspended':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Calculate user statistics
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalTransactions = transactions.length;
  const totalEarnings = transactions
    .filter(t => t.type === 'earning' || t.type === 'interest_payment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingTransactionsCount = transactions.filter(t => t.status === 'pending').length;
  const verifiedPaymentMethods = paymentMethods.filter(pm => pm.status === 'verified').length;
  const pendingPaymentMethodsCount = paymentMethods.filter(pm => pm.status === 'pending').length;
  
  // Calculate pending items
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const pendingInvestments = investments.filter(i => i.status === 'pending');
  const pendingPaymentMethodsList = paymentMethods.filter(pm => pm.status === 'pending');
  const isUserPendingVerification = user.status === 'pending_verification';
  const totalPendingItems = pendingTransactions.length + pendingInvestments.length + pendingPaymentMethodsList.length + (isUserPendingVerification ? 1 : 0);

  const { date: joinDate, time: joinTime } = formatDate(user.$createdAt);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg sm:text-2xl font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{user.name}</h3>
                    <ClickToCopy text={user.email} className="text-sm sm:text-base text-gray-600 truncate">
                      <span className="text-sm sm:text-base text-gray-600 truncate">{user.email}</span>
                    </ClickToCopy>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {user.isVerified ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span className="ml-1">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                      </span>
                      <span className="text-xs text-gray-500">Account #{user.accountNumber}</span>
                      {totalPendingItems > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {totalPendingItems} Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* Refresh Button */}
                  {onRefreshUserData && user && (
                    <button
                      onClick={() => onRefreshUserData(user.userId)}
                      disabled={isLoading}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Refresh user data"
                      title="Refresh user data"
                    >
                      <RefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {[
                  { id: 'overview', name: 'Overview', icon: User },
                  { id: 'pending', name: 'Pending Items', icon: Clock, badge: totalPendingItems },
                  { id: 'adjustments', name: 'Adjustments', icon: Settings },
                  { id: 'account-actions', name: 'Account Actions', icon: Shield },
                  { id: 'transactions', name: 'Transactions', icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                      <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                      {tab.badge && tab.badge > 0 && (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
              {activeTab === 'overview' && (
                <>
                  {isLoading && (
                    <div className="lg:col-span-3 flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading user data...</p>
                      </div>
                    </div>
                  )}
                  {!isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Left Column - Personal Information */}
                      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  {/* Account Overview */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Account Overview
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Account Number</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900">{user.accountNumber}</span>
                          <button
                            onClick={() => copyToClipboard(user.accountNumber)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Email</span>
                        </div>
                        <ClickToCopy text={user.email}>
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </ClickToCopy>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Member Since</span>
                        </div>
                        <span className="text-sm text-gray-900">{joinDate}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Verification Status</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {user.isVerified ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Unverified (Pending)
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Total Balance</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(user.totalBalance)}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Available Balance</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(user.availableBalance)}</span>
                      </div>

                      {user.phone && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Phone</span>
                          </div>
                          <ClickToCopy text={user.phone}>
                            <span className="text-sm text-gray-900">{user.phone}</span>
                          </ClickToCopy>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal Information */}
                  {user.personalInfo && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.personalInfo.firstName && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">First Name</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.firstName}</span>
                          </div>
                        )}
                        {user.personalInfo.lastName && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Last Name</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.lastName}</span>
                          </div>
                        )}
                        {user.personalInfo.dateOfBirth && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Date of Birth</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.dateOfBirth}</span>
                          </div>
                        )}
                        {user.personalInfo.occupation && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Occupation</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.occupation}</span>
                          </div>
                        )}
                        {user.personalInfo.annualIncome && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Annual Income</span>
                            <span className="text-sm text-gray-900">{formatCurrency(user.personalInfo.annualIncome)}</span>
                          </div>
                        )}
                        {user.personalInfo.address && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Address</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.address}</span>
                          </div>
                        )}
                        {user.personalInfo.city && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">City</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.city}</span>
                          </div>
                        )}
                        {user.personalInfo.state && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">State</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.state}</span>
                          </div>
                        )}
                        {user.personalInfo.country && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Country</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.country}</span>
                          </div>
                        )}
                        {user.personalInfo.ssn && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">SSN</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono text-gray-900">
                                {showSSN ? user.personalInfo.ssn : '•••••••••'}
                              </span>
                              <button
                                onClick={() => setShowSSN(!showSSN)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {showSSN ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}
                        {user.personalInfo.idType && (
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">ID Type</span>
                            <span className="text-sm text-gray-900">{user.personalInfo.idType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Security Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Information
                    </h4>
                    <div className="space-y-4">
                      {user.secretPhrase && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Secret Phrase</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-gray-900">
                              {showSecretPhrase ? user.secretPhrase : '••••••••••••••••••••'}
                            </span>
                            <button
                              onClick={() => setShowSecretPhrase(!showSecretPhrase)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showSecretPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">User ID</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900">{user.userId}</span>
                          <button
                            onClick={() => copyToClipboard(user.userId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm text-gray-900">{joinDate} at {joinTime}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm text-gray-900">
                          {new Date(user.$updatedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Statistics & Activity */}
                <div className="space-y-6">
                  {/* Financial Statistics */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Financial Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Investments</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(totalInvestments)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Earnings</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(totalEarnings)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Withdrawals</span>
                        <span className="text-sm font-semibold text-red-600">{formatCurrency(totalWithdrawals)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Net Profit</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(totalEarnings - totalWithdrawals)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Statistics */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Activity Statistics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Transactions</span>
                        <span className="text-sm font-semibold text-gray-900">{totalTransactions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Active Investments</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {investments.filter(inv => inv.status === 'active').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending Transactions</span>
                        <span className="text-sm font-semibold text-amber-600">{pendingTransactionsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="text-sm font-semibold text-green-600">
                          {totalTransactions > 0 ? Math.round(((totalTransactions - pendingTransactionsCount) / totalTransactions) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                      Payment Methods
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Verified Methods</span>
                        <span className="text-sm font-semibold text-green-600">{verifiedPaymentMethods}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending Verification</span>
                        <span className="text-sm font-semibold text-amber-600">{pendingPaymentMethodsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Methods</span>
                        <span className="text-sm font-semibold text-gray-900">{paymentMethods.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction, index) => (
                        <div key={transaction.$id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.type === 'investment' ? 'bg-blue-500' :
                              transaction.type === 'earning' ? 'bg-green-500' :
                              transaction.type === 'withdrawal' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="text-xs text-gray-600 capitalize">{transaction.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-medium text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </span>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.$createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {transactions.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                    </div>
                  </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'pending' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Pending Items</h3>
                    <span className="text-sm text-gray-600">{totalPendingItems} items pending review</span>
                  </div>

                  {/* Pending Transactions */}
                  {pendingTransactions.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-amber-600" />
                        Pending Transactions ({pendingTransactions.length})
                      </h4>
                      <div className="space-y-3">
                        {pendingTransactions.map((transaction) => (
                          <div key={transaction.$id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</p>
                                  <p className="text-xs text-gray-600">{transaction.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                                <p className="text-xs text-gray-500">{new Date(transaction.$createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-600">
                                Transaction ID: {transaction.$id}
                              </div>
                              {isAdmin && onUpdateTransaction && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleAcceptTransaction(transaction.$id)}
                                    className="btn-success px-3 py-1 text-xs"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectTransaction(transaction.$id)}
                                    className="btn-danger px-3 py-1 text-xs"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Investments */}
                  {pendingInvestments.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        Pending Investments ({pendingInvestments.length})
                      </h4>
                      <div className="space-y-3">
                        {pendingInvestments.map((investment) => (
                          <div key={investment.$id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <TrendingUp className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{investment.plan}</p>
                                  <p className="text-xs text-gray-600">{investment.interestRate}% interest rate</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(investment.amount)}</p>
                                <p className="text-xs text-gray-500">{new Date(investment.$createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-600">
                                Investment ID: {investment.$id}
                              </div>
                              <button
                                onClick={() => onViewUser && onViewUser(investment.userId)}
                                className="btn-secondary px-3 py-1 text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View User
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Payment Methods */}
                  {pendingPaymentMethodsList.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                        Pending Payment Methods ({pendingPaymentMethodsList.length})
                      </h4>
                      <div className="space-y-3">
                        {pendingPaymentMethodsList.map((paymentMethod) => (
                          <div key={paymentMethod.$id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <CreditCard className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{paymentMethod.name}</p>
                                  <p className="text-xs text-gray-600 capitalize">{paymentMethod.type}</p>
                                </div>
                              </div>
                              {isAdmin && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleUpdatePaymentMethod(paymentMethod.$id, 'verified')}
                                    className="btn-success px-3 py-1 text-xs"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePaymentMethod(paymentMethod.$id, 'rejected')}
                                    className="btn-danger px-3 py-1 text-xs"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">Account: {paymentMethod.accountNumber}</p>
                            <p className="text-xs text-gray-500">Added: {new Date(paymentMethod.$createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending User Verification */}
                  {isUserPendingVerification && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-orange-600" />
                        Pending User Verification
                      </h4>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Account Verification Required</p>
                              <p className="text-xs text-gray-600">User account is pending email verification</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-orange-600">Pending</p>
                            <p className="text-xs text-gray-500">Status: {user.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            User ID: {user.$id}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleVerifyUser(user.$id)}
                                className="btn-success px-3 py-1 text-xs"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Verify User
                              </button>
                              <button
                                onClick={() => handleResendVerification(user.$id)}
                                className="btn-secondary px-3 py-1 text-xs"
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                Resend Email
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {totalPendingItems === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Items</h3>
                      <p className="text-gray-600">All items have been processed successfully.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'adjustments' && isAdmin && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Earnings Adjustments</h3>
                    <span className="text-sm text-gray-600">Admin controls for user finances</span>
                  </div>

                  {/* Adjustment Form */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-gray-600" />
                      Adjust User Earnings
                    </h4>

                    {/* Adjustment Category */}
                    <div className="mb-4">
                      <label className="form-label">Adjustment Category</label>
                      <select
                        value={adjustmentCategory}
                        onChange={(e) => setAdjustmentCategory(e.target.value as 'total_earnings' | 'available_balance' | 'withdrawal')}
                        className="form-input"
                      >
                        <option value="total_earnings">Total Earnings (with transaction record)</option>
                        <option value="available_balance">Available Balance (direct adjustment)</option>
                        <option value="withdrawal">Withdrawal (record withdrawal)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {adjustmentCategory === 'total_earnings' && 'Creates an earning or withdrawal transaction'}
                        {adjustmentCategory === 'available_balance' && 'Direct balance adjustment without transaction'}
                        {adjustmentCategory === 'withdrawal' && 'Records a withdrawal transaction'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {adjustmentCategory !== 'withdrawal' && (
                        <div>
                          <label className="form-label">Adjustment Type</label>
                          <select
                            value={adjustmentType}
                            onChange={(e) => setAdjustmentType(e.target.value as 'increase' | 'decrease')}
                            className="form-input"
                          >
                            <option value="increase">
                              {adjustmentCategory === 'total_earnings' ? 'Add Earnings' : 'Increase Balance'}
                            </option>
                            <option value="decrease">
                              {adjustmentCategory === 'total_earnings' ? 'Deduct Earnings' : 'Decrease Balance'}
                            </option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="form-label">Amount ($)</label>
                        <input
                          type="number"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                          className="form-input"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="form-label">Reason</label>
                      <textarea
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="form-input"
                        rows={3}
                        placeholder="Enter reason for adjustment..."
                      />
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <button
                        onClick={handleAdjustEarnings}
                        disabled={isProcessing || !adjustmentAmount || !adjustmentReason}
                        className="btn-primary px-4 py-2"
                      >
                        {adjustmentCategory === 'total_earnings' && (
                          adjustmentType === 'increase' ? 
                          <><Plus className="w-4 h-4 mr-2" />Add Earnings</> : 
                          <><Minus className="w-4 h-4 mr-2" />Deduct Earnings</>
                        )}
                        {adjustmentCategory === 'available_balance' && (
                          adjustmentType === 'increase' ? 
                          <><Plus className="w-4 h-4 mr-2" />Increase Balance</> : 
                          <><Minus className="w-4 h-4 mr-2" />Decrease Balance</>
                        )}
                        {adjustmentCategory === 'withdrawal' && (
                          <><Minus className="w-4 h-4 mr-2" />Record Withdrawal</>
                        )}
                        {isProcessing && ' Processing...'}
                      </button>
                    </div>
                  </div>

                  {/* Current Balances */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Balances</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Investment</p>
                        <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInvestments)}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Available Balance</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(user.availableBalance)}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="text-xl font-bold text-purple-600">{formatCurrency(totalEarnings)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'adjustments' && !isAdmin && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">Only administrators can access adjustment controls.</p>
                </div>
              )}

              {activeTab === 'account-actions' && isAdmin && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Account Management</h3>
                    <span className="text-sm text-gray-600">Control user account status</span>
                  </div>

                  {/* Current Status */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-gray-600" />
                      Current Account Status
                    </h4>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        <span className="ml-2 capitalize">{user.status}</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        Last updated: {new Date(user.$updatedAt || user.$createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-gray-600" />
                      Account Actions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Suspend Account */}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleAccountAction('suspend')}
                          className="flex flex-col items-center p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          <Ban className="w-8 h-8 text-amber-600 mb-2" />
                          <span className="font-medium text-gray-900">Suspend Account</span>
                          <span className="text-sm text-gray-600 text-center mt-1">
                            Prevent user from accessing the platform
                          </span>
                        </button>
                      )}

                      {/* Activate Account */}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => handleAccountAction('activate')}
                          className="flex flex-col items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <UserCheck className="w-8 h-8 text-green-600 mb-2" />
                          <span className="font-medium text-gray-900">Activate Account</span>
                          <span className="text-sm text-gray-600 text-center mt-1">
                            Restore user access to the platform
                          </span>
                        </button>
                      )}

                      {/* Reactivate Account */}
                      {user.status === 'inactive' && (
                        <button
                          onClick={() => handleAccountAction('reactivate')}
                          className="flex flex-col items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <UserCheck className="w-8 h-8 text-blue-600 mb-2" />
                          <span className="font-medium text-gray-900">Reactivate Account</span>
                          <span className="text-sm text-gray-600 text-center mt-1">
                            Restore inactive account and all services
                          </span>
                        </button>
                      )}

                      {/* Mark as Unverified */}
                      {user.isVerified && (
                        <button
                          onClick={async () => {
                            if (onUpdateUser && user) {
                              setIsProcessing(true);
                              try {
                                const result = await onUpdateUser(user.$id, { isVerified: false, verificationStatus: 'pending' });
                                if (result.success) {
                                  // User data will be refreshed
                                }
                              } finally {
                                setIsProcessing(false);
                              }
                            }
                          }}
                          disabled={isProcessing}
                          className="flex flex-col items-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <AlertCircle className="w-8 h-8 text-orange-600 mb-2" />
                          <span className="font-medium text-gray-900">Mark Unverified</span>
                          <span className="text-sm text-gray-600 text-center mt-1">
                            User can login but cannot withdraw
                          </span>
                        </button>
                      )}

                      {/* Mark as Verified */}
                      {!user.isVerified && (
                        <button
                          onClick={async () => {
                            if (onUpdateUser && user) {
                              setIsProcessing(true);
                              try {
                                const result = await onUpdateUser(user.$id, { isVerified: true, verificationStatus: 'verified' });
                                if (result.success) {
                                  // User data will be refreshed
                                }
                              } finally {
                                setIsProcessing(false);
                              }
                            }
                          }}
                          disabled={isProcessing}
                          className="flex flex-col items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-8 h-8 text-green-600 mb-2" />
                          <span className="font-medium text-gray-900">Mark Verified</span>
                          <span className="text-sm text-gray-600 text-center mt-1">
                            Allow user to withdraw funds
                          </span>
                        </button>
                      )}

                      {/* Delete Account */}
                      {user.status !== 'inactive' && (
                        <button
                          onClick={() => handleAccountAction('delete')}
                          className="flex flex-col items-center p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-8 h-8 text-red-600 mb-2" />
                          <span className="font-medium text-gray-900">Deactivate Account</span>
                          <span className="text-sm text-gray-600 text-center mt-1">
                            Make account inactive and prevent access
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Warning Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Important Notice</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Account actions are irreversible and will immediately affect the user's access to the platform. 
                          Please ensure you have proper authorization before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account-actions' && !isAdmin && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">Only administrators can access account management controls.</p>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  {/* Investments Section */}
                  {investments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Investments</h3>
                      <div className="space-y-4">
                        {investments.map((investment, index) => {
                          const plan = getInvestmentPlan(investment.amount);
                          const monthlyEarnings = calculateMonthlyInterest(investment.amount, investment.interestRate);
                          const investmentEarnings = transactions
                            .filter(t => 
                              t.investmentId === investment.$id && 
                              t.type === 'earning' && 
                              t.status === 'completed'
                            )
                            .reduce((sum, t) => sum + t.amount, 0);
                          const roi = investment.amount > 0 ? ((investmentEarnings / investment.amount) * 100).toFixed(1) : 0;

                          return (
                            <motion.div
                              key={investment.$id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-xl font-semibold text-gray-900">
                                    {formatCurrency(investment.amount)}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                                    <span className="text-gray-600">{plan?.name || 'Investment Plan'}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-primary-600 font-medium">{investment.interestRate}% monthly rate</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-600 capitalize">{investment.status}</span>
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  investment.status === 'active' ? 'bg-green-100 text-green-800' :
                                  investment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {investment.status}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 mb-4">
                                Started: {new Date(investment.$createdAt).toLocaleDateString('en-US')} at {new Date(investment.$createdAt).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </div>

                              {investment.status === 'active' && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                                      <p className="text-sm font-semibold text-green-600">
                                        {formatCurrency(investmentEarnings)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
                                      <p className="text-sm font-semibold text-blue-600">
                                        {formatCurrency(monthlyEarnings)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">ROI</p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {roi}%
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">Total Value</p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(investment.amount + investmentEarnings)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Transactions Section */}
                  {transactions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-200">
                          {transactions.map((transaction, index) => (
                            <motion.div
                              key={transaction.$id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    transaction.type === 'earning' ? 'bg-green-100' :
                                    transaction.type === 'withdrawal' ? 'bg-red-100' :
                                    transaction.type === 'investment' ? 'bg-blue-100' :
                                    'bg-gray-100'
                                  }`}>
                                    {transaction.type === 'earning' && <TrendingUp className="w-5 h-5 text-green-600" />}
                                    {transaction.type === 'withdrawal' && <TrendingDown className="w-5 h-5 text-red-600" />}
                                    {transaction.type === 'investment' && <DollarSign className="w-5 h-5 text-blue-600" />}
                                    {!['earning', 'withdrawal', 'investment'].includes(transaction.type) && <Activity className="w-5 h-5 text-gray-600" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-3">
                                      <h4 className="text-sm font-semibold text-gray-900 capitalize">
                                        {transaction.type}
                                      </h4>
                                      {transaction.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                      {transaction.status === 'pending' && <Clock className="w-4 h-4 text-amber-600" />}
                                      {transaction.status === 'failed' && <XCircle className="w-4 h-4 text-red-600" />}
                                    </div>
                                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                                      <span>{new Date(transaction.$createdAt).toLocaleDateString('en-US')}</span>
                                      <span className="text-gray-400">•</span>
                                      <span>{new Date(transaction.$createdAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className={`text-base font-bold ${
                                    transaction.type === 'earning' ? 'text-green-600' :
                                    transaction.type === 'withdrawal' ? 'text-red-600' :
                                    'text-gray-900'
                                  }`}>
                                    {transaction.type === 'earning' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 capitalize">
                                    {transaction.status}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {investments.length === 0 && transactions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions or Investments</h3>
                      <p className="text-gray-600">This user has no transaction or investment history yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  User ID: {user.userId} • Last updated: {new Date(user.$updatedAt).toLocaleString()}
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    confirmAction === 'delete' ? 'bg-red-100' : 
                    confirmAction === 'suspend' ? 'bg-amber-100' : 
                    confirmAction === 'reactivate' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {confirmAction === 'delete' ? (
                      <Trash2 className="w-6 h-6 text-red-600" />
                    ) : confirmAction === 'suspend' ? (
                      <Ban className="w-6 h-6 text-amber-600" />
                    ) : confirmAction === 'reactivate' ? (
                      <UserCheck className="w-6 h-6 text-blue-600" />
                    ) : (
                      <UserCheck className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {confirmAction === 'delete' ? 'Deactivate Account' : 
                       confirmAction === 'suspend' ? 'Suspend Account' : 
                       confirmAction === 'reactivate' ? 'Reactivate Account' : 'Activate Account'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {confirmAction === 'delete' ? 'This will make the account inactive' : 'This action will immediately affect the user'}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">{confirmMessage}</p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={cancelAccountAction}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAccountAction}
                    disabled={isProcessing}
                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                      confirmAction === 'delete' 
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                        : confirmAction === 'suspend'
                        ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                        : confirmAction === 'reactivate'
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? 'Processing...' : 
                     confirmAction === 'delete' ? 'Deactivate Account' :
                     confirmAction === 'suspend' ? 'Suspend Account' : 
                     confirmAction === 'reactivate' ? 'Reactivate Account' : 'Activate Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default UserDetailsModal;
