import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/appwrite';

const Transactions = () => {
  const { transactions, simulateTransactionStatusChange } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter || transaction.status === filter;
    const matchesSearch = 
      (transaction.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      transaction.amount.toString().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
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
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      case 'earning':
        return <TrendingDown className="w-5 h-5" />;
      case 'withdrawal':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'investment':
        return 'bg-primary-100 text-primary-600';
      case 'earning':
        return 'bg-success-100 text-success-600';
      case 'withdrawal':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Calculate summary statistics
  const totalInvestments = transactions
    .filter(t => t.type === 'investment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">Track all your investment activities and earnings</p>
        </div>
        <button className="btn-secondary mt-4 sm:mt-0 px-6 py-3">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </motion.div>

      {/* Summary Cards */}
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
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalInvestments)}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalWithdrawals)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {pendingTransactions}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card"
      >
        <div className="card-body p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Type/Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="investment">Investments</option>
                  <option value="earning">Earnings</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
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
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="card-body p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.$id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        getTransactionColor(transaction.type)
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="text-base font-semibold text-gray-900 capitalize">
                            {transaction.type}
                          </h4>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="capitalize">{transaction.paymentMethod || 'N/A'}</span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'earning' ? 'text-success-600' :
                        transaction.type === 'withdrawal' ? 'text-orange-600' :
                        'text-gray-900'
                      }`}>
                        {transaction.type === 'earning' ? '+' : 
                         transaction.type === 'withdrawal' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className={`text-sm font-medium capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </p>
                      
                      {/* Demo buttons for status changes */}
                      {transaction.status === 'pending' && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => simulateTransactionStatusChange(transaction.$id, 'completed')}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => simulateTransactionStatusChange(transaction.$id, 'failed')}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                          >
                            Fail
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {transaction.description && (
                    <div className="mt-3 pl-16">
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
              </h3>
              <p className="text-gray-600">
                {transactions.length === 0 ? 
                  'Your transaction history will appear here once you start investing' :
                  'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Transactions;