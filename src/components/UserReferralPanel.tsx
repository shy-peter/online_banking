import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { referralService } from '../lib/referralService';
import ClickToCopy from './ClickToCopy';

interface ReferralStats {
  total: number;
  completed: number;
}

const UserReferralPanel: React.FC = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats>({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user?.$id) return;
    try {
      const stats = await referralService.getUserReferralStats(user.$id);
      setStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading referral stats:', error);
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!user?.$id) return;
    try {
      const code = await referralService.createReferralCode(user.$id);
      setReferralCode(code);
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const shareUrl = `${window.location.origin}/register?ref=${referralCode}`;

  if (loading) {
    return <div>Loading referral stats...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Referrals</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Successful Referrals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Share Your Referral Link</h3>
          {referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <ClickToCopy
                  text={referralCode}
                  className="flex-1 bg-gray-50 p-3 rounded border border-gray-200 font-mono"
                />
                <button
                  onClick={handleGenerateCode}
                  className="px-4 py-2 text-sm bg-[#d8ed36] text-gray-800 rounded hover:bg-[#c2d62f] transition-colors"
                >
                  New Code
                </button>
              </div>
              <ClickToCopy
                text={shareUrl}
                className="w-full bg-gray-50 p-3 rounded border border-gray-200 text-sm"
              />
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              className="w-full px-4 py-3 bg-[#d8ed36] text-gray-800 rounded hover:bg-[#c2d62f] transition-colors"
            >
              Generate Referral Code
            </button>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-blue-900">How Referrals Work</h4>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Generate your unique referral code</li>
            <li>Share your code with friends and family</li>
            <li>Earn rewards when they join and invest</li>
            <li>Track your successful referrals here</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserReferralPanel;