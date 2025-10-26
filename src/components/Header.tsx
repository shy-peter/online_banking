import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/appwrite';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const { userProfile, investments } = useAuth();
  const navigate = useNavigate();

  // Calculate total portfolio value
  const totalPortfolioValue = investments.reduce((sum, investment) => {
    if (investment.status === 'active') {
      return sum + investment.amount;
    }
    return sum;
  }, 0);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black border-b border-gray-800 px-3 md:px-6 py-2 md:py-4"
    >
      <div className="flex items-center justify-between">
        {/* Welcome message */}
        {/* <div>
          <h1 className="text-sm md:text-xl font-semibold text-white">
            Welcome back{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            {totalPortfolioValue > 0 ? (
              <>Your Networth {formatCurrency(totalPortfolioValue)}</>
            ) : (
              <>Ready to start your investment journey?</>
            )}
          </p>
        </div> */}
        <div className=' hidde'>InvestFlowBank</div>

        {/* Header actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                className="bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 py-2 w-64 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Settings */}
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-400 hover:text-[#d8ed36] hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User avatar */}
          {userProfile && (
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-3 p-1 hover:bg-gray-800 rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-[#d8ed36] rounded-full flex items-center justify-center overflow-hidden">
                {userProfile.profilePicture || localStorage.getItem(`profilePicture_${userProfile.userId}`) ? (
                  <img 
                    src={userProfile.profilePicture || localStorage.getItem(`profilePicture_${userProfile.userId}`)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-black">
                    {userProfile.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;