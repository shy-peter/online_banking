import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Clock,
  X,
  Send
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, calculateMonthlyInterest, getInvestmentPlan } from '../lib/appwrite';
import InvestmentModal from '../components/InvestmentModal';
import WithdrawalModal from '../components/WithdrawalModal';
import TransferModal from '../components/TransferModal';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, userProfile, investments, transactions } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFilteredTransactions, setShowFilteredTransactions] = useState(false);

  // Calculate dashboard metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.status === 'active' ? inv.amount : 0), 0);
  const totalEarnings = transactions
    .filter(t => (t.type === 'earning' || t.type === 'transfer_in') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => (t.type === 'withdrawal' || t.type === 'transfer_out') && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const availableBalance = totalEarnings - totalWithdrawals;
  
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  const monthlyEarnings = investments.reduce((sum, inv) => {
    if (inv.status === 'active') {
      return sum + calculateMonthlyInterest(inv.amount, inv.interestRate);
    }
    return sum;
  }, 0);

  // Handle card clicks to filter transactions
  const handleCardClick = (filterType: string) => {
    setActiveFilter(filterType);
    setShowFilteredTransactions(true);
  };

  // Get filtered transactions based on active filter
  const getFilteredTransactions = () => {
    if (!activeFilter) return [];
    
    switch (activeFilter) {
      case 'totalInvested':
        return transactions.filter(t => t.type === 'investment' && t.status === 'completed');
      case 'totalEarnings':
        return transactions.filter(t => t.type === 'earning' && t.status === 'completed');
      case 'activeInvestments':
        return transactions.filter(t => t.type === 'investment' && t.status === 'completed');
      case 'pendingTransactions':
        return transactions.filter(t => t.status === 'pending');
      default:
        return [];
    }
  };

  const filteredTransactions = getFilteredTransactions();

  // Generate chart data for the last 12 months
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        // Calculate earnings for this month (simplified)
        const earnings = monthlyEarnings * (12 - i) * 0.1; // Simplified calculation
        const invested = totalInvested * ((12 - i) / 12); // Simplified calculation
        
        data.push({
          month: monthName,
          earnings: Math.max(0, earnings),
          invested: invested,
          total: invested + Math.max(0, earnings)
        });
      }
      
      setChartData(data);
    };

    generateChartData();
  }, [totalInvested, monthlyEarnings]);

  const stats = [
    {
      title: 'Total Invested',
      value: showBalance ? formatCurrency(totalInvested) : '••••••',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'primary',
      filterType: 'totalInvested',
      clickable: true
    },
    {
      title: 'Total Earnings',
      value: showBalance ? formatCurrency(totalEarnings) : '••••••',
      change: '+24.8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'success',
      filterType: 'totalEarnings',
      clickable: true
    },
    {
      title: 'Available Balance',
      value: showBalance ? formatCurrency(availableBalance) : '••••••',
      change: totalWithdrawals > 0 ? `-${formatCurrency(totalWithdrawals)} withdrawn` : 'No withdrawals',
      changeType: totalWithdrawals > 0 ? 'negative' : 'neutral',
      icon: DollarSign,
      color: 'primary',
      clickable: false
    },
    {
      title: 'Active Investments',
      value: activeInvestments.toString(),
      change: '+2',
      changeType: 'positive',
      icon: Plus,
      color: 'success',
      filterType: 'activeInvestments',
      clickable: true
    },
    {
      title: 'Pending Transactions',
      value: pendingTransactions.toString(),
      change: pendingTransactions > 0 ? `${pendingTransactions} pending` : 'All clear',
      changeType: pendingTransactions > 0 ? 'warning' : 'neutral',
      icon: Clock,
      color: 'yellow',
      filterType: 'pendingTransactions',
      clickable: true
    }
  ];

  // Pie chart data for portfolio breakdown
  const pieChartData = [
    {
      name: 'Total Invested',
      value: totalInvested,
      color: '#3B82F6', // Blue
      percentage: totalInvested + totalEarnings + availableBalance > 0 ? 
        ((totalInvested / (totalInvested + totalEarnings + availableBalance)) * 100).toFixed(1) : '0'
    },
    {
      name: 'Total Earnings',
      value: totalEarnings,
      color: '#10B981', // Green
      percentage: totalInvested + totalEarnings + availableBalance > 0 ? 
        ((totalEarnings / (totalInvested + totalEarnings + availableBalance)) * 100).toFixed(1) : '0'
    },
    {
      name: 'Available Balance',
      value: availableBalance,
      color: '#8B5CF6', // Purple
      percentage: totalInvested + totalEarnings + availableBalance > 0 ? 
        ((availableBalance / (totalInvested + totalEarnings + availableBalance)) * 100).toFixed(1) : '0'
    }
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Portfolio Overview 📊
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your investment portfolio summary
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="btn-secondary px-4 py-2"
            >
              <ArrowDownRight className="w-4 h-4 mr-2" />
              Withdraw
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="btn-secondary px-4 py-2"
            >
              <Send className="w-4 h-4 mr-2" />
              Transfer
            </button>
            <button
              onClick={() => setShowInvestmentModal(true)}
              className="btn-primary px-4 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invest
            </button>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {showBalance ? 'Hide Balance' : 'Show Balance'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = stat.clickable;
          return (
            <div 
              key={stat.title} 
              className={`card ${isClickable ? 'cursor-pointer hover:shadow-lg transition-all duration-200' : ''}`}
              onClick={isClickable ? () => handleCardClick(stat.filterType!) : undefined}
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary-100' :
                    stat.color === 'success' ? 'bg-success-100' :
                    stat.color === 'orange' ? 'bg-orange-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === 'primary' ? 'text-primary-600' :
                      stat.color === 'success' ? 'text-success-600' :
                      stat.color === 'orange' ? 'text-orange-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-success-500 mr-1" />
                  ) : stat.changeType === 'negative' ? (
                    <ArrowDownRight className="w-4 h-4 text-danger-500 mr-1" />
                  ) : stat.changeType === 'warning' ? (
                    <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success-600' : 
                    stat.changeType === 'negative' ? 'text-danger-600' :
                    stat.changeType === 'warning' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  {stat.changeType !== 'warning' && stat.changeType !== 'neutral' && (
                    <span className="text-gray-500 text-sm ml-2">vs last month</span>
                  )}
                </div>
                {isClickable && (
                  <div className="mt-2 text-xs text-gray-500">
                    Click to view transactions
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Growth</h3>
            <p className="text-sm text-gray-600 mt-1">Your investment growth over time</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Breakdown Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio Breakdown</h3>
            <p className="text-sm text-gray-600 mt-1">Distribution of your portfolio</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontSize: '14px' }}>
                        {value} ({entry.payload.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Portfolio Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {pieChartData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {showBalance ? formatCurrency(item.value) : '••••••'}
                  </p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-600 mt-1">Your latest investment activities</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
        </div>
        <div className="card-body p-0">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentTransactions.map((transaction, index) => (
                <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'investment' ? 'bg-primary-100' : 
                      transaction.type === 'earning' ? 'bg-success-100' : 'bg-gray-100'
                    }`}>
                      {transaction.type === 'investment' ? (
                        <TrendingUp className={`w-5 h-5 ${
                          transaction.type === 'investment' ? 'text-primary-600' : 'text-gray-600'
                        }`} />
                      ) : (
                        <DollarSign className={`w-5 h-5 ${
                          transaction.type === 'earning' ? 'text-success-600' : 'text-gray-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {transaction.type} - {transaction.paymentMethod}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.$createdAt).toLocaleDateString('en-US')} at {new Date(transaction.$createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'earning' ? 'text-success-600' : 'text-gray-900'
                    }`}>
                      {transaction.type === 'earning' ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-xs ${
                      transaction.status === 'completed' ? 'text-success-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-600 mb-6">Start your investment journey to see your transactions here</p>
              <button 
                onClick={() => setShowInvestmentModal(true)}
                className="btn-primary px-6 py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Make Your First Investment
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filtered Transactions Section */}
      {showFilteredTransactions && activeFilter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeFilter === 'totalInvested' && 'Investment Transactions'}
                  {activeFilter === 'totalEarnings' && 'Earnings Transactions'}
                  {activeFilter === 'activeInvestments' && 'Active Investment Transactions'}
                  {activeFilter === 'pendingTransactions' && 'Pending Transactions'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFilteredTransactions(false);
                  setActiveFilter(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                          transaction.type === 'earning' ? 'bg-success-100' :
                          transaction.type === 'withdrawal' ? 'bg-orange-100' :
                          transaction.type === 'investment' ? 'bg-primary-100' :
                          'bg-gray-100'
                        }`}>
                          {transaction.type === 'earning' ? (
                            <TrendingUp className="w-6 h-6 text-success-600" />
                          ) : transaction.type === 'withdrawal' ? (
                            <ArrowDownRight className="w-6 h-6 text-orange-600" />
                          ) : transaction.type === 'investment' ? (
                            <Plus className="w-6 h-6 text-primary-600" />
                          ) : (
                            <DollarSign className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="text-base font-semibold text-gray-900 capitalize">
                              {transaction.type}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-success-100 text-success-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              transaction.status === 'failed' ? 'bg-danger-100 text-danger-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="capitalize">{transaction.paymentMethod || 'N/A'}</span>
                            <span className="text-gray-400">•</span>
                            <span>{new Date(transaction.$createdAt).toLocaleDateString('en-US')} at {new Date(transaction.$createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}</span>
                          </div>
                          {transaction.description && (
                            <p className="text-sm text-gray-500 mt-1">{transaction.description}</p>
                          )}
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
                        {transaction.reference && (
                          <p className="text-xs text-gray-500 mt-1">Ref: {transaction.reference}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">No transactions match the selected filter</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Investment Modal */}
      <AnimatePresence>
        {showInvestmentModal && (
          <InvestmentModal
            isOpen={showInvestmentModal}
            onClose={() => setShowInvestmentModal(false)}
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
    </div>
  );
};

export default Dashboard;