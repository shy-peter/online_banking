import { UserProfile } from '../types/appwrite';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  requiredFields: string[];
}

/**
 * Check if a user's profile is complete for verification
 */
export const checkProfileCompletion = (userProfile: UserProfile | null): ProfileCompletionStatus => {
  if (!userProfile) {
    return {
      isComplete: false,
      completionPercentage: 0,
      missingFields: [],
      requiredFields: []
    };
  }

  const requiredFields = [
    'name',
    'email',
    'phone',
    'personalInfo.firstName',
    'personalInfo.lastName',
    'personalInfo.dateOfBirth',
    'personalInfo.address',
    'personalInfo.city',
    'personalInfo.state',
    'personalInfo.zipCode',
    'personalInfo.country',
    'personalInfo.occupation',
    'personalInfo.annualIncome',
    'personalInfo.ssn'
  ];

  const missingFields: string[] = [];
  let completedFields = 0;

  // Check basic fields
  if (!userProfile.name?.trim()) missingFields.push('Full Name');
  else completedFields++;

  if (!userProfile.email?.trim()) missingFields.push('Email');
  else completedFields++;

  if (!userProfile.phone?.trim()) missingFields.push('Phone Number');
  else completedFields++;

  // Check personal info fields
  if (!userProfile.personalInfo?.firstName?.trim()) missingFields.push('First Name');
  else completedFields++;

  if (!userProfile.personalInfo?.lastName?.trim()) missingFields.push('Last Name');
  else completedFields++;

  if (!userProfile.personalInfo?.dateOfBirth?.trim()) missingFields.push('Date of Birth');
  else completedFields++;

  if (!userProfile.personalInfo?.address?.trim()) missingFields.push('Address');
  else completedFields++;

  if (!userProfile.personalInfo?.city?.trim()) missingFields.push('City');
  else completedFields++;

  if (!userProfile.personalInfo?.state?.trim()) missingFields.push('State');
  else completedFields++;

  if (!userProfile.personalInfo?.zipCode?.trim()) missingFields.push('ZIP Code');
  else completedFields++;

  if (!userProfile.personalInfo?.country?.trim()) missingFields.push('Country');
  else completedFields++;

  if (!userProfile.personalInfo?.occupation?.trim()) missingFields.push('Occupation');
  else completedFields++;

  if (!userProfile.personalInfo?.annualIncome) missingFields.push('Annual Income');
  else completedFields++;

  if (!userProfile.personalInfo?.ssn?.trim()) missingFields.push('Social Security Number');
  else completedFields++;

  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
  const isComplete = missingFields.length === 0;

  return {
    isComplete,
    completionPercentage,
    missingFields,
    requiredFields
  };
};

/**
 * Check if user can make withdrawals
 */
export const canMakeWithdrawal = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;
  
  const profileStatus = checkProfileCompletion(userProfile);
  return profileStatus.isComplete && userProfile.isVerified;
};

/**
 * Get verification status based on profile completion and verification
 */
export const getVerificationStatus = (userProfile: UserProfile | null): 'pending' | 'verified' | 'rejected' | 'incomplete' | 'email_pending' => {
  if (!userProfile) return 'incomplete';
  
  // Check if email is not verified
  if (!userProfile.isVerified || userProfile.status === 'pending_verification') {
    return 'email_pending';
  }
  
  if (userProfile.verificationStatus) {
    return userProfile.verificationStatus;
  }
  
  const profileStatus = checkProfileCompletion(userProfile);
  
  if (!profileStatus.isComplete) {
    return 'incomplete';
  }
  
  if (userProfile.isVerified) {
    return 'verified';
  }
  
  return 'pending';
};
