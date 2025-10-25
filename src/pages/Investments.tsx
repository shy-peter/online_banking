import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ArrowDownRight,
  X,
  ArrowLeft,
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, calculateMonthlyInterest, getInvestmentPlan } from '../lib/appwrite';
import InvestmentModal from '../components/InvestmentModal';
import WithdrawalModal from '../components/WithdrawalModal';
import TransferModal from '../components/TransferModal';
import type { Investment } from '../types/appwrite';

const Investments: React.FC = () => {
  const { investments, transactions } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDailyReturns, setShowDailyReturns] = useState<boolean>(false);

  // Filter investments
  const filteredInvestments = investments.filter(investment => {
    const matchesFilter = filter === 'all' || investment.status === filter;
    const matchesSearch = investment.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.amount.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-[#d8ed36]" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-[#d8ed36]" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-[#d8ed36] text-black';
      case 'pending':
        return 'bg-[#d8ed36] text-black';
      case 'cancelled':
        return 'bg-red-900 text-red-300';
      default:
        return 'bg-gray-800 text-gray-300';
    }
  };

  // Calculate daily returns for an investment
  const calculateDailyReturns = (investment: Investment) => {
    if (investment.status !== 'active') return [];
    
    const returns = [];
    const startDate = new Date(investment.$createdAt);
    const today = new Date();
    const dailyRate = investment.interestRate / (100 * 365); // Convert annual to daily
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dayReturns = investment.amount * dailyRate;
      returns.push({
        date: new Date(d).toISOString().split('T')[0],
        amount: Math.round(dayReturns),
        cumulative: Math.round(dayReturns * Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
      });
    }
    
    return returns;
  };

  // Handle viewing daily returns
  const handleViewDailyReturns = (investment: Investment) => {
    setSelectedInvestment(investment);
    setShowDailyReturns(true);
  };

  const calculateEarnings = (investment: Investment): number => {
    if (investment.status !== 'active') return 0;
    const monthsActive = Math.floor((new Date().getTime() - new Date(investment.$createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return calculateMonthlyInterest(investment.amount, investment.interestRate) * monthsActive;
  };

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.status === 'active' ? inv.amount : 0), 0);
  const totalEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const availableBalance = totalEarnings - totalWithdrawals;
  
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const monthlyIncome = investments.reduce((sum, inv) => {
    if (inv.status === 'active') {
      return sum + calculateMonthlyInterest(inv.amount, inv.interestRate);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold text-white">My Investments</h1>
            <p className="text-gray-300 mt-1">Manage and track your investment portfolio</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex md:hidden items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d8ed36] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2 " />
            Back to Dashboard
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="btn-secondary px-6 py-3"
          >
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Withdraw Funds
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="btn-secondary px-6 py-3"
          >
            <Send className="w-4 h-4 mr-2" />
            Transfer Funds
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Investment
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6"
      >
        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-white mt-2">
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
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {formatCurrency(totalEarnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {formatCurrency(availableBalance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalWithdrawals > 0 ? `${formatCurrency(totalWithdrawals)} withdrawn` : 'No withdrawals yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Investments</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {activeInvestments}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card"
      >
        <div className="card-body p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search investments..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Filter:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Investments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Investment Portfolio</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredInvestments.length} investment{filteredInvestments.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="card-body p-0">
          {filteredInvestments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredInvestments.map((investment, index) => {
                const earnings = calculateEarnings(investment);
                const plan = getInvestmentPlan(investment.amount);
                
                return (
                  <motion.div
                    key={investment.$id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {formatCurrency(investment.amount)}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {plan?.name || 'Investment Plan'}
                            </span>
                            <span className="hidden sm:inline text-xs text-gray-400">•</span>
                            <span className="text-sm font-medium text-primary-600">
                              {investment.interestRate}% APY
                            </span>
                            <span className="hidden sm:inline text-xs text-gray-400">•</span>
                            <span className="text-sm text-gray-600 capitalize">
                              {investment.plan || 'Investment Plan'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between lg:flex-col lg:items-end lg:space-y-2 mt-4 lg:mt-0">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(investment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                            {investment.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Started: {new Date(investment.$createdAt).toLocaleDateString('en-US')} at {new Date(investment.$createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {investment.status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Earned</p>
                            <p className="text-sm font-semibold text-success-600">
                              {formatCurrency(earnings)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
                            <p className="text-sm font-semibold text-primary-600">
                              {formatCurrency(calculateMonthlyInterest(investment.amount, investment.interestRate))}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">ROI</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {investment.amount > 0 ? ((earnings / investment.amount) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Value</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(investment.amount + earnings)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDailyReturns(investment)}
                          className="w-full btn-secondary py-2 text-sm"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          View Daily Returns
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {investments.length === 0 ? 'No investments yet' : 'No matching investments'}
              </h3>
              <p className="text-gray-600 mb-6">
                {investments.length === 0 ? 
                  'Start your investment journey with high returns up to 70% annually' :
                  'Try adjusting your search or filter criteria'
                }
              </p>
              {investments.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary px-6 py-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Investing
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Investment Modal */}
      <AnimatePresence>
        {showModal && (
          <InvestmentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawalModal && (
          <WithdrawalModal
            isOpen={showWithdrawalModal}
            onClose={() => setShowWithdrawalModal(false)}
            onAddPaymentMethod={() => {
              setShowWithdrawalModal(false);
              // Navigate to settings payment methods tab
              navigate('/settings?tab=payment');
            }}
          />
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <TransferModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Daily Returns Modal */}
      <AnimatePresence>
        {showDailyReturns && selectedInvestment && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Daily Returns</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedInvestment.plan} - {formatCurrency(selectedInvestment.amount)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDailyReturns(false);
                      setSelectedInvestment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {calculateDailyReturns(selectedInvestment).map((dayReturn, index) => (
                    <motion.div
                      key={dayReturn.date}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(dayReturn.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          Day {index + 1}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Daily Return:</span>
                          <span className="font-semibold text-success-600">
                            +{formatCurrency(dayReturn.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cumulative:</span>
                          <span className="font-semibold text-primary-600">
                            {formatCurrency(dayReturn.cumulative)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {calculateDailyReturns(selectedInvestment).length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No daily returns yet</h3>
                    <p className="text-gray-600">Daily returns will appear here once the investment is active</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investments;