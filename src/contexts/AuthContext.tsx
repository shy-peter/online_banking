import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS, generateAccountNumber, getInvestmentPlan, formatCurrency } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import type { User, UserProfile, Investment, Transaction, AuthContextType } from '../types/appwrite';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async (): Promise<void> => {
    setLoading(true);
    try {
      const session = await account.get();
      setUser(session);
      await fetchUserProfile(session.$id);
    } catch (error) {
      // No active session
      setUser(null);
      setUserProfile(null);
      setInvestments([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('userId', userId)]
      );
      
      if (response.documents.length > 0) {
        const profile = response.documents[0];
        setUserProfile(profile);
        await fetchUserInvestments(userId);
        await fetchUserTransactions(userId);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserInvestments = async (userId: string): Promise<void> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setInvestments(response.documents as Investment[]);
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchUserTransactions = async (userId: string): Promise<void> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(50)]
      );
      setTransactions(response.documents as Transaction[]);
      
      // If no transactions exist, create some demo transactions
      if (response.documents.length === 0) {
        await createDemoTransactions(userId);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const createDemoTransactions = async (userId: string): Promise<void> => {
    try {
      // Create demo transactions for new users
      const demoTransactions = [
        {
          userId: userId,
          type: 'investment' as const,
          amount: 100000, // $1000 in cents
          description: 'Initial investment via PayPal',
          status: 'completed' as const,
          reference: 'DEMO-001',
          paymentMethod: 'paypal'
        },
        {
          userId: userId,
          type: 'earning' as const,
          amount: 15000, // $150 in cents
          description: 'Monthly interest payment',
          status: 'completed' as const,
          reference: 'DEMO-002',
          paymentMethod: 'system'
        },
        {
          userId: userId,
          type: 'investment' as const,
          amount: 50000, // $500 in cents
          description: 'Additional investment via Venmo',
          status: 'pending' as const,
          reference: 'DEMO-003',
          paymentMethod: 'venmo'
        }
      ];

      for (const transaction of demoTransactions) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          ID.unique(),
          {
            ...transaction,
            createdAt: new Date().toISOString()
          },
          [
            `read("user:${userId}")`,
            `update("user:${userId}")`,
            `delete("user:${userId}")`
          ]
        );
      }

      // Refresh transactions after creating demo data
      await fetchUserTransactions(userId);
    } catch (error) {
      console.error('Error creating demo transactions:', error);
    }
  };

  const clearExistingSession = async (): Promise<void> => {
    try {
      // Only attempt to delete if a session exists to avoid an expected 401
      await account.get();
      try {
        await account.deleteSession('current');
      } catch (error) {
        // Ignore deletion errors
      }
    } catch (error) {
      // No active session; nothing to clear
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await clearExistingSession();
      await account.createEmailSession(email, password);
      await checkUser();
      toast.success('Successfully logged in!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      await clearExistingSession();
      
      // Create user account
      const newUser = await account.create(ID.unique(), email, password, name);
      
      // Create session
      await account.createEmailSession(email, password);
      // Ensure session is active before making database calls
      await account.get();
      
      // Generate unique account number
      const accountNumber = generateAccountNumber();
      
      // Create user profile in database
      const userProfile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          userId: newUser.$id,
          name: name,
          email: email,
          accountNumber: accountNumber,
          totalBalance: 0,
          availableBalance: 0,
          status: 'active' as const,
          createdAt: new Date().toISOString()
        },
        [
          `read("user:${newUser.$id}")`,
          `update("user:${newUser.$id}")`,
          `delete("user:${newUser.$id}")`
        ]
      );
      
      // Create welcome transaction
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: newUser.$id,
          type: 'account_created' as const,
          amount: 0,
          description: 'Account created successfully',
          status: 'completed' as const,
          reference: `ACC-${accountNumber}`
        },
        [
          `read("user:${newUser.$id}")`,
          `update("user:${newUser.$id}")`,
          `delete("user:${newUser.$id}")`
        ]
      );
      
      await checkUser();
      toast.success(`Account created successfully! Your account number is: ${accountNumber}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await account.deleteSession('current');
      setUser(null);
      setUserProfile(null);
      setInvestments([]);
      setTransactions([]);
      toast.success('Successfully logged out!');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const createNotification = async (notificationData: {
    type: 'transaction_update' | 'investment_update' | 'system' | 'security';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    transactionId?: string;
    investmentId?: string;
    actionUrl?: string;
  }): Promise<void> => {
    if (!user) return;

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        {
          userId: user.$id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          isRead: 'false',
          priority: notificationData.priority,
          transactionId: notificationData.transactionId,
          investmentId: notificationData.investmentId,
          actionUrl: notificationData.actionUrl,
          createdAt: new Date().toISOString()
        },
        [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`
        ]
      );
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const createInvestment = async (amount: number, paymentMethod: string): Promise<{ success: boolean; error?: string; investment?: Investment }> => {
    if (!user) {
      toast.error('Please login first');
      return { success: false };
    }

    try {
      const plan = getInvestmentPlan(amount);
      const interestRate = plan ? plan.interestRate : 15;
      
      // Create investment record
      const investment = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        ID.unique(),
        {
          userId: user.$id,
          amount: Math.round(amount * 100), // Convert to cents
          plan: plan ? plan.id : 'starter', // Add required plan attribute
          status: 'pending' as const,
          interestRate: interestRate,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          createdAt: new Date().toISOString() // Add required createdAt attribute
        },
        [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`
        ]
      );

      // Create transaction record
      const transaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: user.$id,
          type: 'investment' as const,
          amount: Math.round(amount * 100), // Convert to cents
          description: `Investment of ${formatCurrency(amount * 100)} via ${paymentMethod}`,
          status: 'pending' as const,
          reference: `INV-${investment.$id.slice(-8).toUpperCase()}`,
          investmentId: investment.$id,
          paymentMethod: paymentMethod
        },
        [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`
        ]
      );

      // Create notification for new investment
      await createNotification({
        type: 'investment_update',
        title: 'New Investment Created',
        message: `Your investment of ${formatCurrency(amount * 100)} via ${paymentMethod} has been created and is pending approval.`,
        priority: 'medium',
        investmentId: investment.$id,
        transactionId: transaction.$id,
        actionUrl: '/investments'
      });

      // Refresh data
      await fetchUserInvestments(user.$id);
      await fetchUserTransactions(user.$id);
      
      toast.success('Investment created successfully!');
      return { success: true, investment: investment as Investment };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create investment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshData = async (): Promise<void> => {
    if (user) {
      await fetchUserProfile(user.$id);
    }
  };

  const updateUserProfile = async (updates: { name?: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    if (!user || !userProfile) {
      return { success: false, error: 'User not found' };
    }

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userProfile.$id,
        {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      );

      // Refresh user profile
      await fetchUserProfile(user.$id);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Simulate transaction status changes (for demo purposes)
  const simulateTransactionStatusChange = async (transactionId: string, newStatus: 'completed' | 'failed'): Promise<void> => {
    if (!user) return;

    try {
      // Update transaction status
      const updatedTransaction = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        transactionId,
        {
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      );

      // Create notification based on status change
      const transaction = updatedTransaction as Transaction;
      const amount = formatCurrency(transaction.amount);
      
      if (newStatus === 'completed') {
        await createNotification({
          type: 'transaction_update',
          title: 'Transaction Completed',
          message: `Your ${transaction.type} of ${amount} has been successfully completed.`,
          priority: 'medium',
          transactionId: transaction.$id,
          actionUrl: '/transactions'
        });
      } else if (newStatus === 'failed') {
        await createNotification({
          type: 'transaction_update',
          title: 'Transaction Failed',
          message: `Your ${transaction.type} of ${amount} has failed. Please contact support if you need assistance.`,
          priority: 'high',
          transactionId: transaction.$id,
          actionUrl: '/transactions'
        });
      }

      // Refresh transactions
      await fetchUserTransactions(user.$id);
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    investments,
    transactions,
    login,
    register,
    logout,
    createInvestment,
    refreshData,
    checkUser,
    simulateTransactionStatusChange,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};