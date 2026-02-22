import { Client, Account, Databases, Storage, ID } from 'appwrite';
import appwriteConfig from '../../appwrite.config.json';
import type { InvestmentPlan } from '../types/appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(
    import.meta.env.VITE_APPWRITE_PROJECT_ID || appwriteConfig?.projectId
  );

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

// Database configuration (env overrides with sensible defaults that match setup-database.sh)
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'investflow-db';
export const COLLECTIONS = {
  MESSAGES: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID || 'messages',
  USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
  INVESTMENTS: import.meta.env.VITE_APPWRITE_INVESTMENTS_COLLECTION_ID || 'investments',
  TRANSACTIONS: import.meta.env.VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
  INTEREST_PAYMENTS: import.meta.env.VITE_APPWRITE_INTEREST_PAYMENTS_COLLECTION_ID || 'interest-payments',
  NOTIFICATIONS: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
  PAYMENT_METHODS: import.meta.env.VITE_APPWRITE_PAYMENT_METHODS_COLLECTION_ID || 'payment-methods',
  BONUS_CODES: import.meta.env.VITE_APPWRITE_BONUS_CODES_COLLECTION_ID || 'bonus-codes',
  TRANSFERS: import.meta.env.VITE_APPWRITE_TRANSFERS_COLLECTION_ID || 'transfers'
  ,REFERRALS: import.meta.env.VITE_APPWRITE_REFERRALS_COLLECTION_ID || 'referrals'
};

// Investment plans configuration
export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    minAmount: 50,
    maxAmount: 1000,
    interestRate: 2, // 2% per month
    description: 'Entry‑level plan with a low minimum deposit',
    features: ['2% Monthly Interest', 'Multiple Payment Methods'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'silver',
    name: 'Silver Plan',
    minAmount: 1000,
    maxAmount: 5000,
    interestRate: 5, // 5% per month
    description: 'Designed for medium‑sized deposits with enhanced returns',
    features: ['5% Monthly Interest', 'Priority Support'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    minAmount: 5000,
    maxAmount: 30000,
    interestRate: 8, // 8% per month
    description: 'High‑value plan offering the best monthly rates',
    features: ['8% Monthly Interest', 'Premium Support'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'platinum',
    name: 'Platinum Plan',
    minAmount: 30001,
    maxAmount: null,
    interestRate: 10, // 10% per month for deposits above $30k
    description: 'Top tier plan for very large deposits',
    features: ['10% Monthly Interest', 'Dedicated Support'],
    paymentMethods: ['crypto']
  }
];

// Utility functions
export const getInvestmentPlan = (amount: number): InvestmentPlan | undefined => {
  return INVESTMENT_PLANS.find(plan => 
    amount >= plan.minAmount && (plan.maxAmount === null || amount <= plan.maxAmount)
  );
};

// now interprets `interestRate` as a monthly percentage instead of annual
export const calculateMonthlyInterest = (principal: number, monthlyRate: number): number => {
  // monthly rate already expressed as percentage; convert to decimal
  return principal * (monthlyRate / 100);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 100); // Convert from cents
};

export const generateAccountNumber = (): string => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

export default client;
