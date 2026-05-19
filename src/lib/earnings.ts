import { databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID, Query } from 'appwrite';
import type { Investment, UserProfile } from '../types/appwrite';

export interface DailyEarnings {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  investmentId: string;
  amount: number; // Daily earnings amount in cents
  date: string; // YYYY-MM-DD format
  status: 'pending' | 'processed' | 'failed';
  type: 'automatic' | 'manual';
  adminId?: string; // If manually adjusted by admin
  notes?: string;
}

export interface EarningsAdjustment {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  amount: number; // Adjustment amount in cents (can be negative)
  type: 'increase' | 'decrease';
  reason: string;
  adminId: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Calculate daily earnings for a specific investment
export const calculateDailyEarnings = (investment: Investment): number => {
  if (investment.status !== 'active') return 0;
  
  // interestRate stored as monthly percentage; convert to daily assuming 30‑day month
  const dailyRate = investment.interestRate / (100 * 30);
  return Math.round(investment.amount * dailyRate);
};

// Calculate total daily earnings for a user
export const calculateUserDailyEarnings = (investments: Investment[]): number => {
  return investments.reduce((total, investment) => {
    return total + calculateDailyEarnings(investment);
  }, 0);
};

// Process daily earnings for all active investments
export const processDailyEarnings = async (): Promise<{ success: boolean; processed: number; error?: string }> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get all active investments
    const investmentsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.INVESTMENTS,
      [Query.equal('status', 'active')]
    );
    
    const investments = investmentsResponse.documents as Investment[];
    let processedCount = 0;
    
    for (const investment of investments) {
      // Check if earnings already processed for today
      const existingEarnings = await databases.listDocuments(
        DATABASE_ID,
        'daily-earnings',
        [
          Query.equal('userId', investment.userId),
          Query.equal('investmentId', investment.$id),
          Query.equal('date', today),
          Query.equal('status', 'processed')
        ]
      );
      
      if (existingEarnings.documents.length > 0) {
        continue; // Already processed for today
      }
      
      const dailyAmount = calculateDailyEarnings(investment);
      
      if (dailyAmount > 0) {
        // Create daily earnings record
        await databases.createDocument(
          DATABASE_ID,
          'daily-earnings',
          ID.unique(),
          {
            userId: investment.userId,
            investmentId: investment.$id,
            amount: dailyAmount,
            date: today,
            status: 'processed',
            type: 'automatic'
          },
          [
            'read("any")',
            'write("any")'
          ]
        );
        
        // Update user's total balance
        await updateUserEarnings(investment.userId, dailyAmount);
        
        // Create transaction record for the earnings
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TRANSACTIONS,
          ID.unique(),
          {
            userId: investment.userId,
            type: 'earning',
            amount: dailyAmount,
            description: `Daily earnings from investment - ${today}`,
            status: 'completed',
            reference: `EARN-${today}-${investment.$id.slice(-6)}`,
            investmentId: investment.$id,
            paymentMethod: 'system'
          },
          [
            'read("any")',
            'write("any")'
          ]
        );
        
        processedCount++;
      }
    }
    
    return { success: true, processed: processedCount };
  } catch (error: any) {
    console.error('Error processing daily earnings:', error);
    return { success: false, processed: 0, error: error.message };
  }
};

// Update user's total earnings balance
export const updateUserEarnings = async (userId: string, amount: number): Promise<void> => {
  try {
    // Get user profile
    const userResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('userId', userId)]
    );
    
    if (userResponse.documents.length > 0) {
      const userProfile = userResponse.documents[0];
      const newTotalBalance = userProfile.totalBalance + amount;
      const newAvailableBalance = userProfile.availableBalance + amount;
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userProfile.$id,
        {
          totalBalance: newTotalBalance,
          availableBalance: newAvailableBalance,
          updatedAt: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('Error updating user earnings:', error);
    throw error;
  }
};

// Admin function to manually adjust user earnings
export const adjustUserEarnings = async (
  userId: string, 
  amount: number, 
  type: 'increase' | 'decrease', 
  reason: string, 
  adminId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const adjustmentAmount = type === 'increase' ? amount : -amount;
    
    // Create earnings adjustment record
    const adjustment = await databases.createDocument(
      DATABASE_ID,
      'earnings-adjustments',
      ID.unique(),
      {
        userId: userId,
        amount: adjustmentAmount,
        type: type,
        reason: reason,
        adminId: adminId,
        status: 'approved'
      },
      [
        'read("any")',
        'write("any")'
      ]
    );
    
    // Update user's balance
    await updateUserEarnings(userId, adjustmentAmount);
    
    // Create transaction record
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: userId,
        type: 'earning',
        amount: Math.abs(adjustmentAmount),
        description: type === 'increase' ? `System Bonus: ${reason}` : `Admin ${type}: ${reason}`,
        status: 'completed',
        reference: `ADJ-${adjustment.$id.slice(-8)}`,
        paymentMethod: 'admin'
      },
      [
        'read("any")',
        'write("any")'
      ]
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error adjusting user earnings:', error);
    return { success: false, error: error.message };
  }
};

// Get user's earnings history
export const getUserEarningsHistory = async (userId: string, limit: number = 30): Promise<DailyEarnings[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'daily-earnings',
      [
        Query.equal('userId', userId),
        Query.orderDesc('date'),
        Query.limit(limit)
      ]
    );
    
    return response.documents as DailyEarnings[];
  } catch (error) {
    console.error('Error fetching earnings history:', error);
    return [];
  }
};

// Get all earnings adjustments for admin review
export const getEarningsAdjustments = async (): Promise<EarningsAdjustment[]> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'earnings-adjustments',
      [Query.orderDesc('$createdAt')]
    );
    
    return response.documents as EarningsAdjustment[];
  } catch (error) {
    console.error('Error fetching earnings adjustments:', error);
    return [];
  }
};

// Calculate and update user's available balance based on actual earnings
export const recalculateUserBalance = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get user profile
    const userResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('userId', userId)]
    );
    
    if (userResponse.documents.length === 0) {
      return { success: false, error: 'User not found' };
    }
    
    const userProfile = userResponse.documents[0];
    
    // Calculate total earnings from daily earnings records
    const earningsResponse = await databases.listDocuments(
      DATABASE_ID,
      'daily-earnings',
      [
        Query.equal('userId', userId),
        Query.equal('status', 'processed')
      ]
    );
    
    const totalEarnings = earningsResponse.documents.reduce((sum: number, earning: any) => {
      return sum + earning.amount;
    }, 0);
    
    // Calculate total withdrawals
    const withdrawalsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        Query.equal('userId', userId),
        Query.equal('type', 'withdrawal'),
        Query.equal('status', 'completed')
      ]
    );
    
    const totalWithdrawals = withdrawalsResponse.documents.reduce((sum: number, withdrawal: any) => {
      return sum + withdrawal.amount;
    }, 0);
    
    // Calculate correct available balance
    const correctAvailableBalance = totalEarnings - totalWithdrawals;
    
    // Update user profile with correct balance
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userProfile.$id,
      {
        totalBalance: totalEarnings,
        availableBalance: Math.max(0, correctAvailableBalance), // Ensure non-negative
        updatedAt: new Date().toISOString()
      }
    );
    
    return { success: true };
  } catch (error: any) {
    console.error('Error recalculating user balance:', error);
    return { success: false, error: error.message };
  }
};

// Admin function to adjust total earnings (creates earning transaction)
export const adjustUserTotalEarnings = async (
  userId: string,
  amount: number,
  type: 'increase' | 'decrease',
  reason: string,
  adminId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const adjustmentAmount = type === 'increase' ? amount : -amount;

    // Create earnings adjustment record
    const adjustment = await databases.createDocument(
      DATABASE_ID,
      'earnings-adjustments',
      ID.unique(),
      {
        userId: userId,
        amount: adjustmentAmount,
        type: type,
        reason: reason,
        adminId: adminId || 'system',
        adjustmentType: 'total_earnings',
        status: 'approved'
      },
      ['read("any")', 'write("any")']
    );

    // Create transaction record
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: userId,
        type: type === 'increase' ? 'earning' : 'withdrawal',
        amount: Math.abs(adjustmentAmount),
        description: `Admin ${type}: ${reason}`,
        status: 'completed',
        reference: `ADJ-EARN-${adjustment.$id.slice(-8)}`,
        paymentMethod: 'admin'
      },
      ['read("any")', 'write("any")']
    );

    // Update user's balance (this will be recalculated from transactions)
    await updateUserEarnings(userId, adjustmentAmount);

    return { success: true };
  } catch (error: any) {
    console.error('Error adjusting total earnings:', error);
    return { success: false, error: error.message };
  }
};

// Admin function to adjust available balance directly (no transaction)
export const adjustUserAvailableBalance = async (
  userId: string,
  amount: number,
  type: 'increase' | 'decrease',
  reason: string,
  adminId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const adjustmentAmount = type === 'increase' ? amount : -amount;

    // Get user profile
    const userResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('userId', userId)]
    );

    if (userResponse.documents.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const userProfile = userResponse.documents[0];
    const newAvailableBalance = Math.max(0, userProfile.availableBalance + adjustmentAmount);

    // Create adjustment record
    await databases.createDocument(
      DATABASE_ID,
      'earnings-adjustments',
      ID.unique(),
      {
        userId: userId,
        amount: adjustmentAmount,
        type: type,
        reason: reason,
        adminId: adminId || 'system',
        adjustmentType: 'available_balance',
        status: 'approved'
      },
      ['read("any")', 'write("any")']
    );

    // Update only available balance (no transaction created)
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userProfile.$id,
      {
        availableBalance: newAvailableBalance,
        updatedAt: new Date().toISOString()
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error adjusting available balance:', error);
    return { success: false, error: error.message };
  }
};

// Admin function to adjust withdrawals (creates withdrawal transaction)
export const adjustUserWithdrawals = async (
  userId: string,
  amount: number,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create withdrawal adjustment record
    const adjustment = await databases.createDocument(
      DATABASE_ID,
      'earnings-adjustments',
      ID.unique(),
      {
        userId: userId,
        amount: -Math.abs(amount),
        type: 'decrease',
        reason: reason,
        adminId: adminId || 'system',
        adjustmentType: 'withdrawal',
        status: 'approved'
      },
      ['read("any")', 'write("any")']
    );

    // Create withdrawal transaction record
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      ID.unique(),
      {
        userId: userId,
        type: 'withdrawal',
        amount: Math.abs(amount),
        description: `Admin Adjustment: ${reason}`,
        status: 'completed',
        reference: `ADJ-WITH-${adjustment.$id.slice(-8)}`,
        paymentMethod: 'admin'
      },
      ['read("any")', 'write("any")']
    );

    // Update user's balance
    await updateUserEarnings(userId, -Math.abs(amount));

    return { success: true };
  } catch (error: any) {
    console.error('Error adjusting withdrawals:', error);
    return { success: false, error: error.message };
  }
};
