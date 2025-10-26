import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { referralService } from '../lib/referralService';
import ClickToCopy from './ClickToCopy';

interface ReferralStats {
  total: number;
  completed: number;
}

const ReferralSettings = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<ReferralStats>({ total: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralData();
      loadUserReferralCode();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;
    
    try {
      const stats = await referralService.getUserReferralStats(user.$id);
      setStats(stats);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  };

  const loadUserReferralCode = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const referrals = await referralService.getReferralsByUser(user.$id);
      if (referrals.length > 0) {
        setReferralCode(referrals[0].referralCode);
      }
    } catch (error) {
      console.error('Error loading referral code:', error);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Referral Program</h3>
          <p className="text-sm text-gray-600">Earn rewards by referring new users</p>
        </div>
      </div>

        <div className="flex items-center justify-between">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-200 border-t-primary-600"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : referralCode ? (
            <div className="flex items-center space-x-4 w-full">
              <div className="bg-gray-50 rounded-lg py-2 px-4 flex-1 flex items-center justify-between">
                <span className="font-mono text-lg font-medium text-gray-900">{referralCode}</span>
                <ClickToCopy text={referralCode} copyMessage="Code copied!">
                  <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <Copy className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </ClickToCopy>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No referral code available</span>
          )}

          <div className="ml-4 flex items-center space-x-2 text-sm">
            <span className="text-gray-500">Referrals:</span>
            <span className="font-medium text-gray-900">{stats.total}</span>
          </div>
        </div>
    </div>
  );
};

export default ReferralSettings;