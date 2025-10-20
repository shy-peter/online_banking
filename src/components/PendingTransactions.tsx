import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Eye,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '../lib/appwrite';
import type { Transaction } from '../types/appwrite';

interface PendingTransactionsProps {
  transactions: Transaction[];
  onViewDetails: (transaction: Transaction) => void;
  onViewUser?: (userId: string) => void;
  isAdmin?: boolean;
}

const PendingTransactions: React.FC<PendingTransactionsProps> = ({ 
  transactions, 
  onViewDetails,
  onViewUser,
  isAdmin = false
}) => {
  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'earning':
      case 'interest_payment':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'account_created':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'investment':
        return 'bg-blue-100 text-blue-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'earning':
        return 'bg-green-100 text-green-800';
      case 'interest_payment':
        return 'bg-purple-100 text-purple-800';
      case 'account_created':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
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

  if (pendingTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Transactions</h3>
        <p className="text-gray-600">All your transactions have been processed successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Transactions</h3>
            <p className="text-sm text-gray-600">
              {pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? 's' : ''} awaiting processing
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Processing</span>
        </div>
      </div>

      <div className="space-y-3">
        {pendingTransactions.map((transaction, index) => {
          const { date, time, relative } = formatDate(transaction.$createdAt);
          
          return (
            <motion.div
              key={transaction.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {transaction.type.replace('_', ' ')}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{time}</span>
                      </div>
                      {transaction.paymentMethod && (
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-3 h-3" />
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-amber-600 font-medium">
                      {relative}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(transaction)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {isAdmin && onViewUser && (
                      <button
                        onClick={() => onViewUser(transaction.userId)}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View User"
                      >
                        View User
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Processing Status */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-amber-600 font-medium">Processing</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Transaction ID: {transaction.$id.slice(-8)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-medium text-amber-800">Processing Information</h4>
        </div>
        <p className="text-xs text-amber-700">
          Pending transactions are being processed and will be completed within 1-3 business days. 
          You will receive a notification once each transaction is completed.
        </p>
      </div>
    </div>
  );
};

export default PendingTransactions;
