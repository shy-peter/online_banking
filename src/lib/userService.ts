import { databases, ID, DATABASE_ID, COLLECTIONS } from './appwrite';
import { referralService } from './referralService';

export const userService = {
  async afterUserCreated(userId: string): Promise<void> {
    try {
      // Generate initial referral code
      await referralService.createReferralCode(userId);
    } catch (error) {
      console.error('Error in afterUserCreated:', error);
      // Don't throw error as this is a post-creation hook
    }
  }
};