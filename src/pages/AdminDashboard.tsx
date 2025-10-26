import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ClickToCopy from '../components/ClickToCopy';
import {
  TrendingUp,
  Users,
  DollarSign,
  Settings,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  FileText,
  CreditCard,
  Shield,
  Check,
  X,
  Gift,
  Eye,
  MessageSquare,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, COLLECTIONS, databases, DATABASE_ID } from '../lib/appwrite';
import { 
  getEarningsAdjustments,
  type EarningsAdjustment 
} from '../lib/earnings';
import { ID, Query } from 'appwrite';
import UserDetailsModal from '../components/UserDetailsModal';
import type { BonusCode } from '../types/appwrite';
import { chatService } from '../lib/chatService';

const AdminDashboard = () => {
  const { userProfile, investments, transactions, paymentMethods, updatePaymentMethod, simulateTransactionStatusChange, updateUser, approveInvestment, fixInvestmentOwnership } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [adjustments, setAdjustments] = useState<EarningsAdjustment[]>([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  // Payment methods state
  const [pendingPaymentMethods, setPendingPaymentMethods] = useState<any[]>([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  
  // Transactions state
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  // Support messages state
  const [pendingSupportMessages, setPendingSupportMessages] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  // Admin support chat state
  const [selectedSupportSession, setSelectedSupportSession] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportReply, setSupportReply] = useState('');
  const supportSubRef = useRef<any>(null);
  
  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'accountNumber' | 'userId'>('email');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'transactions' | 'support' | 'user-search' | 'bonus-codes'>('overview');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [userPaymentMethods, setUserPaymentMethods] = useState<any[]>([]);
  const [bonusCodes, setBonusCodes] = useState<BonusCode[]>([]);
  const [bonusCodesLoading, setBonusCodesLoading] = useState(false);
  const [showCreateBonusCode, setShowCreateBonusCode] = useState(false);
  const [createBonusCodeLoading, setCreateBonusCodeLoading] = useState(false);
  const [bonusCodeForm, setBonusCodeForm] = useState({
    code: '',
    description: '',
    dailyRate: '',
    monthlyRate: '',
    usageLimit: '',
    expiryDate: '',
    isActive: true
  });

  // Check if user is admin (you can implement your own admin check logic)
  const isAdmin = userProfile?.email?.includes('admin') || userProfile?.name?.includes('Admin');

  useEffect(() => {
    if (isAdmin) {
      fetchAdjustments();
      fetchAllUsers();
      fetchPendingPaymentMethods();
      fetchPendingTransactions();
      fetchPendingSupportMessages();
      fetchBonusCodes();
    }
  }, [isAdmin]);

  const fetchAdjustments = async () => {
    try {
      const data = await getEarningsAdjustments();
      setAdjustments(data);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../lib/appwrite');
      const { Query } = await import('appwrite');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.limit(100)] // Limit to 100 users for performance
      );
      setAllUsers(response.documents);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPendingPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../lib/appwrite');
      const { Query } = await import('appwrite');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        [Query.equal('status', 'pending'), Query.limit(50)]
      );
      setPendingPaymentMethods(response.documents);
    } catch (error) {
      console.error('Error fetching pending payment methods:', error);
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const fetchPendingTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../lib/appwrite');
      const { Query } = await import('appwrite');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.equal('status', 'pending'), Query.limit(50)]
      );
      setPendingTransactions(response.documents);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchPendingSupportMessages = async () => {
    setSupportLoading(true);
    try {
      // Fetch active chat sessions and the latest user message per session
      const { Query } = await import('appwrite');

      // Get active sessions (most recent first)
      const sessionsResp = await databases.listDocuments(
        DATABASE_ID,
        'chat_sessions',
        [Query.equal('status', 'active'), Query.orderDesc('lastActivityAt'), Query.limit(100)]
      );

      const sessions = sessionsResp.documents || [];

      const results: any[] = [];

      // For each session, fetch the latest message
      for (const s of sessions) {
        try {
          const msgsResp = await databases.listDocuments(
            DATABASE_ID,
            'chat_messages',
            [Query.equal('sessionId', s.$id), Query.orderDesc('timestamp'), Query.limit(1)]
          );
          const lastMsg = msgsResp.documents && msgsResp.documents[0];

          results.push({
            $id: s.$id,
            userId: s.userId || 'guest',
            subject: lastMsg ? (lastMsg.message?.slice(0, 80) || 'Message') : 'No messages yet',
            message: lastMsg?.message || '',
            status: s.status || 'active',
            $createdAt: lastMsg?.timestamp || s.startedAt || s.$createdAt,
            priority: 'normal'
          });
        } catch (err) {
          console.error('Error fetching messages for session', s.$id, err);
        }
      }

      setPendingSupportMessages(results);
    } catch (error) {
      console.error('Error fetching pending support messages:', error);
    } finally {
      setSupportLoading(false);
    }
  };

  // Open a support session for admin to view and reply
  const openSupportSession = async (sessionId: string) => {
    setSelectedSupportSession(sessionId);
    setSupportMessages([]);
    try {
      const msgs = await chatService.getSessionMessages(sessionId);
      setSupportMessages(msgs as any[]);

      // unsubscribe previous
      try {
        if (supportSubRef && (supportSubRef as any).current) {
          const prev = (supportSubRef as any).current;
          if (typeof prev === 'function') prev();
          else prev.unsubscribe?.();
        }
      } catch (e) {
        // ignore
      }

      // subscribe to new messages for this session
      const sub = await chatService.subscribeToMessages(sessionId, (msg) => {
        setSupportMessages(prev => [...prev, msg]);
      });
      (supportSubRef as any).current = sub;
    } catch (error) {
      console.error('Error opening support session:', error);
    }
  };

  const closeSupportSession = async () => {
    try {
      if (supportSubRef && (supportSubRef as any).current) {
        const sub = (supportSubRef as any).current;
        if (typeof sub === 'function') sub();
        else sub.unsubscribe?.();
      }
    } catch (e) {
      // ignore
    }
    setSelectedSupportSession(null);
    setSupportMessages([]);
    setSupportReply('');
  };

  const sendSupportReply = async () => {
    if (!selectedSupportSession || !supportReply.trim()) return;
    try {
      setIsProcessing(true);
      await chatService.sendMessage(selectedSupportSession, supportReply.trim(), 'admin', userProfile?.email || 'admin');
      setSupportReply('');
    } catch (err) {
      console.error('Error sending admin reply:', err);
      alert('Failed to send reply');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchBonusCodes = async () => {
    setBonusCodesLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BONUS_CODES,
        [Query.orderDesc('$createdAt')]
      );
      setBonusCodes(response.documents as unknown as BonusCode[]);
    } catch (error) {
      console.error('Error fetching bonus codes:', error);
    } finally {
      setBonusCodesLoading(false);
    }
  };

  // Fetch complete user data for user details modal
  const fetchUserDetails = async (userId: string) => {
    setUserDetailsLoading(true);
    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../lib/appwrite');
      const { Query } = await import('appwrite');
      
      // Fetch user transactions
      const transactionsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setUserTransactions(transactionsResponse.documents);

      // Fetch user investments
      const investmentsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setUserInvestments(investmentsResponse.documents);

      // Fetch user payment methods
      const paymentMethodsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setUserPaymentMethods(paymentMethodsResponse.documents);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const createBonusCode = async () => {
    if (!bonusCodeForm.code.trim()) {
      alert('Please enter a bonus code');
      return;
    }
    if (!bonusCodeForm.dailyRate || !bonusCodeForm.monthlyRate) {
      alert('Please enter both daily and monthly rates');
      return;
    }

    setCreateBonusCodeLoading(true);
    try {
      const bonusCodeData = {
        code: bonusCodeForm.code.toUpperCase().trim(),
        description: bonusCodeForm.description.trim() || undefined,
        dailyRate: parseFloat(bonusCodeForm.dailyRate),
        monthlyRate: parseFloat(bonusCodeForm.monthlyRate),
        isActive: bonusCodeForm.isActive,
        usageLimit: bonusCodeForm.usageLimit ? parseInt(bonusCodeForm.usageLimit) : undefined,
        usageCount: 0,
        expiryDate: bonusCodeForm.expiryDate || undefined,
        createdBy: userProfile?.email || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.BONUS_CODES,
        ID.unique(),
        bonusCodeData
      );

      // Reset form and close modal
      setBonusCodeForm({
        code: '',
        description: '',
        dailyRate: '',
        monthlyRate: '',
        usageLimit: '',
        expiryDate: '',
        isActive: true
      });
      setShowCreateBonusCode(false);
      
      // Refresh bonus codes list
      await fetchBonusCodes();
      
      alert('Bonus code created successfully!');
    } catch (error: any) {
      console.error('Error creating bonus code:', error);
      alert('Failed to create bonus code: ' + (error.message || 'Unknown error'));
    } finally {
      setCreateBonusCodeLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const { databases, DATABASE_ID, COLLECTIONS } = await import('../lib/appwrite');
      const { Query } = await import('appwrite');
      
      let query;
      switch (searchType) {
        case 'email':
          query = [Query.equal('email', searchQuery.trim())];
          break;
        case 'accountNumber':
          query = [Query.equal('accountNumber', searchQuery.trim())];
          break;
        case 'userId':
          query = [Query.equal('userId', searchQuery.trim())];
          break;
        default:
          query = [Query.equal('email', searchQuery.trim())];
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        query
      );

      if (response.documents.length === 0) {
        setSearchError('No users found matching your search criteria');
      } else {
        setSearchResults(response.documents);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError('Error searching users. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle opening user details modal
  const handleViewUser = async (user: any) => {
    setSelectedUserForDetails(user);
    setShowUserDetails(true);
    // Fetch complete user data
    await fetchUserDetails(user.userId);
  };

  // Handle refreshing user data
  const handleRefreshUserData = async (userId: string) => {
    await fetchUserDetails(userId);
  };

  // Handle closing user details modal
  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUserForDetails(null);
    setUserTransactions([]);
    setUserInvestments([]);
    setUserPaymentMethods([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
  };

  const handleProcessDailyEarnings = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement processDailyEarnings function in AuthContext
      alert('Daily earnings processing feature is not yet implemented');
    } catch (error) {
      alert('Error processing daily earnings');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjustEarnings = async () => {
    if (!selectedUser || !adjustmentAmount || !adjustmentReason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await adjustUserEarnings(
        selectedUser,
        parseFloat(adjustmentAmount),
        adjustmentType,
        adjustmentReason
      );

      if (result.success) {
        alert('Earnings adjusted successfully');
        setShowAdjustmentModal(false);
        setSelectedUser('');
        setAdjustmentAmount('');
        setAdjustmentReason('');
        fetchAdjustments();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error adjusting earnings');
    }
  };

  const handleApprovePaymentMethod = async (paymentMethodId: string) => {
    try {
      const result = await updatePaymentMethod(paymentMethodId, { status: 'verified' });
      if (result.success) {
        alert('Payment method approved successfully');
        fetchPendingPaymentMethods();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving payment method:', error);
      alert('Error approving payment method');
    }
  };

  const handleRejectPaymentMethod = async (paymentMethodId: string) => {
    try {
      const result = await updatePaymentMethod(paymentMethodId, { status: 'rejected' });
      if (result.success) {
        alert('Payment method rejected');
        fetchPendingPaymentMethods();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting payment method:', error);
      alert('Error rejecting payment method');
    }
  };

  const handleAcceptTransaction = async (transactionId: string) => {
    try {
      await simulateTransactionStatusChange(transactionId, 'completed');
      alert('Transaction approved successfully');
      fetchPendingTransactions();
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Error approving transaction');
    }
  };

  const handleRejectTransaction = async (transactionId: string) => {
    try {
      await simulateTransactionStatusChange(transactionId, 'failed');
      alert('Transaction rejected');
      fetchPendingTransactions();
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction');
    }
  };

  const handleResolveSupportMessage = async (messageId: string) => {
    try {
      // For now, just remove from the list since we're using mock data
      setPendingSupportMessages(prev => prev.filter(msg => msg.$id !== messageId));
      alert('Support message resolved');
    } catch (error) {
      console.error('Error resolving support message:', error);
      alert('Error resolving support message');
    }
  };

  const handleViewUserDetails = (user: any) => {
    setSelectedUserForDetails(user);
    setShowUserDetails(true);
  };


  const adjustUserEarnings = async (userId: string, amount: number, type: 'increase' | 'decrease', reason: string) => {
    try {
      // Find the user
      const user = allUsers.find(u => u.userId === userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Calculate new balance
      const adjustment = type === 'increase' ? amount : -amount;
      const newTotalBalance = user.totalBalance + adjustment;
      const newAvailableBalance = user.availableBalance + adjustment;

      // Update user balance in database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id,
        {
          totalBalance: newTotalBalance,
          availableBalance: newAvailableBalance
        }
      );

      // Create a transaction record for the adjustment
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: userId,
          type: type === 'increase' ? 'bonus' : 'adjustment',
          amount: amount,
          status: 'completed',
          description: `Admin ${type}: ${reason}`,
          paymentMethod: 'admin_adjustment',
          reference: `ADJ-${Date.now()}`,
          investmentId: null
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error adjusting user earnings:', error);
      return { success: false, error: 'Failed to adjust earnings' };
    }
  };

  // Helper functions
  const getUserInfo = (userId: string) => {
    const user = allUsers.find(u => u.userId === userId);
    return {
      name: user?.name || 'Unknown User',
      email: user?.email || 'No email',
      accountNumber: user?.accountNumber || 'N/A'
    };
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'paypal': return '💳';
      case 'venmo': return '📱';
      case 'cashapp': return '💰';
      case 'bitcoin': return '₿';
      case 'ethereum': return 'Ξ';
      case 'usdt': return '₮';
      default: return '💳';
    }
  };

  // Calculate admin stats
  const totalInvestments = investments.length;
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.status === 'active' ? inv.amount : 0), 0);
  const totalTransactions = transactions.length;

  const filteredAdjustments = adjustments.filter(adj =>
    adj.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage earnings and system operations</p>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payment-methods')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'payment-methods'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2 inline" />
              Payment Methods
              {pendingPaymentMethods.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {pendingPaymentMethods.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4 mr-2 inline" />
              Transactions
              {pendingTransactions.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {pendingTransactions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'support'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Support
              {pendingSupportMessages.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {pendingSupportMessages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('user-search')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'user-search'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4 mr-2 inline" />
              View User Info
            </button>
            <button
              onClick={() => setActiveTab('bonus-codes')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'bonus-codes'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Gift className="w-4 h-4 mr-2 inline" />
              Bonus Codes
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => window.location.href = '/admin/transactions'}
            className="btn-secondary px-6 py-3"
          >
            <FileText className="w-4 h-4 mr-2" />
            Manage Transactions
          </button>
          <button
            onClick={handleProcessDailyEarnings}
            disabled={isProcessing}
            className="btn-primary px-6 py-3"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Process Daily Earnings
              </>
            )}
          </button>
          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="btn-secondary px-6 py-3"
          >
            <Settings className="w-4 h-4 mr-2" />
            Add System Bonus
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      {activeTab === 'overview' && (
        <>
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalInvestments}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Investments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{activeInvestments}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalInvested)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{totalTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings Adjustments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Earnings Adjustments</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manual earnings adjustments by admin
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search adjustments..."
                  className="form-input pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {filteredAdjustments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredAdjustments.map((adjustment, index) => (
                <motion.div
                  key={adjustment.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        adjustment.type === 'increase' 
                          ? 'bg-success-100 text-success-600' 
                          : 'bg-danger-100 text-danger-600'
                      }`}>
                        {adjustment.type === 'increase' ? (
                          <Plus className="w-6 h-6" />
                        ) : (
                          <Minus className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">
                          {adjustment.type === 'increase' ? 'Earnings Increase' : 'Earnings Decrease'}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>User: {adjustment.userId}</span>
                          <span className="text-gray-400">•</span>
                          <span>Amount: {formatCurrency(Math.abs(adjustment.amount))}</span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(adjustment.$createdAt).toLocaleDateString('en-US')} at {new Date(adjustment.$createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{adjustment.reason}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-3 mb-2">
                        {adjustment.status === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-success-500" />
                        ) : adjustment.status === 'rejected' ? (
                          <XCircle className="w-5 h-5 text-danger-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          adjustment.status === 'approved' ? 'bg-success-100 text-success-800' :
                          adjustment.status === 'rejected' ? 'bg-danger-100 text-danger-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {adjustment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Admin: {adjustment.adminId}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No adjustments yet</h3>
              <p className="text-gray-600">
                Manual earnings adjustments will appear here
              </p>
            </div>
          )}
        </div>
      </motion.div>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
              <p className="text-sm text-gray-600 mt-1">
                {allUsers.length} registered users
              </p>
            </div>
            <div className="card-body p-0">
              {allUsers.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {allUsers.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">{user.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span>{user.email}</span>
                              <span className="text-gray-400">•</span>
                              <span>Account #{user.accountNumber}</span>
                              <span className="text-gray-400">•</span>
                              <span className={`capitalize ${
                                user.status === 'active' ? 'text-green-600' :
                                user.status === 'inactive' ? 'text-gray-600' :
                                'text-red-600'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                              <span>Balance: {formatCurrency(user.totalBalance || 0)}</span>
                              <span className="text-gray-400">•</span>
                              <span>Joined: {new Date(user.$createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewUserDetails(user)}
                          className="btn-secondary px-4 py-2 text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-600">No users have been registered yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pending Investments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card"
          >
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Pending Investments</h3>
                    <p className="text-sm text-gray-600">Approve or reject pending investments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {investments.filter(inv => inv.status === 'pending').length} pending
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              {investments.filter(inv => inv.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {investments.filter(inv => inv.status === 'pending').map((investment) => (
                    <div key={investment.$id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(investment.amount * 100)} via {investment.paymentMethod}
                            </p>
                            <p className="text-xs text-gray-500">
                              Investment ID: {investment.$id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={async () => {
                            console.log('Admin approving investment:', investment.$id);
                            console.log('Investment owner:', investment.userId);
                            const result = await approveInvestment(investment.$id);
                            if (result.success) {
                              alert('Investment approved successfully! User should receive notification.');
                              console.log('Investment approval completed successfully');
                            } else {
                              alert('Failed to approve investment: ' + result.error);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            // Fix investment ownership to the correct user
                            const correctUserId = prompt('Enter the correct user ID for this investment:');
                            if (correctUserId && correctUserId.trim()) {
                              const result = await fixInvestmentOwnership(investment.$id, correctUserId.trim());
                              if (result.success) {
                                alert('Investment ownership fixed successfully!');
                                // Refresh the page to show updated data
                                window.location.reload();
                              } else {
                                alert('Failed to fix investment ownership: ' + result.error);
                              }
                            }
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                        >
                          Fix Owner
                        </button>
                        <button
                          onClick={() => {
                            // You can implement reject functionality here
                            alert('Reject functionality not implemented yet');
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Investments</h3>
                  <p className="text-gray-600">All investments have been processed.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Payment Methods Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Method Verification</h2>
              <p className="text-gray-600 mt-1">Review and approve pending payment methods</p>
            </div>
            <button
              onClick={fetchPendingPaymentMethods}
              disabled={paymentMethodsLoading}
              className="btn-secondary px-4 py-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${paymentMethodsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Payment Methods List */}
          <div className="card">
            <div className="card-body p-6">
              {paymentMethodsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
                  <span className="ml-2 text-gray-600">Loading payment methods...</span>
                </div>
              ) : pendingPaymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {pendingPaymentMethods.map((method) => {
                    const userInfo = getUserInfo(method.userId);
                    return (
                      <motion.div
                        key={method.$id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                              {getPaymentMethodIcon(method.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Pending Review
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600"><strong>User:</strong> {userInfo.name}</p>
                                  <p className="text-gray-600"><strong>Email:</strong> {userInfo.email}</p>
                                  <p className="text-gray-600"><strong>Account #:</strong> {userInfo.accountNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600"><strong>Type:</strong> {method.type.toUpperCase()}</p>
                                  <p className="text-gray-600"><strong>Account:</strong> {method.accountNumber}</p>
                                  <p className="text-gray-600"><strong>Added:</strong> {new Date(method.$createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {method.email && (
                                <p className="text-gray-600 mt-2"><strong>Email:</strong> {method.email}</p>
                              )}
                              {method.username && (
                                <p className="text-gray-600 mt-2"><strong>Username:</strong> {method.username}</p>
                              )}
                              {method.phoneNumber && (
                                <p className="text-gray-600 mt-2"><strong>Phone:</strong> {method.phoneNumber}</p>
                              )}
                              {method.address && (
                                <div className="mt-2">
                                  <p className="text-gray-600"><strong>Address:</strong></p>
                                  <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded mt-1 break-all">
                                    {method.address}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewUserDetails(allUsers.find(u => u.userId === method.userId))}
                              className="btn-secondary px-4 py-2 text-sm"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View User
                            </button>
                            <button
                              onClick={() => handleApprovePaymentMethod(method.$id)}
                              className="btn-success px-4 py-2 text-sm"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPaymentMethod(method.$id)}
                              className="btn-danger px-4 py-2 text-sm"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Payment Methods</h3>
                  <p className="text-gray-600">
                    All payment methods have been reviewed and processed
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pending Transactions</h2>
              <p className="text-gray-600 mt-1">Review and approve pending transactions</p>
            </div>
            <button
              onClick={fetchPendingTransactions}
              disabled={transactionsLoading}
              className="btn-secondary px-4 py-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Transactions List */}
          <div className="card">
            {transactionsLoading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : pendingTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pendingTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.$id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 capitalize">
                            {transaction.type?.replace('_', ' ') || 'Transaction'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>User: {getUserInfo(transaction.userId).email}</span>
                            <span className="text-gray-400">•</span>
                            <span>{formatCurrency(transaction.amount)}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(transaction.$createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{transaction.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUserDetails(allUsers.find(u => u.userId === transaction.userId))}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View User</span>
                          </button>
                          <button
                            onClick={() => handleAcceptTransaction(transaction.$id)}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(transaction.$id)}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Transactions</h3>
                <p className="text-gray-600">
                  All transactions have been reviewed and processed
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Support Tab */}
      {activeTab === 'support' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Support Messages</h2>
              <p className="text-gray-600 mt-1">Review and respond to user support requests</p>
            </div>
            <button
              onClick={fetchPendingSupportMessages}
              disabled={supportLoading}
              className="btn-secondary px-4 py-2"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${supportLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Support Messages List */}
          <div className="card">
            {supportLoading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading support messages...</p>
              </div>
            ) : selectedSupportSession ? (
              <div className="flex flex-col h-[60vh]">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button onClick={closeSupportSession} className="text-sm text-primary-600 mr-2">← Back</button>
                    <div className="font-semibold">Support — Session {selectedSupportSession.slice(0,8)}</div>
                  </div>
                  <div>
                    <button
                      onClick={async () => {
                        try {
                          await chatService.closeSession(selectedSupportSession);
                          await fetchPendingSupportMessages();
                          closeSupportSession();
                        } catch (err) {
                          console.error('Error closing session:', err);
                        }
                      }}
                      className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded"
                    >
                      Close Session
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {supportMessages.length === 0 ? (
                    <div className="text-center text-sm text-gray-500">No messages yet</div>
                  ) : (
                    supportMessages.map((msg: any, idx: number) => {
                      const isAdminMsg = msg.type === 'admin';
                      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      return (
                        <div key={msg.$id || idx} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${isAdminMsg ? 'bg-primary-600 text-white' : 'bg-white text-gray-800 shadow'}`}>
                            <div className="break-words">{msg.message}</div>
                            <div className={`text-[11px] mt-1 ${isAdminMsg ? 'text-white/80' : 'text-gray-400'}`}>{time}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t p-3 bg-white">
                  <div className="flex space-x-2">
                    <input
                      value={supportReply}
                      onChange={(e) => setSupportReply(e.target.value)}
                      placeholder="Type a reply..."
                      className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none"
                    />
                    <button onClick={sendSupportReply} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full text-sm">Send</button>
                  </div>
                </div>
              </div>
            ) : pendingSupportMessages.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pendingSupportMessages.map((message, index) => (
                  <motion.div
                    key={message.$id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => openSupportSession(message.$id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">
                            {message.subject}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>User: {getUserInfo(message.userId).email}</span>
                            <span className="text-gray-400">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              message.priority === 'high' 
                                ? 'bg-red-100 text-red-800' 
                                : message.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {message.priority}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(message.$createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{message.message}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewUserDetails(allUsers.find(u => u.userId === message.userId)); }}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View User</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleResolveSupportMessage(message.$id); }}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Support Messages</h3>
                <p className="text-gray-600">
                  All support messages have been reviewed and resolved
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* User Search Tab */}
      {activeTab === 'user-search' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Search</h2>
              <p className="text-gray-600 mt-1">Search for users by email, account number, or user ID</p>
            </div>
          </div>

          {/* Search Form */}
          <div className="card">
            <div className="card-body p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="form-label">Search Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'email' | 'accountNumber' | 'userId')}
                    className="form-input"
                  >
                    <option value="email">Email Address</option>
                    <option value="accountNumber">Account Number</option>
                    <option value="userId">User ID</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Search Query</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Enter ${searchType === 'email' ? 'email address' : searchType === 'accountNumber' ? 'account number' : 'user ID'}`}
                    className="form-input"
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  />
                </div>
                <div className="md:col-span-1 flex items-end space-x-2">
                  <button
                    onClick={searchUsers}
                    disabled={searchLoading || !searchQuery.trim()}
                    className="btn-primary flex-1"
                  >
                    {searchLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Search
                  </button>
                  <button
                    onClick={clearSearch}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{searchError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results ({searchResults.length} found)
                </h3>
              </div>
              <div className="card-body p-0">
                <div className="divide-y divide-gray-200">
                  {searchResults.map((user, index) => (
                    <motion.div
                      key={user.$id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900">
                              {user.name || 'No Name'}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <ClickToCopy text={user.email} copyMessage="Email copied to clipboard!">
                                <span>Email: {user.email}</span>
                              </ClickToCopy>
                              <span className="text-gray-400">•</span>
                              <span>Account: {user.accountNumber || 'N/A'}</span>
                              <span className="text-gray-400">•</span>
                              <span>ID: {user.userId}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>Balance: {formatCurrency(user.balance || 0)}</span>
                              <span className="text-gray-400">•</span>
                              <span>Joined: {new Date(user.$createdAt).toLocaleDateString()}</span>
                              <span className="text-gray-400">•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : user.status === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="btn-primary px-4 py-2 flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No Results State */}
          {searchQuery && !searchLoading && searchResults.length === 0 && !searchError && (
            <div className="card">
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">
                  No users match your search criteria. Try a different search term.
                </p>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!searchQuery && searchResults.length === 0 && (
            <div className="card">
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Users</h3>
                <p className="text-gray-600">
                  Enter an email address, account number, or user ID to search for user information.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Bonus Codes Tab */}
      {activeTab === 'bonus-codes' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bonus Codes Management</h2>
              <p className="text-gray-600 mt-1">Create and manage bonus codes for enhanced earnings</p>
            </div>
            <button
              onClick={() => setShowCreateBonusCode(true)}
              className="btn-primary px-4 py-2 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Bonus Code</span>
            </button>
          </div>

          {/* Bonus Codes List */}
          <div className="card">
            <div className="p-6">
              {bonusCodesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading bonus codes...</p>
                </div>
              ) : bonusCodes.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Bonus Codes</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first bonus code to offer enhanced earnings to users.
                  </p>
                  <button
                    onClick={() => setShowCreateBonusCode(true)}
                    className="btn-primary px-4 py-2 flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Bonus Code</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bonusCodes.map((code) => (
                    <motion.div
                      key={code.$id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{code.code}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              code.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {code.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {code.description && (
                            <p className="text-gray-600 text-sm mb-2">{code.description}</p>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Daily Rate:</span>
                              <div className="font-semibold text-green-600">{code.dailyRate}%</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Monthly Rate:</span>
                              <div className="font-semibold text-green-600">{code.monthlyRate}%</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Usage:</span>
                              <div className="font-semibold">
                                {code.usageCount}
                                {code.usageLimit && ` / ${code.usageLimit}`}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <div className="font-semibold">
                                {new Date(code.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {code.expiryDate && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Expires:</span>
                              <span className={`ml-1 font-semibold ${
                                new Date(code.expiryDate) < new Date() 
                                  ? 'text-red-600' 
                                  : 'text-gray-900'
                              }`}>
                                {new Date(code.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={async () => {
                              try {
                                await databases.updateDocument(
                                  DATABASE_ID,
                                  COLLECTIONS.BONUS_CODES,
                                  code.$id,
                                  {
                                    isActive: !code.isActive,
                                    updatedAt: new Date().toISOString()
                                  }
                                );
                                // Refresh bonus codes list
                                await fetchBonusCodes();
                                alert(`Bonus code ${!code.isActive ? 'activated' : 'deactivated'} successfully!`);
                              } catch (error) {
                                console.error('Error updating bonus code:', error);
                                alert('Failed to update bonus code status');
                              }
                            }}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              code.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {code.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {adjustmentType === 'increase' ? 'Add System Bonus' : 'Adjust User Earnings'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Select User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Choose a user...</option>
                    {allUsers.map(user => (
                      <option key={user.userId} value={user.userId}>
                        {user.email} ({user.name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Amount ($)</label>
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as 'increase' | 'decrease')}
                    className="form-input"
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Reason</label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="form-input"
                    rows={3}
                    placeholder={adjustmentType === 'increase' ? "e.g., System bonus, promotional reward" : "e.g., Account adjustment, correction"}
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustEarnings}
                  className="btn-primary flex-1"
                >
                  {adjustmentType === 'increase' ? 'Add Bonus' : 'Adjust Earnings'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Bonus Code Modal */}
      {showCreateBonusCode && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Create Bonus Code</h3>
                  <p className="text-gray-600 mt-1">Create a new bonus code for enhanced earnings</p>
                </div>
                <button
                  onClick={() => setShowCreateBonusCode(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Bonus Code *</label>
                    <input
                      type="text"
                      value={bonusCodeForm.code}
                      onChange={(e) => setBonusCodeForm(prev => ({ ...prev, code: e.target.value }))}
                      className="form-input"
                      placeholder="e.g., WELCOME20"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">Code will be converted to uppercase</p>
                  </div>
                  
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={bonusCodeForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setBonusCodeForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                      className="form-input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={bonusCodeForm.description}
                    onChange={(e) => setBonusCodeForm(prev => ({ ...prev, description: e.target.value }))}
                    className="form-input"
                    rows={2}
                    placeholder="Optional description for this bonus code"
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Daily Rate (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={bonusCodeForm.dailyRate}
                      onChange={(e) => setBonusCodeForm(prev => ({ ...prev, dailyRate: e.target.value }))}
                      className="form-input"
                      placeholder="e.g., 0.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Daily earning rate percentage</p>
                  </div>
                  
                  <div>
                    <label className="form-label">Monthly Rate (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={bonusCodeForm.monthlyRate}
                      onChange={(e) => setBonusCodeForm(prev => ({ ...prev, monthlyRate: e.target.value }))}
                      className="form-input"
                      placeholder="e.g., 15"
                    />
                    <p className="text-xs text-gray-500 mt-1">Monthly earning rate percentage</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={bonusCodeForm.usageLimit}
                      onChange={(e) => setBonusCodeForm(prev => ({ ...prev, usageLimit: e.target.value }))}
                      className="form-input"
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum number of times this code can be used</p>
                  </div>
                  
                  <div>
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="datetime-local"
                      value={bonusCodeForm.expiryDate}
                      onChange={(e) => setBonusCodeForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="form-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowCreateBonusCode(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={createBonusCode}
                  disabled={createBonusCodeLoading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {createBonusCodeLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Bonus Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Methods Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods Management</h2>
              <p className="text-gray-600 mt-1">Manage user payment methods and QR codes</p>
            </div>
            <div className="flex space-x-2">
              <a
                href="/admin/payment-methods"
                className="btn-primary px-4 py-2 flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Manage Payment Methods</span>
              </a>
              <a
                href="/admin/payment-method-types"
                className="btn-secondary px-4 py-2 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Types</span>
              </a>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
                  <p className="text-lg font-bold text-yellow-900">{pendingPaymentMethods.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Verified</p>
                  <p className="text-lg font-bold text-green-900">
                    {paymentMethods.filter(pm => pm.status === 'verified').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Rejected</p>
                  <p className="text-lg font-bold text-red-900">
                    {paymentMethods.filter(pm => pm.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={handleCloseUserDetails}
        user={selectedUserForDetails}
        transactions={userTransactions}
        investments={userInvestments}
        paymentMethods={userPaymentMethods}
        isLoading={userDetailsLoading}
        onRefreshUserData={handleRefreshUserData}
        onUpdateUser={updateUser}
        onAdjustEarnings={async (userId, amount, type, reason) => {
          try {
            const result = await adjustUserEarnings(userId, amount, type, reason);
            if (result.success) {
              // Refresh data
              await fetchAllUsers();
            }
            return result;
          } catch (error) {
            return { success: false, error: 'Failed to adjust earnings' };
          }
        }}
        onUpdatePaymentMethod={updatePaymentMethod}
        onUpdateTransaction={async (transactionId, updates) => {
          try {
            if (updates.status === 'completed') {
              await simulateTransactionStatusChange(transactionId, 'completed');
            } else if (updates.status === 'rejected') {
              await simulateTransactionStatusChange(transactionId, 'failed');
            }
            return { success: true };
          } catch (error) {
            return { success: false, error: 'Failed to update transaction' };
          }
        }}
        onViewUser={(userId) => {
          const userToView = allUsers.find(u => u.userId === userId);
          if (userToView) {
            setSelectedUserForDetails(userToView);
            setShowUserDetails(true);
          }
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default AdminDashboard;
