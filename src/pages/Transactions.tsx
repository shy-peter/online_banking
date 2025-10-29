import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  DollarSign,
  XCircle,
  Calendar,
  ArrowLeft,
  BarChart3,
  Eye,
  Monitor,
  Activity,
  Send,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../lib/appwrite";
import TransactionAnalytics from "../components/TransactionAnalytics";
import PendingTransactions from "../components/PendingTransactions";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import LoginHistoryModal from "../components/LoginHistoryModal";
import UserDetailsModal from "../components/UserDetailsModal";

const Transactions = () => {
  const {
    transactions,
    investments,
    transfers,
    simulateTransactionStatusChange,
    userProfile,
    getLoginHistory,
    terminateSession,
    terminateAllOtherSessions,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<
    "history" | "analytics" | "pending" | "login" | "transfers"
  >("history");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] =
    useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Handle URL filter parameter
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    if (urlFilter) {
      // Map dashboard filter types to transaction filter values
      switch (urlFilter) {
        case "totalInvested":
          setFilter("investment");
          break;
        case "totalEarnings":
          setFilter("earning");
          break;
        case "activeInvestments":
          setFilter("investment");
          break;
        case "pendingTransactions":
          setFilter("pending");
          break;
        default:
          setFilter("all");
      }
    }
  }, [searchParams]);

  // Check if user is admin
  const isAdmin =
    userProfile?.email?.includes("admin") ||
    userProfile?.name?.includes("Admin");

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      filter === "all" ||
      transaction.type === filter ||
      transaction.status === filter;
    const matchesSearch =
      transaction.paymentMethod
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false ||
      transaction.amount.toString().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateFilter !== "all") {
      const transactionDate = new Date(transaction.$createdAt);
      const now = new Date();

      switch (dateFilter) {
        case "today":
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
      }
    }

    return matchesFilter && matchesSearch && matchesDate;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "investment":
        return <TrendingUp className="w-5 h-5" />;
      case "earning":
        return <TrendingDown className="w-5 h-5" />;
      case "withdrawal":
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-danger-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-danger-600";
      default:
        return "text-gray-600";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "investment":
        return "bg-primary-100 text-primary-600";
      case "earning":
        return "bg-success-100 text-success-600";
      case "withdrawal":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Calculate summary statistics
  const totalInvested = investments.reduce(
    (sum, inv) => sum + (inv.status === "active" ? inv.amount : 0),
    0
  );

  const totalEarnings = transactions
    .filter((t) => t.type === "earning" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const availableBalance = totalEarnings - totalWithdrawals;

  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending"
  ).length;

  const handleViewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleCloseTransactionDetails = () => {
    setShowTransactionDetails(false);
    setSelectedTransaction(null);
  };

  const handleViewLoginHistory = () => {
    setShowLoginHistory(true);
  };

  const handleCloseLoginHistory = () => {
    setShowLoginHistory(false);
  };

  const handleViewUserDetails = (userId: string) => {
    // For now, we'll create a mock user object since we don't have access to all users
    // In a real implementation, you'd fetch the user details from the database
    const mockUser = {
      userId: userId,
      name: "User " + userId.slice(-4),
      email: "user@example.com",
      accountNumber: "1234567890",
      totalBalance: 0,
      availableBalance: 0,
      status: "active",
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      personalInfo: {},
    };
    setSelectedUserForDetails(mockUser);
    setShowUserDetails(true);
  };

  const handleCloseUserDetails = () => {
    setSelectedUserForDetails(null);
    setShowUserDetails(false);
  };

  return (
    <div className="space-y-6 px-1">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex  items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold text-gray-50">
              Transaction Center
            </h1>
            <p className="text-gray-600 text-sm md:text-base w-[90%] mt-1">
              Complete transaction history, analytics, and account activity
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex md:hidden items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <ArrowLeft className="w-3  h-3 mr-2" />
            <span className="hidden md:block">Back to Dashboard</span>
          </button>
        </div>
        <button className="btn-secondary mt-4 sm:mt-0 px-6 py-3">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white  rounded-lg border border-gray-200 p-1"
      >
        <div className="flex space-x-1">
          {[
            { id: "history", name: "Transaction History", icon: Activity },
            { id: "analytics", name: "Analytics & Charts", icon: BarChart3 },
            { id: "pending", name: "Pending Transactions", icon: Clock },
            { id: "transfers", name: "Transfers", icon: Send },
            { id: "login", name: "Login History", icon: Monitor },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge =
              tab.id === "pending" && pendingTransactions > 0
                ? pendingTransactions
                : null;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1  flex items-center justify-center space-x-2 px-4 py-3 text-xs md:text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-primary-100 text-primary-700 border border-primary-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:block">{tab.name}</span>
                {badge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        key={activeTab}
      >
        {activeTab === "history" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Invested
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(totalInvested)}
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
                      <p className="text-sm font-medium text-gray-600">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
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
                      <p className="text-sm font-medium text-gray-600">
                        Total Withdrawals
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
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
                      <p className="text-sm font-medium text-gray-600">
                        Available Balance
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(availableBalance)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {totalWithdrawals > 0
                          ? `${formatCurrency(totalWithdrawals)} withdrawn`
                          : "No withdrawals yet"}
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
                      <p className="text-sm font-medium text-gray-600">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {pendingTransactions}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                <h3 className="text-lg font-semibold text-gray-50">
                  All Transactions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTransactions.length} transaction
                  {filteredTransactions.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="card-body hidden p-0">
                {filteredTransactions.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.$id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-4 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTransactionColor(
                                transaction.type
                              )}`}
                            >
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-3">
                                <h4 className="text-sm font-semibold text-gray-900 capitalize">
                                  {transaction.type}
                                </h4>
                                {getStatusIcon(transaction.status)}
                              </div>
                              <div className="flex items-center space-x-4 mt-0.5 text-xs text-gray-600">
                                <span className="capitalize">
                                  {transaction.paymentMethod || "N/A"}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {new Date(
                                    transaction.$createdAt
                                  ).toLocaleDateString("en-US")}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {new Date(
                                    transaction.$createdAt
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-base font-bold ${
                                transaction.type === "earning"
                                  ? "text-success-600"
                                  : transaction.type === "withdrawal"
                                  ? "text-orange-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {transaction.type === "earning"
                                ? "+"
                                : transaction.type === "withdrawal"
                                ? "-"
                                : ""}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p
                              className={`text-xs font-medium capitalize ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {transaction.status}
                            </p>

                            {/* Action buttons */}
                            <div className="flex space-x-2 mt-1">
                              <button
                                onClick={() =>
                                  handleViewTransactionDetails(transaction)
                                }
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Details</span>
                              </button>

                              {/* Admin buttons for status changes */}
                              {transaction.status === "pending" && isAdmin && (
                                <>
                                  <button
                                    onClick={() =>
                                      simulateTransactionStatusChange(
                                        transaction.$id,
                                        "completed"
                                      )
                                    }
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                  >
                                    Complete
                                  </button>
                                  <button
                                    onClick={() =>
                                      simulateTransactionStatusChange(
                                        transaction.$id,
                                        "failed"
                                      )
                                    }
                                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                                  >
                                    Fail
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {transaction.description && (
                          <div className="mt-2 pl-14">
                            <p className="text-xs text-gray-600">
                              {transaction.description}
                            </p>
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
                      {transactions.length === 0
                        ? "No transactions yet"
                        : "No matching transactions"}
                    </h3>
                    <p className="text-gray-600">
                      {transactions.length === 0
                        ? "Your transaction history will appear here once you start investing"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "analytics" && (
          <TransactionAnalytics
            transactions={transactions}
            investments={investments}
          />
        )}

        {activeTab === "pending" && (
          <PendingTransactions
            transactions={transactions}
            onViewDetails={handleViewTransactionDetails}
            onViewUser={handleViewUserDetails}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === "transfers" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-white">
                Transfer History
              </h3>
              <p className="text-gray-600 mt-1">
                View all your internal transfers to and from other InvestFlow
                users
              </p>
            </div>

            <div className="p-6">
              {transfers.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No transfers yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You haven't made or received any transfers yet.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-primary px-6 py-3"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Make a Transfer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => {
                    const isOutgoing =
                      transfer.fromUserId === userProfile?.userId;

                    return (
                      <div
                        key={transfer.$id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isOutgoing ? "bg-orange-100" : "bg-green-100"
                            }`}
                          >
                            <Send
                              className={`w-5 h-5 ${
                                isOutgoing
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">
                                {isOutgoing ? "Sent to" : "Received from"}{" "}
                                {isOutgoing
                                  ? transfer.toUserName
                                  : transfer.fromUserName}
                              </h4>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  transfer.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : transfer.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transfer.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {isOutgoing
                                ? transfer.toUserEmail
                                : transfer.fromUserEmail}
                            </p>
                            {transfer.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                "{transfer.description}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-semibold ${
                              isOutgoing ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isOutgoing ? "-" : "+"}
                            {formatCurrency(transfer.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transfer.$createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "login" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Login History
            </h3>
            <p className="text-gray-600 mb-6">
              View and manage your active login sessions and security
              information.
            </p>
            <button
              onClick={handleViewLoginHistory}
              className="btn-primary px-6 py-3"
            >
              <Monitor className="w-4 h-4 mr-2" />
              View Login History
            </button>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <TransactionDetailsModal
        isOpen={showTransactionDetails}
        onClose={handleCloseTransactionDetails}
        transaction={selectedTransaction}
      />

      <LoginHistoryModal
        isOpen={showLoginHistory}
        onClose={handleCloseLoginHistory}
        onGetLoginHistory={getLoginHistory}
        onTerminateSession={terminateSession}
        onTerminateAllOtherSessions={terminateAllOtherSessions}
      />

      <UserDetailsModal
        isOpen={showUserDetails}
        onClose={handleCloseUserDetails}
        user={selectedUserForDetails}
        transactions={
          selectedUserForDetails
            ? transactions.filter(
                (t) => t.userId === selectedUserForDetails.userId
              )
            : []
        }
        investments={
          selectedUserForDetails
            ? investments.filter(
                (i) => i.userId === selectedUserForDetails.userId
              )
            : []
        }
        paymentMethods={[]}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Transactions;
