import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserEarningsHistory, 
  calculateUserDailyEarnings,
  type DailyEarnings 
} from '../lib/earnings';

export const useEarnings = () => {
  const { user, investments } = useAuth();
  const [earningsHistory, setEarningsHistory] = useState<DailyEarnings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate current daily earnings
  const dailyEarnings = calculateUserDailyEarnings(investments);

  // Fetch earnings history
  const fetchEarningsHistory = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const history = await getUserEarningsHistory(user.$id, 30);
      setEarningsHistory(history);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch earnings history');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total earnings from history
  const totalEarningsFromHistory = earningsHistory.reduce((sum, earning) => {
    return sum + earning.amount;
  }, 0);

  // Calculate earnings for the last 7 days
  const last7DaysEarnings = earningsHistory
    .filter(earning => {
      const earningDate = new Date(earning.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return earningDate >= sevenDaysAgo;
    })
    .reduce((sum, earning) => sum + earning.amount, 0);

  // Calculate earnings for the last 30 days
  const last30DaysEarnings = earningsHistory
    .filter(earning => {
      const earningDate = new Date(earning.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return earningDate >= thirtyDaysAgo;
    })
    .reduce((sum, earning) => sum + earning.amount, 0);

  // Get earnings by date range
  const getEarningsByDateRange = (startDate: Date, endDate: Date) => {
    return earningsHistory.filter(earning => {
      const earningDate = new Date(earning.date);
      return earningDate >= startDate && earningDate <= endDate;
    });
  };

  // Get earnings by investment
  const getEarningsByInvestment = (investmentId: string) => {
    return earningsHistory.filter(earning => earning.investmentId === investmentId);
  };

  // Get earnings statistics
  const getEarningsStats = () => {
    const totalEarnings = totalEarningsFromHistory;
    const averageDailyEarnings = earningsHistory.length > 0 
      ? totalEarnings / earningsHistory.length 
      : 0;
    
    const highestDailyEarnings = earningsHistory.length > 0
      ? Math.max(...earningsHistory.map(e => e.amount))
      : 0;

    const lowestDailyEarnings = earningsHistory.length > 0
      ? Math.min(...earningsHistory.map(e => e.amount))
      : 0;

    return {
      totalEarnings,
      averageDailyEarnings,
      highestDailyEarnings,
      lowestDailyEarnings,
      totalDays: earningsHistory.length,
      last7DaysEarnings,
      last30DaysEarnings
    };
  };

  // Auto-fetch earnings history when user changes
  useEffect(() => {
    if (user) {
      fetchEarningsHistory();
    } else {
      setEarningsHistory([]);
    }
  }, [user]);

  return {
    // Data
    earningsHistory,
    dailyEarnings,
    totalEarningsFromHistory,
    last7DaysEarnings,
    last30DaysEarnings,
    
    // State
    loading,
    error,
    
    // Methods
    fetchEarningsHistory,
    getEarningsByDateRange,
    getEarningsByInvestment,
    getEarningsStats,
    
    // Computed values
    stats: getEarningsStats()
  };
};
