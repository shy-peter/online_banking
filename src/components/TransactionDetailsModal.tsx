import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Hash,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '../lib/appwrite';
import type { Transaction } from '../types/appwrite';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  if (!transaction) return null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <TrendingUp className="w-6 h-6 text-blue-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      case 'earning':
      case 'interest_payment':
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'account_created':
        return <FileText className="w-6 h-6 text-gray-600" />;
      default:
        return <DollarSign className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const { date, time, relative } = formatDate(transaction.$createdAt);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {transaction.type.replace('_', ' ')} Transaction
                  </h3>
                  <p className="text-sm text-gray-600">{relative}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Transaction Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Transaction Overview</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(transaction.amount)}
                  </div>
                  <p className="text-gray-600">{transaction.description}</p>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Transaction Details</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Transaction ID</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900">{transaction.$id}</span>
                          <button
                            onClick={() => copyToClipboard(transaction.$id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Date</span>
                        </div>
                        <span className="text-sm text-gray-900">{date}</span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Time</span>
                        </div>
                        <span className="text-sm text-gray-900">{time}</span>
                      </div>

                      {transaction.paymentMethod && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Payment Method</span>
                          </div>
                          <span className="text-sm text-gray-900 capitalize">{transaction.paymentMethod}</span>
                        </div>
                      )}

                      {transaction.reference && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Reference</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-gray-900">{transaction.reference}</span>
                            <button
                              onClick={() => copyToClipboard(transaction.reference!)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Additional Information</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">User ID</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-gray-900">{transaction.userId}</span>
                          <button
                            onClick={() => copyToClipboard(transaction.userId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm text-gray-900">
                          {new Date(transaction.$createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm text-gray-900">
                          {new Date(transaction.$updatedAt).toLocaleString()}
                        </span>
                      </div>

                      {transaction.investmentId && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Investment ID</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono text-gray-900">{transaction.investmentId}</span>
                            <button
                              onClick={() => copyToClipboard(transaction.investmentId!)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Transaction Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Transaction Created</p>
                        <p className="text-xs text-gray-600">{date} at {time}</p>
                      </div>
                    </div>

                    {transaction.status === 'completed' && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Transaction Completed</p>
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.$updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {transaction.status === 'pending' && (
                      <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Transaction Pending</p>
                          <p className="text-xs text-gray-600">Awaiting processing</p>
                        </div>
                      </div>
                    )}

                    {transaction.status === 'failed' && (
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Transaction Failed</p>
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.$updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Transaction ID: {transaction.$id}
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
    </AnimatePresence>
  );
};

export default TransactionDetailsModal;
