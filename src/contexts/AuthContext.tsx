import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account, databases, storage, DATABASE_ID, COLLECTIONS, generateAccountNumber, getInvestmentPlan, formatCurrency } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import type { User, UserProfile, Investment, Transaction, AuthContextType, LoginSession, PaymentMethod, BonusCode, Transfer } from '../types/appwrite';

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async (): Promise<void> => {
    setLoading(true);
    try {
      const session = await account.get();
      setUser(session);
      
      // Fetch user profile to check status
      const userProfile = await fetchUserProfileForLogin(session.$id);
      
      // Check if user account is still active
      if (userProfile.status === 'suspended') {
        await account.deleteSession('current');
        setUser(null);
        setUserProfile(null);
        setInvestments([]);
        setTransactions([]);
        setPaymentMethods([]);
        toast.error('Your account has been suspended. Please contact support.');
        return;
      }
      
      if (userProfile.status === 'inactive') {
        await account.deleteSession('current');
        setUser(null);
        setUserProfile(null);
        setInvestments([]);
        setTransactions([]);
        setPaymentMethods([]);
        toast.error('Your account is inactive. Please contact support.');
        return;
      }
      
      // If account is active, proceed with normal data fetching
      await fetchUserProfile(session.$id);
      await fetchUserPaymentMethods(session.$id);
    } catch (error) {
      // No active session
      setUser(null);
      setUserProfile(null);
      setInvestments([]);
      setTransactions([]);
      setPaymentMethods([]);
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
        
        // Parse JSON strings back to objects
        if (profile.documents && typeof profile.documents === 'string') {
          try {
            profile.documents = JSON.parse(profile.documents);
          } catch (error) {
            console.error('Error parsing documents JSON:', error);
            profile.documents = {};
          }
        }
        
        if (profile.personalInfo && typeof profile.personalInfo === 'string') {
          try {
            profile.personalInfo = JSON.parse(profile.personalInfo);
          } catch (error) {
            console.error('Error parsing personalInfo JSON:', error);
            profile.personalInfo = {};
          }
        }
        
        if (profile.preferences && typeof profile.preferences === 'string') {
          try {
            profile.preferences = JSON.parse(profile.preferences);
          } catch (error) {
            console.error('Error parsing preferences JSON:', error);
            profile.preferences = {};
          }
        }
        
        setUserProfile(profile);
        await fetchUserInvestments(userId);
        await fetchUserTransactions(userId);
        await fetchUserTransfers();
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Helper function to fetch user profile for login status checking
  const fetchUserProfileForLogin = async (userId: string): Promise<UserProfile> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('userId', userId)]
      );
      
      if (response.documents.length > 0) {
        const profile = response.documents[0];
        
        // Parse JSON strings back to objects
        if (profile.documents && typeof profile.documents === 'string') {
          try {
            profile.documents = JSON.parse(profile.documents);
          } catch (error) {
            console.error('Error parsing documents JSON:', error);
            profile.documents = {};
          }
        }
        
        if (profile.personalInfo && typeof profile.personalInfo === 'string') {
          try {
            profile.personalInfo = JSON.parse(profile.personalInfo);
          } catch (error) {
            console.error('Error parsing personalInfo JSON:', error);
            profile.personalInfo = {};
          }
        }
        
        if (profile.preferences && typeof profile.preferences === 'string') {
          try {
            profile.preferences = JSON.parse(profile.preferences);
          } catch (error) {
            console.error('Error parsing preferences JSON:', error);
            profile.preferences = {};
          }
        }
        
        return profile as UserProfile;
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Error fetching user profile for login:', error);
      throw error;
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

  const fetchUserPaymentMethods = async (userId: string): Promise<void> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setPaymentMethods(response.documents as PaymentMethod[]);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setPaymentMethods([]);
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
      
      // Get the user session to get the user ID
      const session = await account.get();
      
      // Fetch user profile to check status
      const userProfile = await fetchUserProfileForLogin(session.$id);
      
      // Check if user account is active
      if (userProfile.status === 'suspended') {
        await account.deleteSession('current');
        toast.error('Your account has been suspended. Please contact support.');
        return { success: false, error: 'Account suspended' };
      }
      
      if (userProfile.status === 'inactive') {
        await account.deleteSession('current');
        toast.error('Your account is inactive. Please contact support.');
        return { success: false, error: 'Account inactive' };
      }
      
      // If account is active, proceed with normal login
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

  // Enhanced signup function with documents and secret phrase
  const signup = async (
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
  ): Promise<{ success: boolean; error?: string }> => {
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
      
      // Prepare user profile data
      const userProfileData: any = {
        userId: newUser.$id,
        name: name,
        email: email,
        accountNumber: accountNumber,
        totalBalance: 0,
        availableBalance: 0,
        status: 'active' as const,
        createdAt: new Date().toISOString()
      };

      // Add additional data if provided
      if (additionalData) {
        if (additionalData.phone) {
          userProfileData.phone = additionalData.phone;
        }
        if (additionalData.secretPhrase) {
          userProfileData.secretPhrase = additionalData.secretPhrase;
        }
        if (additionalData.documents) {
          userProfileData.documents = JSON.stringify(additionalData.documents);
        }
        if (additionalData.personalInfo) {
          userProfileData.personalInfo = JSON.stringify(additionalData.personalInfo);
        }
      }
      
      // Create user profile in database
      const userProfile = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        userProfileData,
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
          description: 'Account created successfully with enhanced security',
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
        }
      );
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw error - notification creation is optional
    }
  };

  // Create notification for a specific user
  const createNotificationForUser = async (targetUserId: string, notificationData: {
    type: 'transaction_update' | 'investment_update' | 'system' | 'security';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    transactionId?: string;
    investmentId?: string;
    actionUrl?: string;
  }): Promise<void> => {
    try {
      console.log('Creating notification for target user:', targetUserId);
      console.log('Current user ID (admin):', user.$id);
      console.log('Notification data:', notificationData);
      
      
      const notificationDoc = {
        userId: targetUserId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        isRead: 'false',
        priority: notificationData.priority,
        transactionId: notificationData.transactionId,
        investmentId: notificationData.investmentId,
        actionUrl: notificationData.actionUrl,
        createdAt: new Date().toISOString()
      };
      
      console.log('Notification document to create:', notificationDoc);
      
      const result = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        notificationDoc
      );
      
      console.log('Notification created successfully:', result);
    } catch (error) {
      console.error('Error creating notification for user:', error);
      console.error('Target user ID:', targetUserId);
      console.error('Notification data:', notificationData);
      // Don't throw error - notification creation is optional
    }
  };

  // Create investment on behalf of a user (admin function)
  const createInvestmentForUser = async (targetUserId: string, amount: number, paymentMethod: string, bonusCode?: string): Promise<{ success: boolean; error?: string; investment?: Investment }> => {
    if (!user) {
      toast.error('Please login first');
      return { success: false, error: 'Not logged in' };
    }

    // Check if current user is an admin
    const isAdmin = userProfile?.email?.includes('admin') || userProfile?.name?.includes('Admin');
    if (!isAdmin) {
      toast.error('Only admins can create investments for other users');
      return { success: false, error: 'Not authorized' };
    }

    try {
      const plan = getInvestmentPlan(amount);
      let interestRate = plan ? plan.interestRate : 15;
      let dailyRate = 0;
      let monthlyRate = 0;
      let bonusCodeId = undefined;
      let bonusCodeUsed = undefined;

      // Handle bonus code if provided
      if (bonusCode) {
        const bonusResult = await validateBonusCode(bonusCode);
        if (bonusResult.success && bonusResult.bonusCode) {
          dailyRate = bonusResult.bonusCode.dailyRate;
          monthlyRate = bonusResult.bonusCode.monthlyRate;
          bonusCodeId = bonusResult.bonusCode.$id;
          bonusCodeUsed = bonusResult.bonusCode.code;
          
          // Increment usage count
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.BONUS_CODES,
            bonusResult.bonusCode.$id,
            {
              usageCount: bonusResult.bonusCode.usageCount + 1,
              updatedAt: new Date().toISOString()
            }
          );
        } else {
          return { success: false, error: bonusResult.error || 'Invalid bonus code' };
        }
      }

      // Create transaction record
      const transaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: targetUserId, // Use target user's ID, not admin's ID
          type: 'investment',
          amount: Math.round(amount * 100), // Convert to cents
          status: 'pending',
          description: `Investment of ${formatCurrency(amount * 100)} via ${paymentMethod}`,
          paymentMethod: paymentMethod,
          reference: `INV-${Date.now()}`,
          createdAt: new Date().toISOString()
        }
      );
      
      // Create investment record
      const investment = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        ID.unique(),
        {
          userId: targetUserId, // Use target user's ID, not admin's ID
          amount: Math.round(amount * 100), // Convert to cents
          plan: plan ? plan.id : 'starter',
          status: 'pending' as const,
          interestRate: interestRate,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bonusCodeId: bonusCodeId,
          bonusCode: bonusCodeUsed,
          dailyRate: dailyRate,
          monthlyRate: monthlyRate
        }
      );

      // Update transaction with investment ID
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        transaction.$id,
        {
          investmentId: investment.$id,
          updatedAt: new Date().toISOString()
        }
      );

      // Create notification for pending deposit
      try {
        await createNotificationForUser(targetUserId, {
          type: 'investment_update',
          title: 'Deposit Pending',
          message: `Deposit of ${formatCurrency(amount * 100)} via ${paymentMethod} is awaiting confirmation`,
          priority: 'medium',
          investmentId: investment.$id,
          transactionId: transaction.$id,
          actionUrl: '/investments'
        });
      } catch (notificationError) {
        console.error('Failed to create deposit notification:', notificationError);
        // Don't throw error - notification creation is optional
      }

      // Refresh investments data for admin
      await fetchUserInvestments(user.$id);
      
      toast.success('Investment created successfully for user!');
      return { success: true, investment: investment as Investment };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create investment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Fix investment ownership (admin function)
  const fixInvestmentOwnership = async (investmentId: string, correctUserId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if current user is an admin
      const isAdmin = userProfile?.email?.includes('admin') || userProfile?.name?.includes('Admin');
      if (!isAdmin) {
        return { success: false, error: 'Not authorized' };
      }

      // Get the investment details
      const investment = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        investmentId
      );

      console.log('Fixing investment ownership:', {
        investmentId: investment.$id,
        currentUserId: investment.userId,
        correctUserId: correctUserId
      });

      // Update investment to correct user
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        investmentId,
        {
          userId: correctUserId,
          updatedAt: new Date().toISOString()
        }
      );

      // Also update the associated transaction
      if (investment.transactionId) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          investment.transactionId,
          {
            userId: correctUserId,
            updatedAt: new Date().toISOString()
          }
        );
      }

      console.log('Investment ownership fixed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error fixing investment ownership:', error);
      return { success: false, error: error.message || 'Failed to fix investment ownership' };
    }
  };

  // Approve investment
  const approveInvestment = async (investmentId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get the investment details first
      const investment = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        investmentId
      );

      // Update investment status to active
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.INVESTMENTS,
        investmentId,
        {
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      );

      // Create success notification for the investment owner
      try {
        console.log('Creating notification for user:', investment.userId);
        console.log('Current admin user ID:', user.$id);
        console.log('Investment details:', {
          id: investment.$id,
          userId: investment.userId,
          amount: investment.amount,
          paymentMethod: investment.paymentMethod
        });
        
        
        await createNotificationForUser(investment.userId, {
          type: 'investment_update',
          title: 'Investment Successful',
          message: `Your investment of ${formatCurrency(investment.amount * 100)} via ${investment.paymentMethod} is successful`,
          priority: 'high',
          investmentId: investmentId,
          actionUrl: '/investments'
        });
        
        console.log('Success notification created for user:', investment.userId);
      } catch (notificationError) {
        console.error('Failed to create success notification:', notificationError);
      }

      // Refresh investments data
      await fetchUserInvestments(user.$id);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error approving investment:', error);
      return { success: false, error: error.message || 'Failed to approve investment' };
    }
  };

  // Validate bonus code
  const validateBonusCode = async (code: string): Promise<{ success: boolean; error?: string; bonusCode?: BonusCode }> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BONUS_CODES,
        [Query.equal('code', code.toUpperCase()), Query.equal('isActive', true)]
      );

      if (response.documents.length === 0) {
        return { success: false, error: 'Invalid or inactive bonus code' };
      }

      const bonusCode = response.documents[0] as BonusCode;

      // Check if code has expired
      if (bonusCode.expiryDate && new Date(bonusCode.expiryDate) < new Date()) {
        return { success: false, error: 'Bonus code has expired' };
      }

      // Check usage limit
      if (bonusCode.usageLimit && bonusCode.usageCount >= bonusCode.usageLimit) {
        return { success: false, error: 'Bonus code usage limit reached' };
      }

      return { success: true, bonusCode };
    } catch (error: any) {
      console.error('Error validating bonus code:', error);
      return { success: false, error: 'Failed to validate bonus code' };
    }
  };

  const createInvestment = async (amount: number, paymentMethod: string, bonusCode?: string): Promise<{ success: boolean; error?: string; investment?: Investment }> => {
    if (!user) {
      toast.error('Please login first');
      return { success: false };
    }

    // Check if current user is an admin (prevent admins from creating investments)
    const isAdmin = userProfile?.email?.includes('admin') || userProfile?.name?.includes('Admin');
    if (isAdmin) {
      console.warn('WARNING: Admin user is trying to create an investment!');
      console.warn('Admin user ID:', user.$id);
      console.warn('Admin email:', userProfile?.email);
      toast.error('Admins cannot create investments. Please use a regular user account.');
      return { success: false, error: 'Admins cannot create investments' };
    }

    try {
      const plan = getInvestmentPlan(amount);
      let interestRate = plan ? plan.interestRate : 15;
      let dailyRate = 0;
      let monthlyRate = 0;
      let bonusCodeId: string | undefined;
      let bonusCodeUsed: string | undefined;

      // Validate bonus code if provided
      if (bonusCode) {
        const bonusResult = await validateBonusCode(bonusCode);
        if (bonusResult.success && bonusResult.bonusCode) {
          bonusCodeId = bonusResult.bonusCode.$id;
          bonusCodeUsed = bonusResult.bonusCode.code;
          dailyRate = bonusResult.bonusCode.dailyRate;
          monthlyRate = bonusResult.bonusCode.monthlyRate;
          
          // Update usage count
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.BONUS_CODES,
            bonusCodeId,
            {
              usageCount: bonusResult.bonusCode.usageCount + 1,
              updatedAt: new Date().toISOString()
            }
          );
        } else {
          toast.error(bonusResult.error || 'Invalid bonus code');
          return { success: false, error: bonusResult.error || 'Invalid bonus code' };
        }
      }
      
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
          createdAt: new Date().toISOString(), // Add required createdAt attribute
          bonusCodeId: bonusCodeId,
          bonusCode: bonusCodeUsed,
          dailyRate: dailyRate,
          monthlyRate: monthlyRate
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

      // Create notification for pending deposit
      try {
        await createNotificationForUser(user.$id, {
          type: 'investment_update',
          title: 'Deposit Pending',
          message: `Deposit of ${formatCurrency(amount * 100)} via ${paymentMethod} is awaiting confirmation`,
          priority: 'medium',
          investmentId: investment.$id,
          transactionId: transaction.$id,
          actionUrl: '/investments'
        });
      } catch (notificationError) {
        console.error('Failed to create deposit notification:', notificationError);
        // Don't throw error - notification creation is optional
      }

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

  const createWithdrawal = async (amount: number, withdrawalMethod: string, accountDetails: string): Promise<{ success: boolean; error?: string; transaction?: Transaction }> => {
    if (!user || !userProfile) {
      toast.error('Please login first');
      return { success: false };
    }

    // Calculate available balance (earnings minus completed withdrawals)
    const totalEarnings = transactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const availableBalance = totalEarnings - totalWithdrawals;

    // Check if user has sufficient balance
    if (amount * 100 > availableBalance) {
      toast.error('Insufficient balance for withdrawal');
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      // Create withdrawal transaction record
      const transaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: user.$id,
          type: 'withdrawal' as const,
          amount: Math.round(amount * 100), // Convert to cents
          description: `Withdrawal of ${formatCurrency(amount * 100)} via ${withdrawalMethod} to ${accountDetails}`,
          status: 'pending' as const,
          reference: `WTH-${Date.now().toString().slice(-8).toUpperCase()}`,
          paymentMethod: withdrawalMethod
        },
        [
          `read("user:${user.$id}")`,
          `update("user:${user.$id}")`,
          `delete("user:${user.$id}")`
        ]
      );

      // No processing notification - users will only get success notifications when approved

      // Refresh data
      await fetchUserTransactions(user.$id);
      
      toast.success('Withdrawal request submitted successfully!');
      return { success: true, transaction: transaction as Transaction };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create withdrawal request';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const refreshData = async (): Promise<void> => {
    if (user) {
      await fetchUserProfile(user.$id);
    }
  };

  // Refresh specific user's data (for admin operations)
  const refreshUserData = async (userId: string): Promise<void> => {
    try {
      // This would be called by admin to refresh a specific user's data
      // For now, we'll just log it since we can't directly update another user's session
      console.log(`User ${userId} data should be refreshed`);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };


  const updateUserProfile = async (updates: { 
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
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user || !userProfile) {
      return { success: false, error: 'User not found' };
    }

    try {
      // Filter out profilePicture for now since the attribute doesn't exist in the database yet
      const { profilePicture, personalInfo, preferences, ...allowedUpdates } = updates;
      
      // If profilePicture is provided, store it in localStorage temporarily
      if (profilePicture !== undefined) {
        localStorage.setItem(`profilePicture_${user.$id}`, profilePicture || '');
      }

      // Prepare the update object
      const updateData: any = {
        ...allowedUpdates,
        updatedAt: new Date().toISOString()
      };

      // If personalInfo is provided, serialize it as JSON string
      if (personalInfo) {
        updateData.personalInfo = JSON.stringify(personalInfo);
      }

      // If preferences is provided, serialize it as JSON string
      if (preferences) {
        updateData.preferences = JSON.stringify(preferences);
      }

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userProfile.$id,
        updateData
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

  // Admin function to update any user (including status changes)
  const updateUser = async (userProfileId: string, updates: any): Promise<{ success: boolean; error?: string }> => {
    try {
      // Update the user profile document in the database
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userProfileId,
        {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      );
      
      // If updating the current user's profile, refresh local data
      if (userProfile && userProfile.$id === userProfileId) {
        await fetchUserProfile(user.$id);
      }
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user';
      console.error('Error updating user:', error);
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // Update the password directly - Appwrite will verify the current password
      await account.updatePassword(newPassword, currentPassword);
      
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to change password';
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('401')) {
        return { success: false, error: 'Current password is incorrect' };
      }
      if (errorMessage.includes('Password must be at least 8 characters')) {
        return { success: false, error: 'New password must be at least 8 characters long' };
      }
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get login history function
  const getLoginHistory = async (): Promise<LoginSession[]> => {
    if (!user) {
      return [];
    }

    try {
      // Get current session info
      const currentSession = await account.get();
      
      // Get all sessions for the current user
      const sessions = await account.listSessions();
      
      // Convert Appwrite sessions to our LoginSession format
      const loginSessions: LoginSession[] = sessions.sessions.map((session, index) => {
        // Try to extract device/browser info from user agent if available
        const userAgent = session.userAgent || '';
        const device = getUserDevice(userAgent);
        const browser = getBrowser(userAgent);
        const os = getOperatingSystem(userAgent);
        
        return {
          id: session.$id,
          device: device,
          browser: browser,
          os: os,
          location: getLocationFromIP(session.ip), // You might want to implement IP geolocation
          ipAddress: session.ip || 'Unknown',
          loginTime: session.$createdAt,
          isCurrent: session.$id === currentSession.$id,
          status: session.current ? 'active' : 'expired'
        };
      });

      // Sort by login time (most recent first)
      return loginSessions.sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
    } catch (error) {
      console.error('Error fetching login history:', error);
      return [];
    }
  };

  // Helper function to detect device from user agent
  const getUserDevice = (userAgent: string): string => {
    if (!userAgent) return 'Unknown Device';
    
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad/i.test(userAgent)) return 'iPad';
      if (/iPhone/i.test(userAgent)) return 'iPhone';
      if (/Android/i.test(userAgent)) return 'Android Phone';
      return 'Mobile Device';
    }
    
    if (/Macintosh|Mac OS X/i.test(userAgent)) return 'Mac';
    if (/Windows/i.test(userAgent)) return 'Windows PC';
    if (/Linux/i.test(userAgent)) return 'Linux PC';
    
    return 'Desktop';
  };

  // Helper function to detect browser from user agent
  const getBrowser = (userAgent: string): string => {
    if (!userAgent) return 'Unknown Browser';
    
    if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) {
      const version = userAgent.match(/Chrome\/(\d+)/);
      return version ? `Chrome ${version[1]}` : 'Chrome';
    }
    if (/Firefox/i.test(userAgent)) {
      const version = userAgent.match(/Firefox\/(\d+)/);
      return version ? `Firefox ${version[1]}` : 'Firefox';
    }
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      const version = userAgent.match(/Version\/(\d+)/);
      return version ? `Safari ${version[1]}` : 'Safari';
    }
    if (/Edge|Edg/i.test(userAgent)) {
      const version = userAgent.match(/Edge?\/(\d+)/);
      return version ? `Edge ${version[1]}` : 'Edge';
    }
    
    return 'Unknown Browser';
  };

  // Helper function to detect operating system from user agent
  const getOperatingSystem = (userAgent: string): string => {
    if (!userAgent) return 'Unknown OS';
    
    if (/Windows NT 10.0/i.test(userAgent)) return 'Windows 10/11';
    if (/Windows NT 6.3/i.test(userAgent)) return 'Windows 8.1';
    if (/Windows NT 6.2/i.test(userAgent)) return 'Windows 8';
    if (/Windows NT 6.1/i.test(userAgent)) return 'Windows 7';
    if (/Mac OS X 10.15/i.test(userAgent)) return 'macOS Catalina';
    if (/Mac OS X 10.14/i.test(userAgent)) return 'macOS Mojave';
    if (/Mac OS X 10.13/i.test(userAgent)) return 'macOS High Sierra';
    if (/Mac OS X/i.test(userAgent)) return 'macOS';
    if (/Android/i.test(userAgent)) {
      const version = userAgent.match(/Android (\d+\.?\d*)/);
      return version ? `Android ${version[1]}` : 'Android';
    }
    if (/iPhone OS|iOS/i.test(userAgent)) {
      const version = userAgent.match(/OS (\d+)_/);
      return version ? `iOS ${version[1]}` : 'iOS';
    }
    if (/Linux/i.test(userAgent)) return 'Linux';
    
    return 'Unknown OS';
  };

  // Helper function to get location from IP (placeholder - you might want to use a real IP geolocation service)
  const getLocationFromIP = (ip: string): string => {
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'Local Network';
    }
    // For demo purposes, return a generic location
    // In a real app, you'd use an IP geolocation service like ipapi.co or ipinfo.io
    return 'Unknown Location';
  };

  // Terminate session function
  const terminateSession = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // Get current session to check if trying to terminate current session
      const currentSession = await account.get();
      if (sessionId === currentSession.$id) {
        return { success: false, error: 'Cannot terminate current session' };
      }

      // Terminate the specific session
      await account.deleteSession(sessionId);
      
      toast.success('Session terminated successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to terminate session';
      if (errorMessage.includes('Session not found')) {
        return { success: false, error: 'Session not found or already expired' };
      }
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Terminate all other sessions function
  const terminateAllOtherSessions = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // Get current session
      const currentSession = await account.get();
      
      // Get all sessions
      const sessions = await account.listSessions();
      
      // Terminate all sessions except the current one
      const terminationPromises = sessions.sessions
        .filter(session => session.$id !== currentSession.$id)
        .map(session => account.deleteSession(session.$id));
      
      await Promise.all(terminationPromises);
      
      toast.success('All other sessions terminated successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to terminate sessions';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Simulate transaction status changes (admin only)
  const simulateTransactionStatusChange = async (transactionId: string, newStatus: 'completed' | 'failed'): Promise<void> => {
    if (!user || !userProfile) return;
    
    // Check if user is admin
    const isAdmin = userProfile.email?.includes('admin') || userProfile.name?.includes('Admin');
    if (!isAdmin) {
      toast.error('Only administrators can change transaction status');
      return;
    }

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

      // Handle business logic based on transaction type and status
      const transaction = updatedTransaction as Transaction;
      const amount = formatCurrency(transaction.amount);
      
      if (newStatus === 'completed') {
        // Handle completed investment transactions
        if (transaction.type === 'investment') {
          // Update or create investment record
          if (transaction.investmentId) {
            // Update existing investment status
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.INVESTMENTS,
              transaction.investmentId,
              {
                status: 'active',
                updatedAt: new Date().toISOString()
              }
            );
          } else {
            // Create new investment record
            const investment = await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.INVESTMENTS,
              ID.unique(),
              {
                userId: transaction.userId,
                amount: transaction.amount,
                plan: 'Premium Plan', // Default plan, you can make this dynamic
                status: 'active',
                interestRate: 12, // Default interest rate, you can make this dynamic
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
              },
              [
                `read("user:${transaction.userId}")`,
                `update("user:${transaction.userId}")`
              ]
            );

            // Update transaction with investment ID
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.TRANSACTIONS,
              transactionId,
              {
                investmentId: investment.$id,
                updatedAt: new Date().toISOString()
              }
            );
          }

          // Update user's total balance
          const userResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [Query.equal('userId', transaction.userId)]
          );
          
          if (userResponse.documents.length > 0) {
            const userProfile = userResponse.documents[0];
            const newTotalBalance = userProfile.totalBalance + transaction.amount;
            
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              userProfile.$id,
              {
                totalBalance: newTotalBalance,
                updatedAt: new Date().toISOString()
              }
            );
          }
        }

        // Handle completed withdrawal transactions
        if (transaction.type === 'withdrawal') {
          // Deduct from user's available balance
          const userResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [Query.equal('userId', transaction.userId)]
          );
          
          if (userResponse.documents.length > 0) {
            const userProfile = userResponse.documents[0];
            const newAvailableBalance = userProfile.availableBalance - transaction.amount;
            
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              userProfile.$id,
              {
                availableBalance: Math.max(0, newAvailableBalance),
                updatedAt: new Date().toISOString()
              }
            );
          }
        }

        await createNotificationForUser(transaction.userId, {
          type: 'transaction_update',
          title: 'Transaction Completed',
          message: `Your ${transaction.type} of ${amount} has been successfully completed.`,
          priority: 'medium',
          transactionId: transaction.$id,
          actionUrl: '/transactions'
        });
      } else if (newStatus === 'failed') {
        await createNotificationForUser(transaction.userId, {
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

  // Payment method types functions
  const getPaymentMethodTypes = async (): Promise<PaymentMethodType[]> => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        'payment-method-types',
        []
      );
      return response.documents as PaymentMethodType[];
    } catch (error) {
      console.error('Error fetching payment method types:', error);
      return [];
    }
  };

  const addPaymentMethodType = async (paymentMethodType: Omit<PaymentMethodType, '$id' | '$createdAt' | '$updatedAt'>): Promise<{ success: boolean; error?: string; paymentMethodType?: PaymentMethodType }> => {
    try {
      const newPaymentMethodType = await databases.createDocument(
        DATABASE_ID,
        'payment-method-types',
        paymentMethodType.type,
        paymentMethodType
      );
      
      toast.success('Payment method type added successfully!');
      return { success: true, paymentMethodType: newPaymentMethodType as PaymentMethodType };
    } catch (error: any) {
      console.error('Error adding payment method type:', error);
      toast.error(error.message || 'Failed to add payment method type');
      return { success: false, error: error.message || 'Failed to add payment method type' };
    }
  };

  const updatePaymentMethodType = async (paymentMethodTypeId: string, updates: Partial<PaymentMethodType>): Promise<{ success: boolean; error?: string }> => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'payment-method-types',
        paymentMethodTypeId,
        updates
      );
      
      toast.success('Payment method type updated successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating payment method type:', error);
      toast.error(error.message || 'Failed to update payment method type');
      return { success: false, error: error.message || 'Failed to update payment method type' };
    }
  };

  const deletePaymentMethodType = async (paymentMethodTypeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        'payment-method-types',
        paymentMethodTypeId
      );
      
      toast.success('Payment method type deleted successfully!');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting payment method type:', error);
      toast.error(error.message || 'Failed to delete payment method type');
      return { success: false, error: error.message || 'Failed to delete payment method type' };
    }
  };

  // Payment method functions
  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, '$id' | '$createdAt' | '$updatedAt' | 'userId'>): Promise<{ success: boolean; error?: string; paymentMethod?: PaymentMethod }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // If this is the first payment method, make it default
      const isFirstMethod = paymentMethods.length === 0;
      
      const newPaymentMethod = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        ID.unique(),
        {
          userId: user.$id,
          type: paymentMethod.type,
          name: paymentMethod.name,
          accountNumber: paymentMethod.accountNumber,
          isDefault: isFirstMethod || paymentMethod.isDefault,
          status: paymentMethod.status || 'pending',
          email: paymentMethod.email || '',
          username: paymentMethod.username || '',
          phoneNumber: paymentMethod.phoneNumber || '',
          address: paymentMethod.address || ''
        }
      );

      // If this is set as default, unset all other defaults
      if (paymentMethod.isDefault || isFirstMethod) {
        const otherMethods = paymentMethods.filter(method => method.$id !== newPaymentMethod.$id);
        for (const method of otherMethods) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PAYMENT_METHODS,
            method.$id,
            { isDefault: false }
          );
        }
      }

      // Refresh payment methods
      await fetchUserPaymentMethods(user.$id);
      
      // Send notification to user
      try {
        await createNotificationForUser(user.$id, {
          type: 'system',
          title: 'Payment Method Added',
          message: `${paymentMethod.type} payment method has been added and waiting for approval`,
          priority: 'medium',
          actionUrl: '/settings?tab=payment'
        });
      } catch (error) {
        console.error('Error sending payment method notification:', error);
      }
      
      toast.success('Payment method added successfully!');
      return { success: true, paymentMethod: newPaymentMethod as PaymentMethod };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add payment method';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updatePaymentMethod = async (paymentMethodId: string, updates: Partial<PaymentMethod>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // Get the payment method details first to find the owner
      const paymentMethod = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        paymentMethodId
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        paymentMethodId,
        updates
      );

      // Send notification to the payment method owner if status changed
      if (updates.status && paymentMethod.userId !== user.$id) {
        try {
          const statusMessage = updates.status === 'verified' 
            ? 'Your payment method has been verified and is now available for withdrawals.'
            : 'Your payment method has been rejected. Please contact support for assistance.';
          
          const notificationTitle = updates.status === 'verified' 
            ? 'Payment Method Verified'
            : 'Payment Method Rejected';

          await createNotificationForUser(paymentMethod.userId, {
            type: 'system',
            title: notificationTitle,
            message: statusMessage,
            priority: 'medium',
            actionUrl: '/settings?tab=payment'
          });
        } catch (notificationError) {
          console.error('Failed to create payment method notification:', notificationError);
        }
      }

      // Refresh payment methods
      await fetchUserPaymentMethods(user.$id);
      
      toast.success('Payment method updated successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update payment method';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deletePaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        paymentMethodId
      );

      // Refresh payment methods
      await fetchUserPaymentMethods(user.$id);
      
      toast.success('Payment method deleted successfully!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete payment method';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      // First, unset all other defaults
      for (const method of paymentMethods) {
        if (method.$id !== paymentMethodId) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PAYMENT_METHODS,
            method.$id,
            { isDefault: false }
          );
        }
      }

      // Set the selected method as default
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PAYMENT_METHODS,
        paymentMethodId,
        { isDefault: true }
      );

      // Refresh payment methods
      await fetchUserPaymentMethods(user.$id);
      
      toast.success('Default payment method updated!');
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to set default payment method';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Validate recipient by email or account number
  const validateRecipient = async (identifier: string): Promise<{ success: boolean; recipient?: UserProfile; error?: string }> => {
    try {
      // Try to find by email first
      const emailResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', identifier)]
      );
      
      if (emailResponse.documents.length > 0) {
        return { success: true, recipient: emailResponse.documents[0] as UserProfile };
      }
      
      // Try to find by account number
      const accountResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('accountNumber', identifier)]
      );
      
      if (accountResponse.documents.length > 0) {
        return { success: true, recipient: accountResponse.documents[0] as UserProfile };
      }
      
      return { success: false, error: 'Recipient not found' };
    } catch (error) {
      console.error('Error validating recipient:', error);
      return { success: false, error: 'Error validating recipient' };
    }
  };

  // Fetch user transfers
  const fetchUserTransfers = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TRANSFERS,
        [
          Query.or([
            Query.equal('fromUserId', user.$id),
            Query.equal('toUserId', user.$id)
          ]),
          Query.orderDesc('$createdAt')
        ]
      );
      
      setTransfers(response.documents as Transfer[]);
    } catch (error) {
      console.error('Error fetching user transfers:', error);
    }
  };

  // Create transfer to another user
  const createTransfer = async (recipientIdentifier: string, amount: number, description?: string): Promise<{ success: boolean; error?: string; transfer?: Transfer }> => {
    if (!user || !userProfile) {
      return { success: false, error: 'User not found' };
    }

    try {

      // Convert amount to cents
      const amountInCents = Math.round(amount * 100);

      // Calculate available balance from transactions (same as dashboard)
      const totalEarnings = transactions
        .filter(t => (t.type === 'earning' || t.type === 'transfer_in') && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = transactions
        .filter(t => (t.type === 'withdrawal' || t.type === 'transfer_out') && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const calculatedAvailableBalance = totalEarnings - totalWithdrawals;

      // Check if user has sufficient available balance (only available balance can be transferred)
      if (calculatedAvailableBalance < amountInCents) {
        return { success: false, error: 'Insufficient available balance' };
      }

      // Find recipient by email or account number
      let recipientProfile: UserProfile | null = null;
      
      try {
        // Try to find by email first
        const emailResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal('email', recipientIdentifier)]
        );
        
        if (emailResponse.documents.length > 0) {
          recipientProfile = emailResponse.documents[0] as UserProfile;
        } else {
          // Try to find by account number
          const accountResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [Query.equal('accountNumber', recipientIdentifier)]
          );
          
          if (accountResponse.documents.length > 0) {
            recipientProfile = accountResponse.documents[0] as UserProfile;
          }
        }
      } catch (error) {
        console.error('Error finding recipient:', error);
        return { success: false, error: 'Recipient not found' };
      }

      if (!recipientProfile) {
        return { success: false, error: 'Recipient not found. Please check the email or account number.' };
      }

      // Check if trying to transfer to self
      if (recipientProfile.userId === user.$id) {
        return { success: false, error: 'Cannot transfer to yourself' };
      }

      // Create transfer record
      const transferData = {
        fromUserId: user.$id,
        toUserId: recipientProfile.userId,
        fromUserEmail: userProfile.email,
        toUserEmail: recipientProfile.email,
        fromUserName: userProfile.name,
        toUserName: recipientProfile.name,
        amount: amountInCents,
        status: 'completed' as const,
        description: description || '',
        transferType: 'internal' as const
      };

      const transfer = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSFERS,
        ID.unique(),
        transferData,
        [
          `read("any")`,
          `write("any")`,
          `update("any")`,
          `delete("any")`
        ]
      );

      // Create transaction records for both sender and recipient to track the transfer
      const transferReference = `TRF-${transfer.$id.slice(-8).toUpperCase()}`;

      // Create withdrawal transaction for sender
      const senderTransaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: user.$id,
          type: 'transfer_out' as const,
          amount: amountInCents,
          description: `Transfer to ${recipientProfile.name} (${recipientProfile.email})`,
          status: 'completed' as const,
          reference: transferReference,
          paymentMethod: 'internal_transfer'
        },
        [
          `read("any")`,
          `write("any")`,
          `update("any")`,
          `delete("any")`
        ]
      );

      // Create earning transaction for recipient
      const recipientTransaction = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TRANSACTIONS,
        ID.unique(),
        {
          userId: recipientProfile.userId,
          type: 'transfer_in' as const,
          amount: amountInCents,
          description: `Transfer from ${userProfile.name} (${userProfile.email})`,
          status: 'completed' as const,
          reference: transferReference,
          paymentMethod: 'internal_transfer'
        },
        [
          `read("any")`,
          `write("any")`,
          `update("any")`,
          `delete("any")`
        ]
      );

      // Refresh user data
      await refreshData();
      await fetchUserTransfers();

      // Send notifications
      try {
        // Notify recipient
        await createNotificationForUser(recipientProfile.userId, {
          type: 'system',
          title: 'Transfer Received',
          message: `You received a transfer of ${formatCurrency(amountInCents)} from ${userProfile.name}`,
          priority: 'medium',
          actionUrl: '/transactions'
        });

        // Notify sender
        await createNotificationForUser(user.$id, {
          type: 'system',
          title: 'Transfer Successful',
          message: `Transfer to ${recipientProfile.name} successful`,
          priority: 'medium',
          actionUrl: '/transactions'
        });
      } catch (error) {
        console.error('Error sending notifications:', error);
      }

      toast.success(`Transfer of ${formatCurrency(amountInCents)} sent successfully to ${recipientProfile.name}`);
      
      return { success: true, transfer: transfer as Transfer };
    } catch (error: any) {
      console.error('Transfer creation error:', error);
      
      const errorMessage = error.message || 'Failed to create transfer';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    investments,
    transactions,
    paymentMethods,
    transfers,
    login,
    register,
    signup,
    logout,
    createInvestment,
    createWithdrawal,
    refreshData,
    checkUser,
    simulateTransactionStatusChange,
    updateUserProfile,
    updateUser,
    changePassword,
    getLoginHistory,
    terminateSession,
    terminateAllOtherSessions,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    // Payment method types functions
    getPaymentMethodTypes,
    addPaymentMethodType,
    updatePaymentMethodType,
    deletePaymentMethodType,
    validateBonusCode,
    approveInvestment,
    createNotificationForUser,
    createInvestmentForUser,
    fixInvestmentOwnership,
    createTransfer,
    fetchUserTransfers,
    validateRecipient,
    databases,
    storage,
    DATABASE_ID,
    COLLECTIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};