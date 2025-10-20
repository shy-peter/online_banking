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
  USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
  INVESTMENTS: import.meta.env.VITE_APPWRITE_INVESTMENTS_COLLECTION_ID || 'investments',
  TRANSACTIONS: import.meta.env.VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
  INTEREST_PAYMENTS: import.meta.env.VITE_APPWRITE_INTEREST_PAYMENTS_COLLECTION_ID || 'interest-payments',
  NOTIFICATIONS: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
  PAYMENT_METHODS: import.meta.env.VITE_APPWRITE_PAYMENT_METHODS_COLLECTION_ID || 'payment-methods',
  BONUS_CODES: import.meta.env.VITE_APPWRITE_BONUS_CODES_COLLECTION_ID || 'bonus-codes',
  TRANSFERS: import.meta.env.VITE_APPWRITE_TRANSFERS_COLLECTION_ID || 'transfers'
};

// Investment plans configuration
export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    minAmount: 100,
    maxAmount: 4999,
    interestRate: 15,
    description: 'Perfect for beginners looking to start their investment journey',
    features: ['15% Annual Interest', 'Multiple Payment Methods', 'Monthly Payouts'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    minAmount: 5000,
    maxAmount: 9999,
    interestRate: 15,
    description: 'Accelerate your wealth building with higher returns',
    features: ['15% Annual Interest', 'Priority Support', 'Monthly Payouts'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    minAmount: 10000,
    maxAmount: 49999,
    interestRate: 20,
    description: 'Enhanced returns for serious investors',
    features: ['20% Annual Interest', 'Premium Support', 'Weekly Payouts'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    minAmount: 50000,
    maxAmount: 99999,
    interestRate: 30,
    description: 'Maximum returns for elite investors',
    features: ['30% Annual Interest', 'Dedicated Manager', 'Weekly Payouts'],
    paymentMethods: ['venmo', 'cashapp', 'paypal', 'crypto']
  },
  {
    id: 'platinum',
    name: 'Platinum Plan',
    minAmount: 100000,
    maxAmount: 499999,
    interestRate: 40,
    description: 'Exclusive benefits for platinum investors',
    features: ['40% Annual Interest', 'VIP Support', 'Daily Payouts'],
    paymentMethods: ['crypto']
  },
  {
    id: 'diamond',
    name: 'Diamond Plan',
    minAmount: 500000,
    maxAmount: 999999,
    interestRate: 55,
    description: 'Ultra-premium returns for diamond tier',
    features: ['55% Annual Interest', 'Personal Advisor', 'Daily Payouts'],
    paymentMethods: ['crypto']
  },
  {
    id: 'ultimate',
    name: 'Ultimate Plan',
    minAmount: 1000000,
    maxAmount: null,
    interestRate: 70,
    description: 'The ultimate investment experience',
    features: ['70% Annual Interest', 'Private Banking', 'Real-time Payouts'],
    paymentMethods: ['crypto']
  }
];

// Utility functions
export const getInvestmentPlan = (amount: number): InvestmentPlan | undefined => {
  return INVESTMENT_PLANS.find(plan => 
    amount >= plan.minAmount && (plan.maxAmount === null || amount <= plan.maxAmount)
  );
};

export const calculateMonthlyInterest = (principal: number, annualRate: number): number => {
  return (principal * (annualRate / 100)) / 12;
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