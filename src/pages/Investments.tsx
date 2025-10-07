import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, calculateMonthlyInterest, getInvestmentPlan, INVESTMENT_PLANS } from '../lib/appwrite';
import InvestmentModal from '../components/InvestmentModal';
import type { Investment } from '../types/appwrite';

const Investments: React.FC = () => {
  const { investments, userProfile } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-danger-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateEarnings = (investment: Investment): number => {
    if (investment.status !== 'active') return 0;
    const monthsActive = Math.floor((new Date().getTime() - new Date(investment.$createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
    return calculateMonthlyInterest(investment.amount, investment.interestRate) * monthsActive;
  };

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.status === 'active' ? inv.amount : 0), 0);
  const totalEarnings = investments.reduce((sum, inv) => sum + calculateEarnings(inv), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const monthlyIncome = investments.reduce((sum, inv) => {
    if (inv.status === 'active') {
      return sum + calculateMonthlyInterest(inv.amount, inv.interestRate);
    }
    return sum;
  }, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">My Investments</h1>
          <p className="text-gray-600 mt-1">Manage and track your investment portfolio</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary mt-4 sm:mt-0 px-6 py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Investment
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
                <p className="text-2xl font-bold text-gray-900 mt-2">
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
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
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
                <p className="text-2xl font-bold text-gray-900 mt-2">
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
                className="form-input pl-10"
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
                className="form-input text-sm"
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {formatCurrency(investment.amount)}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {plan?.name || 'Investment Plan'}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm font-medium text-primary-600">
                              {investment.interestRate}% APY
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm text-gray-600 capitalize">
                              {investment.plan || 'Investment Plan'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(investment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                            {investment.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Started: {new Date(investment.$createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {investment.status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
    </div>
  );
};

export default Investments;