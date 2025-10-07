import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, calculateMonthlyInterest, getInvestmentPlan } from '../lib/appwrite';

const Dashboard = () => {
  const { user, userProfile, investments, transactions } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Calculate dashboard metrics
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.status === 'active' ? inv.amount : 0), 0);
  const totalEarnings = investments.reduce((sum, inv) => {
    if (inv.status === 'active') {
      const monthsActive = Math.floor((new Date() - new Date(inv.createdAt)) / (1000 * 60 * 60 * 24 * 30));
      return sum + (calculateMonthlyInterest(inv.amount, inv.interestRate) * monthsActive);
    }
    return sum;
  }, 0);
  
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const monthlyEarnings = investments.reduce((sum, inv) => {
    if (inv.status === 'active') {
      return sum + calculateMonthlyInterest(inv.amount, inv.interestRate);
    }
    return sum;
  }, 0);

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
      color: 'primary'
    },
    {
      title: 'Total Earnings',
      value: showBalance ? formatCurrency(totalEarnings) : '••••••',
      change: '+24.8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Monthly Income',
      value: showBalance ? formatCurrency(monthlyEarnings) : '••••••',
      change: '+8.2%',
      changeType: 'positive',
      icon: Calendar,
      color: 'primary'
    },
    {
      title: 'Active Investments',
      value: activeInvestments.toString(),
      change: '+2',
      changeType: 'positive',
      icon: Plus,
      color: 'success'
    }
  ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userProfile?.name || user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your investment portfolio overview
            </p>
          </div>
          <div className="flex items-center space-x-4">
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
          return (
            <div key={stat.title} className="card">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary-100' : 'bg-success-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === 'primary' ? 'text-primary-600' : 'text-success-600'
                    }`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-success-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-danger-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">vs last month</span>
                </div>
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

        {/* Earnings vs Investment Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Earnings vs Investment</h3>
            <p className="text-sm text-gray-600 mt-1">Compare your earnings with investments</p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="invested" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    name="Invested"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Earnings"
                  />
                </LineChart>
              </ResponsiveContainer>
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
                        {new Date(transaction.createdAt).toLocaleDateString()}
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
              <button className="btn-primary px-6 py-3">
                <Plus className="w-4 h-4 mr-2" />
                Make Your First Investment
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;