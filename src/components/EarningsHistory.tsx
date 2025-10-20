import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';
import { useEarnings } from '../hooks/useEarnings';
import { formatCurrency } from '../lib/appwrite';
import type { DailyEarnings } from '../lib/earnings';

const EarningsHistory: React.FC = () => {
  const { 
    earningsHistory, 
    loading, 
    error, 
    stats,
    getEarningsByDateRange,
    getEarningsByInvestment 
  } = useEarnings();
  
  const [filter, setFilter] = useState<'all' | '7days' | '30days' | '90days'>('30days');
  const [selectedInvestment, setSelectedInvestment] = useState<string>('all');

  // Filter earnings based on selected period
  const getFilteredEarnings = (): DailyEarnings[] => {
    let filtered = earningsHistory;

    // Apply date filter
    if (filter !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filter) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = getEarningsByDateRange(startDate, now);
    }

    // Apply investment filter
    if (selectedInvestment !== 'all') {
      filtered = filtered.filter(earning => earning.investmentId === selectedInvestment);
    }

    return filtered;
  };

  const filteredEarnings = getFilteredEarnings();
  const totalFilteredEarnings = filteredEarnings.reduce((sum, earning) => sum + earning.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-danger-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading earnings history...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Earnings</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card">
          <div className="card-body p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalEarnings)}
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
                <p className="text-sm font-medium text-gray-600">Last 7 Days</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.last7DaysEarnings)}
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
                <p className="text-sm font-medium text-gray-600">Last 30 Days</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.last30DaysEarnings)}
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
                <p className="text-sm font-medium text-gray-600">Avg Daily</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.averageDailyEarnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Earnings History</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredEarnings.length} earnings record{filteredEarnings.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <button className="btn-secondary px-4 py-2">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Period:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="form-input text-sm"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-900">{formatCurrency(totalFilteredEarnings)}</span>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {filteredEarnings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredEarnings.map((earning, index) => (
                <motion.div
                  key={earning.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-success-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">
                          Daily Earnings
                        </h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{new Date(earning.date).toLocaleDateString('en-US')} at {new Date(earning.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}</span>
                          <span className="text-gray-400">•</span>
                          <span className="capitalize">{earning.type}</span>
                          {earning.investmentId && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span>Investment: {earning.investmentId.slice(-6)}</span>
                            </>
                          )}
                        </div>
                        {earning.notes && (
                          <p className="text-sm text-gray-500 mt-1">{earning.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-success-600">
                        +{formatCurrency(earning.amount)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(earning.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(earning.status)}`}>
                          {earning.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-600">
                Your daily earnings will appear here once your investments start generating returns
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EarningsHistory;
