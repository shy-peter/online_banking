import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import {
  formatCurrency,
  calculateMonthlyInterest,
  getInvestmentPlan,
} from "../lib/appwrite";
import UserReferralPanel from "../components/UserReferralPanel";
import InvestmentModal from "../components/InvestmentModal";
import WithdrawalModal from "../components/WithdrawalModal";
import TransferModal from "../components/TransferModal";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, userProfile, investments, transactions } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Calculate dashboard metrics
  const totalInvested = investments.reduce(
    (sum, inv) => sum + (inv.status === "active" ? inv.amount : 0),
    0
  );
  // portfortfolio value
  const totalPortfolioValue = investments.reduce((sum, investment) => {
    if (investment.status === "active") {
      return sum + investment.amount;
    }
    return sum;
  }, 0);

  const totalEarnings = transactions
    .filter(
      (t) =>
        (t.type === "earning" || t.type === "transfer_in") &&
        t.status === "completed"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(
      (t) =>
        (t.type === "withdrawal" || t.type === "transfer_out") &&
        t.status === "completed"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const availableBalance = totalEarnings - totalWithdrawals;

  const activeInvestments = investments.filter(
    (inv) => inv.status === "active"
  ).length;
  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending"
  ).length;
  const monthlyEarnings = investments.reduce((sum, inv) => {
    if (inv.status === "active") {
      return sum + calculateMonthlyInterest(inv.amount, inv.interestRate);
    }
    return sum;
  }, 0);

  // Handle card clicks to navigate to transactions page
  const handleCardClick = (filterType: string) => {
    // Navigate to transactions page with the appropriate filter
    navigate(`/transactions?filter=${filterType}`);
  };

  // Generate chart data for the last 12 months
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString("default", { month: "short" });

        // Calculate earnings for this month (simplified)
        const earnings = monthlyEarnings * (12 - i) * 0.1; // Simplified calculation
        const invested = totalInvested * ((12 - i) / 12); // Simplified calculation

        data.push({
          month: monthName,
          earnings: Math.max(0, earnings),
          invested: invested,
          total: invested + Math.max(0, earnings),
        });
      }

      setChartData(data);
    };

    generateChartData();
  }, [totalInvested, monthlyEarnings]);

  const stats = [
    {
      title: "Total Invested",
      value: showBalance ? formatCurrency(totalInvested) : "••••••",
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "primary",
      filterType: "totalInvested",
      clickable: true,
    },
    {
      title: "Total Earnings",
      value: showBalance ? formatCurrency(totalEarnings) : "••••••",
      change: "+24.8%",
      changeType: "positive",
      icon: TrendingUp,
      color: "success",
      filterType: "totalEarnings",
      clickable: true,
    },
    {
      title: "Available Balance",
      value: showBalance ? formatCurrency(availableBalance) : "••••••",
      change:
        totalWithdrawals > 0
          ? `-${formatCurrency(totalWithdrawals)} withdrawn`
          : "No withdrawals",
      changeType: totalWithdrawals > 0 ? "negative" : "neutral",
      icon: DollarSign,
      color: "primary",
      clickable: false,
    },
    {
      title: "Active Investments",
      value: activeInvestments.toString(),
      change: "+2",
      changeType: "positive",
      icon: Plus,
      color: "success",
      filterType: "activeInvestments",
      clickable: true,
    },
    {
      title: "Pending Transactions",
      value: pendingTransactions.toString(),
      change:
        pendingTransactions > 0
          ? `${pendingTransactions} pending`
          : "All clear",
      changeType: pendingTransactions > 0 ? "warning" : "neutral",
      icon: Clock,
      color: "yellow",
      filterType: "pendingTransactions",
      clickable: true,
    },
  ];

  // Pie chart data for portfolio breakdown
  const pieChartData = [
    {
      name: "Total Invested",
      value: totalInvested,
      color: "#3B82F6", // Blue
      percentage:
        totalInvested + totalEarnings + availableBalance > 0
          ? (
              (totalInvested /
                (totalInvested + totalEarnings + availableBalance)) *
              100
            ).toFixed(1)
          : "0",
    },
    {
      name: "Total Earnings",
      value: totalEarnings,
      color: "#10B981", // Green
      percentage:
        totalInvested + totalEarnings + availableBalance > 0
          ? (
              (totalEarnings /
                (totalInvested + totalEarnings + availableBalance)) *
              100
            ).toFixed(1)
          : "0",
    },
    {
      name: "Available Balance",
      value: availableBalance,
      color: "#8B5CF6", // Purple
      percentage:
        totalInvested + totalEarnings + availableBalance > 0
          ? (
              (availableBalance /
                (totalInvested + totalEarnings + availableBalance)) *
              100
            ).toFixed(1)
          : "0",
    },
  ];

  return (
    <div className="space-y-6 p-3 md:px-6 md:py-5 ">
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" md:flex items-center  justify-between"
      >
        {/* <div className=" mb-2 md:mb-0 ">
          <h1 className=" md:text-xl lg:text-2xl font-bold text-white">
            Portfolio 
          </h1>
          <p className="text-gray-300 mt-1">
            Here's your investment portfolio summary
          </p>
        </div> */}
        <div className="mb-5 md:mb-0 ">
          <h1 className="text-sm text-center md:text-xl font-semibold text-white">
            Welcome back
            {userProfile?.name ? `, ${userProfile.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-sm hidden text-gray-300 mt-1">
            {totalPortfolioValue > 0 ? (
              <>Your Networth {formatCurrency(totalPortfolioValue)}</>
            ) : (
              <>Ready to start your investment journey?</>
            )}
          </p>
        </div>
        <div
          className="flex flex-col 
        justify-center  sm:flex-row items-start sm:items-center gap-3"
        >
          <div className="grid grid-cols-2 gap-2 self-center  sm:grid-cols-3 md:grid-cols-4 ">
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
              Send
            </button>
            <button
              onClick={() => setShowInvestmentModal(true)}
              className="btn-primary px-4 py-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invest
            </button>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              {showBalance ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium text-white">
                {showBalance ? "Hide Balance" : "Show Balance"}
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = stat.clickable;
          return (
            <div
              key={stat.title}
              className={`card ${
                isClickable
                  ? "cursor-pointer hover:shadow-lg transition-all duration-200"
                  : ""
              }`}
              onClick={
                isClickable
                  ? () => handleCardClick(stat.filterType!)
                  : undefined
              }
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary-100"
                        : stat.color === "success"
                        ? "bg-success-100"
                        : stat.color === "orange"
                        ? "bg-orange-100"
                        : stat.color === "yellow"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        stat.color === "primary"
                          ? "text-primary-600"
                          : stat.color === "success"
                          ? "text-success-600"
                          : stat.color === "orange"
                          ? "text-orange-600"
                          : stat.color === "yellow"
                          ? "text-yellow-600"
                          : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="w-4 h-4 text-success-500 mr-1" />
                  ) : stat.changeType === "negative" ? (
                    <ArrowDownRight className="w-4 h-4 text-danger-500 mr-1" />
                  ) : stat.changeType === "warning" ? (
                    <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  ) : null}
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-success-600"
                        : stat.changeType === "negative"
                        ? "text-danger-600"
                        : stat.changeType === "warning"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  {stat.changeType !== "warning" &&
                    stat.changeType !== "neutral" && (
                      <span className="text-gray-500 text-sm ml-2">
                        vs last month
                      </span>
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
            <h3 className="text-lg font-semibold text-gray-900">
              Portfolio Growth
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Your investment growth over time
            </p>
          </div>
          <div className="card-body">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), ""]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
          {/* Referral Panel removed — moved to Settings > Referrals */}
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Portfolio Breakdown
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of your portfolio
            </p>
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
                    formatter={(value) => [formatCurrency(value), ""]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontSize: "14px" }}>
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
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {showBalance ? formatCurrency(item.value) : "••••••"}
                  </p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

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
              navigate("/settings?tab=payment");
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
