import { databases, ID, DATABASE_ID, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { generateRandomCode } from './utils';

export const ReferralStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

export type ReferralType = {
  $id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  status: typeof ReferralStatus[keyof typeof ReferralStatus];
  referralDate: string;
};

export const referralService = {
  async generateInitialCode(userId: string): Promise<string> {
    return this.createReferralCode(userId);
  },

  async createReferralCode(userId: string): Promise<string> {
    const code = generateRandomCode(8);
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.REFERRALS,
      ID.unique(),
      {
        referrerId: userId,
        referralCode: code,
        status: ReferralStatus.PENDING,
        referralDate: new Date().toISOString(),
      }
    );
    return code;
  },

  async getReferralsByUser(userId: string): Promise<ReferralType[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REFERRALS,
      [Query.equal('referrerId', userId)]
    );
    return response.documents as ReferralType[];
  },

  async getReferralDetails(): Promise<any[]> {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.REFERRALS, []);
    
    // Get all unique user IDs from referrals
    const userIds = new Set<string>();
    response.documents.forEach((doc: any) => {
      userIds.add(doc.referrerId);
      if (doc.refereeId) userIds.add(doc.refereeId);
    });

    // Get user details for all users
    const userDetails = new Map<string, any>();
    for (const userId of userIds) {
      try {
  const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
        userDetails.set(userId, user);
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
      }
    }

    // Combine referral data with user details
    return response.documents.map((doc: any) => ({
      ...doc,
      referrer: userDetails.get(doc.referrerId),
      referee: doc.refereeId ? userDetails.get(doc.refereeId) : null,
    }));
  },

  async completeReferral(referralCode: string, refereeId: string): Promise<void> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REFERRALS,
      [Query.equal('referralCode', referralCode), Query.equal('status', ReferralStatus.PENDING)]
    );

    if (response.documents.length === 0) {
      throw new Error('Invalid or expired referral code');
    }

    const referral = response.documents[0];
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.REFERRALS,
      referral.$id,
      {
        refereeId: refereeId,
        status: ReferralStatus.COMPLETED,
        completedAt: new Date().toISOString()
      }
    );
  },

  async getUserReferralStats(userId: string): Promise<{ total: number; completed: number }> {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.REFERRALS, [Query.equal('referrerId', userId)]);

    const total = response.documents.length;
    const completed = response.documents.filter(
      (doc: any) => doc.status === ReferralStatus.COMPLETED
    ).length;

    return { total, completed };
  }
};