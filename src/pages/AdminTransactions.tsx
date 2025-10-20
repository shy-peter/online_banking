import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { Query } from 'appwrite';
import type { Transaction } from '../types/appwrite';
import UserDetailsModal from '../components/UserDetailsModal';

const AdminTransactions = () => {
  const { userProfile, simulateTransactionStatusChange, updateUser } = useAuth();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [earningsAmount, setEarningsAmount] = useState('');
  const [earningsType, setEarningsType] = useState<'increase' | 'decrease'>('increase');
  const [earningsReason, setEarningsReason] = useState('');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Check if user is admin
  const isAdmin = userProfile?.email?.includes('admin') || userProfile?.name?.includes('Admin');

  // Get user email by user ID
  const getUserEmail = (userId: string) => {
    const user = allUsers.find(u => u.userId === userId);
    return user?.email || userId;
  };

  // Get user name by user ID
  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.userId === userId);
    return user?.name || 'Unknown User';
  };

  // Fetch all transactions and users
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all transactions
      const transactionsResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.orderDesc('$createdAt')]
      );
      setAllTransactions(transactionsResponse.documents as unknown as Transaction[]);
      
      // Fetch all users
      const usersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.orderDesc('$createdAt')]
      );
      setAllUsers(usersResponse.documents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  // Filter transactions
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.status === filter || transaction.type === filter;
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserEmail(transaction.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(transaction.userId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === 'all' || transaction.userId === userFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.$createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
      }
    }
    
    return matchesFilter && matchesSearch && matchesUser && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-danger-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-primary-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-4 h-4 text-danger-600" />;
      case 'earning':
        return <DollarSign className="w-4 h-4 text-success-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: 'completed' | 'failed') => {
    try {
      await simulateTransactionStatusChange(transactionId, newStatus);
      // Refresh the transactions list
      await fetchAllData();
      // Show success message
      alert(`Transaction ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error changing transaction status:', error);
      alert('Error changing transaction status. Please try again.');
    }
  };

  const handleViewUserDetails = (userId: string) => {
    const userToView = allUsers.find(u => u.userId === userId);
    if (userToView) {
      setSelectedUserForDetails(userToView);
      setShowUserDetails(true);
    }
  };

  const handleCloseUserDetails = () => {
    setSelectedUserForDetails(null);
    setShowUserDetails(false);
  };

  const handleEarningsAdjustment = async () => {
    if (!selectedUser || !earningsAmount || !earningsReason) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { adjustUserEarnings } = await import('../lib/earnings');
      const result = await adjustUserEarnings(
        selectedUser,
        parseFloat(earningsAmount) * 100, // Convert to cents
        earningsType,
        earningsReason,
        userProfile?.$id || 'admin'
      );

      if (result.success) {
        alert('Earnings adjusted successfully!');
        setShowEarningsModal(false);
        setSelectedUser('');
        setEarningsAmount('');
        setEarningsReason('');
        await fetchAllData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error adjusting earnings');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mr-3" />
          <span className="text-gray-600">Loading all transactions...</span>
        </div>
      </div>
    );
  }

  const pendingTransactions = allTransactions.filter(t => t.status === 'pending');
  const completedTransactions = allTransactions.filter(t => t.status === 'completed');
  const failedTransactions = allTransactions.filter(t => t.status === 'failed');

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
          <h1 className="text-2xl font-bold text-gray-900">Admin Transactions</h1>
          <p className="text-gray-600 mt-1">Manage all user transactions</p>
        </div>
        <div className="flex space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowEarningsModal(true)}
            className="btn-primary px-4 py-2"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Adjust Earnings
          </button>
          <button
            onClick={fetchAllData}
            className="btn-secondary px-4 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
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
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{allTransactions.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingTransactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-success-600 mt-2">{completedTransactions.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-danger-600 mt-2">{failedTransactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Filters:</span>
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="investment">Investments</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="earning">Earnings</option>
                </select>
                
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="all">All Users</option>
                  {allUsers.map(user => (
                    <option key={user.userId} value={user.userId}>
                      {user.email} ({user.name})
                    </option>
                  ))}
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, name, description, reference..."
                  className="form-input pl-10 w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction, index) => (
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
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 capitalize">
                          {transaction.type.replace('_', ' ')}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>User: {getUserEmail(transaction.userId)}</span>
                          <span className="text-gray-400">•</span>
                          <span>{formatCurrency(transaction.amount)}</span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(transaction.$createdAt).toLocaleDateString('en-US')} at {new Date(transaction.$createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}</span>
                          {transaction.reference && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>Ref: {transaction.reference}</span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{transaction.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      
                      {/* Admin Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUserDetails(transaction.userId)}
                          className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View User</span>
                        </button>
                        
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(transaction.$id, 'completed')}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(transaction.$id, 'failed')}
                              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                No transactions match your current filters
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Earnings Adjustment Modal */}
      {showEarningsModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust User Earnings</h3>
              
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
                    value={earningsAmount}
                    onChange={(e) => setEarningsAmount(e.target.value)}
                    className="form-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={earningsType}
                    onChange={(e) => setEarningsType(e.target.value as 'increase' | 'decrease')}
                    className="form-input"
                  >
                    <option value="increase">Increase Earnings</option>
                    <option value="decrease">Decrease Earnings</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Reason</label>
                  <textarea
                    value={earningsReason}
                    onChange={(e) => setEarningsReason(e.target.value)}
                    className="form-input"
                    rows={3}
                    placeholder="Enter reason for adjustment"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowEarningsModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEarningsAdjustment}
                  className="btn-primary flex-1"
                >
                  Adjust Earnings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={handleCloseUserDetails}
        user={selectedUserForDetails}
        transactions={selectedUserForDetails ? allTransactions.filter(t => t.userId === selectedUserForDetails.userId) : []}
        investments={[]} // You can add investments filtering here if needed
        paymentMethods={[]} // You can add payment methods filtering here if needed
        onUpdateUser={updateUser}
        onAdjustEarnings={async (_userId, _amount, _type, _reason) => {
          // Implement earnings adjustment logic here
          return { success: true };
        }}
        onUpdatePaymentMethod={async (_paymentMethodId, _updates) => {
          // Implement payment method update logic here
          return { success: true };
        }}
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
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default AdminTransactions;
