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
  profilePicture?: string;
  accountNumber: string;
  totalBalance: number;
  availableBalance: number;
  status: 'active' | 'inactive' | 'suspended';
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'incomplete';
  verificationDate?: string;
  createdAt: string;
  // New fields for enhanced signup
  secretPhrase?: string;
  documents?: {
    idCard?: string;
    passport?: string;
    utilityBill?: string;
    bankStatement?: string;
    proofOfAddress?: string;
  };
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    occupation?: string;
    annualIncome?: number;
    ssn?: string;
    idType?: string;
  };
  preferences?: {
    darkMode?: boolean;
    currency?: string;
    showBalance?: boolean;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
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
  bonusCodeId?: string;
  bonusCode?: string;
  dailyRate?: number;
  monthlyRate?: number;
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

export interface PaymentMethodType {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  type: string;
  name: string;
  description?: string;
  icon?: string;
  category: 'digital_wallet' | 'mobile_payment' | 'cryptocurrency' | 'bank_transfer' | 'other';
  requiredFields?: string; // JSON string array
  optionalFields?: string; // JSON string array
  isActive: boolean;
  sortOrder: number;
  qrCodeUrl?: string; // URL to the QR code image
}

export interface PaymentMethod {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: string; // Now dynamic based on PaymentMethodType
  name: string;
  accountNumber: string;
  isDefault: boolean;
  status: 'pending' | 'verified' | 'rejected';
  // Additional fields for different payment types
  email?: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
}

export interface Notification {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  type: 'transaction_update' | 'investment_update' | 'system' | 'security';
  title: string;
  message: string;
  isRead: boolean | string; // Can be boolean or string to match database
  transactionId?: string;
  investmentId?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface BonusCode {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  code: string;
  description?: string;
  dailyRate: number;
  monthlyRate: number;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  expiryDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  investments: Investment[];
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string, 
    password: string, 
    name: string, 
    additionalData?: {
      phone?: string;
      secretPhrase?: string;
      documents?: {
        idCard?: { id: string; name: string };
        passport?: { id: string; name: string };
        utilityBill?: { id: string; name: string };
        bankStatement?: { id: string; name: string };
        proofOfAddress?: { id: string; name: string };
      };
      personalInfo?: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        occupation?: string;
        annualIncome?: number;
        ssn?: string;
        idType?: string;
      };
    }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createInvestment: (amount: number, paymentMethod: string, bonusCode?: string) => Promise<{ success: boolean; error?: string; investment?: Investment }>;
  createWithdrawal: (amount: number, withdrawalMethod: string, accountDetails: string) => Promise<{ success: boolean; error?: string; transaction?: Transaction }>;
  refreshData: () => Promise<void>;
  checkUser: () => Promise<void>;
  simulateTransactionStatusChange: (transactionId: string, newStatus: 'completed' | 'failed') => Promise<void>;
  updateUserProfile: (updates: { 
    name?: string; 
    phone?: string; 
    profilePicture?: string | null;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      occupation?: string;
      annualIncome?: number;
      ssn?: string;
      idType?: string;
    };
    secretPhrase?: string;
    preferences?: {
      darkMode?: boolean;
      currency?: string;
      showBalance?: boolean;
      notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      };
    };
  }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  getLoginHistory: () => Promise<LoginSession[]>;
  terminateSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  terminateAllOtherSessions: () => Promise<{ success: boolean; error?: string }>;
  // Payment method functions
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, '$id' | '$createdAt' | '$updatedAt' | 'userId'>) => Promise<{ success: boolean; error?: string; paymentMethod?: PaymentMethod }>;
  updatePaymentMethod: (paymentMethodId: string, updates: Partial<PaymentMethod>) => Promise<{ success: boolean; error?: string }>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<{ success: boolean; error?: string }>;
  // Payment method types functions
  getPaymentMethodTypes: () => Promise<PaymentMethodType[]>;
  addPaymentMethodType: (paymentMethodType: Omit<PaymentMethodType, '$id' | '$createdAt' | '$updatedAt'>) => Promise<{ success: boolean; error?: string; paymentMethodType?: PaymentMethodType }>;
  updatePaymentMethodType: (paymentMethodTypeId: string, updates: Partial<PaymentMethodType>) => Promise<{ success: boolean; error?: string }>;
  deletePaymentMethodType: (paymentMethodTypeId: string) => Promise<{ success: boolean; error?: string }>;
  // Bonus code functions
  validateBonusCode: (code: string) => Promise<{ success: boolean; error?: string; bonusCode?: BonusCode }>;
  
  // Investment management
  approveInvestment: (investmentId: string) => Promise<{ success: boolean; error?: string }>;
  createInvestmentForUser: (targetUserId: string, amount: number, paymentMethod: string, bonusCode?: string) => Promise<{ success: boolean; error?: string; investment?: Investment }>;
  fixInvestmentOwnership: (investmentId: string, correctUserId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Notification management
  createNotificationForUser: (targetUserId: string, notificationData: {
    type: 'transaction_update' | 'investment_update' | 'system' | 'security';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    transactionId?: string;
    investmentId?: string;
    actionUrl?: string;
  }) => Promise<void>;
  
  // Transfer functions
  transfers: Transfer[];
  createTransfer: (recipientIdentifier: string, amount: number, description?: string, balanceType?: 'available' | 'invested') => Promise<{ success: boolean; error?: string; transfer?: Transfer }>;
  fetchUserTransfers: () => Promise<void>;
  validateRecipient: (identifier: string) => Promise<{ success: boolean; recipient?: UserProfile; error?: string }>;
  
  // Admin functions
  databases: any;
  storage: any;
  DATABASE_ID: string;
  COLLECTIONS: any;
}

export interface Transfer {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  fromUserId: string;
  toUserId: string;
  fromUserEmail: string;
  toUserEmail: string;
  fromUserName: string;
  toUserName: string;
  amount: number; // in cents
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  transferType: 'internal'; // for now, only internal transfers
}

export interface LoginSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  loginTime: string;
  isCurrent: boolean;
  status: 'active' | 'expired' | 'suspicious';
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
