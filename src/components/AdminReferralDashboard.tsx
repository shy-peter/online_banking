import React, { useEffect, useState } from 'react';
import { referralService } from '../lib/referralService';
import { formatCurrency } from '../lib/appwrite';

interface ReferralDetail {
  $id: string;
  referralCode: string;
  status: string;
  referralDate: string;
  referrer: {
    name: string;
    email: string;
    balance: number;
  };
  referee?: {
    name: string;
    email: string;
    balance: number;
  };
}

export const AdminReferralDashboard: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferrals = async () => {
      try {
        const details = await referralService.getReferralDetails();
        setReferrals(details);
        setLoading(false);
      } catch (error) {
        console.error('Error loading referral details:', error);
        setLoading(false);
      }
    };

    loadReferrals();
  }, []);

  if (loading) {
    return <div>Loading referral data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-6">Referral Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referrer
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referee
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balances
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {referrals.map((referral) => (
              <tr key={referral.$id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {referral.referrer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {referral.referrer.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {referral.referee ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {referral.referee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.referee.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {referral.referralCode}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    referral.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {referral.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(referral.referralDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Referrer: {formatCurrency((referral.referrer?.totalBalance || referral.referrer?.balance || 0) as number)}
                  </div>
                  {referral.referee && (
                    <div className="text-sm text-gray-900">
                      Referee: {formatCurrency((referral.referee?.totalBalance || referral.referee?.balance || 0) as number)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};