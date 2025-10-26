import React, { useEffect, useState } from 'react';
import { AdminReferralDashboard } from '../components/AdminReferralDashboard';

const AdminReferrals: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
      <AdminReferralDashboard />
    </div>
  );
};

export default AdminReferrals;