import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { referralService } from '../lib/referralService';
import ClickToCopy from './ClickToCopy';

export const ReferralStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (!user?.$id) return;
        const userStats = await referralService.getUserReferralStats(user.$id);
        setStats(userStats);
        setLoading(false);
      } catch (error) {
        console.error('Error loading referral stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  const generateReferralCode = async () => {
    try {
      if (!user?.$id) return;
      const code = await referralService.createReferralCode(user.$id);
      setReferralCode(code);
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  if (loading) {
    return <div>Loading referral stats...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Referral Program</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Completed Referrals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Share Your Referral Link</h3>
          {referralCode ? (
            <div className="flex items-center space-x-2">
              <ClickToCopy
                text={referralCode}
                className="flex-1 bg-gray-50 p-3 rounded border border-gray-200"
              />
              <button
                onClick={generateReferralCode}
                className="px-4 py-2 text-sm bg-[#d8ed36] text-gray-800 rounded hover:bg-[#c2d62f] transition-colors"
              >
                Generate New
              </button>
            </div>
          ) : (
            <button
              onClick={generateReferralCode}
              className="w-full px-4 py-3 bg-[#d8ed36] text-gray-800 rounded hover:bg-[#c2d62f] transition-colors"
            >
              Generate Referral Code
            </button>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>1. Generate your unique referral code</li>
            <li>2. Share it with friends and family</li>
            <li>3. They use your code when signing up</li>
            <li>4. Track your successful referrals here</li>
          </ul>
        </div>
      </div>
    </div>
  );
};