// Appwrite types
export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: Record<string, any>;
}

export interface UserProfile {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  accountNumber: string;
  totalBalance: number;
  availableBalance: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface Investment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  amount: number;
  plan: string;
  status: 'pending' | 'active' | 'cancelled' | 'completed';
  interestRate: number;
  startDate: string;
  endDate: string;
}

export interface Transaction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: 'investment' | 'withdrawal' | 'interest_payment' | 'account_created' | 'earning';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  investmentId?: string;
  paymentMethod?: string;
}

export interface InterestPayment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  investmentId: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number | null;
  interestRate: number;
  description: string;
  features: string[];
  paymentMethods: string[];
}

export interface Notification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: 'transaction_update' | 'investment_update' | 'system' | 'security';
  title: string;
  message: string;
  isRead: string; // Changed to string to match database
  transactionId?: string;
  investmentId?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  investments: Investment[];
  transactions: Transaction[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createInvestment: (amount: number, paymentMethod: string) => Promise<{ success: boolean; error?: string; investment?: Investment }>;
  refreshData: () => Promise<void>;
  checkUser: () => Promise<void>;
  simulateTransactionStatusChange: (transactionId: string, newStatus: 'completed' | 'failed') => Promise<void>;
  updateUserProfile: (updates: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, '$id' | '$createdAt' | '$updatedAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
}
