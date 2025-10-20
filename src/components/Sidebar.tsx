import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getVerificationStatus } from '../lib/verification';
import VerificationBadge from './VerificationBadge';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  User,
  Settings,
  Shield,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { logout, userProfile } = useAuth();
  const location = useLocation();

  // Check if we're on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Check if user is admin
  const isAdmin = userProfile?.email?.includes('admin') || userProfile?.name?.includes('Admin');

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Investments',
      href: '/investments',
      icon: TrendingUp,
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: DollarSign,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  // Add admin navigation if user is admin
  if (isAdmin) {
    navigation.push({
      name: 'Admin',
      href: '/admin',
      icon: Shield,
    });
    navigation.push({
      name: 'Admin Transactions',
      href: '/admin/transactions',
      icon: FileText,
    });
  }

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      {!isDesktop && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-white rounded-lg shadow-soft border border-gray-200"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {isDesktop ? (
        <div className="w-64 bg-white border-r border-gray-200 h-screen">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">InvestFlow</h2>
                  <p className="text-xs text-gray-500">Smart Investment Platform</p>
                </div>
              </div>
            </div>

            {/* User info */}
            {userProfile && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {userProfile.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile.name}
                    </p>
                    <VerificationBadge 
                      status={getVerificationStatus(userProfile)} 
                      size="sm" 
                      showText={false}
                    />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    Investment Plan
                  </p>
                  {userProfile.accountNumber && (
                    <p className="text-xs text-gray-400 truncate">
                      #{userProfile.accountNumber}
                    </p>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={false}
          animate={{
            x: isOpen ? 0 : -280,
          }}
          className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-soft-lg"
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">InvestFlow</h2>
                  <p className="text-xs text-gray-500">Smart Investment Platform</p>
                </div>
              </div>
            </div>

            {/* User info */}
            {userProfile && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {userProfile.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile.name}
                    </p>
                    <VerificationBadge 
                      status={getVerificationStatus(userProfile)} 
                      size="sm" 
                      showText={false}
                    />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    Investment Plan
                  </p>
                  {userProfile.accountNumber && (
                    <p className="text-xs text-gray-400 truncate">
                      #{userProfile.accountNumber}
                    </p>
                  )}
                </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Sidebar;