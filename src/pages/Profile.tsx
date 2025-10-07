import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Hash,
  TrendingUp,
  Settings,
  Bell,
  Lock,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, INVESTMENT_PLANS } from '../lib/appwrite';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, userProfile, investments, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateUserProfile({
        name: editData.name,
        phone: editData.phone
      });
      
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: userProfile?.name || '',
      phone: userProfile?.phone || ''
    });
    setIsEditing(false);
  };

  // Get user's investment plan
  // Since investmentPlan is not stored in user profile, we'll show a default or calculate from investments
  const userPlan = null; // Could be calculated from user's investments if needed
  
  // Calculate portfolio stats
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.status === 'active' ? inv.amount : 0), 0);
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const joinDate = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=""
      >
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-600">Update your account details</p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="btn-success px-4 py-2 text-sm disabled:opacity-50"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="card-body space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {(userProfile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {userProfile?.name || user?.name}
                  </h4>
                  <p className="text-sm text-gray-600">{userPlan?.name || 'Investment Plan'}</p>
                  <button className="text-sm text-primary-600 hover:text-primary-700 mt-1">
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Full Name</label>
                  {isEditing ? (
                    <input
                      name="name"
                      type="text"
                      className="form-input"
                      value={editData.name}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <div className="form-input bg-gray-50 flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.name || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  {isEditing ? (
                    <input
                      name="phone"
                      type="tel"
                      className="form-input"
                      value={editData.phone}
                      onChange={handleEditChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="form-input bg-gray-50 flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <div className="form-input bg-gray-50 flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    {user?.email || 'Not provided'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="form-label">Member Since</label>
                  <div className="form-input bg-gray-50 flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    {joinDate}
                  </div>
                </div>

                <div>
                  <label className="form-label">Account Status</label>
                  <div className="form-input bg-gray-50 flex items-center">
                    <Shield className="w-4 h-4 text-success-500 mr-3" />
                    <span className="text-success-600 font-medium">
                      {userProfile?.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Account Number</label>
                  <div className="form-input bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 text-gray-400 mr-3" />
                      {userProfile?.accountNumber ? (
                        <span className="font-mono text-lg font-semibold">
                          {userProfile.accountNumber}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">
                          Not assigned
                        </span>
                      )}
                    </div>
                    {userProfile?.accountNumber ? (
                      <button
                        onClick={() => navigator.clipboard.writeText(userProfile.accountNumber)}
                        className="text-primary-600 hover:text-primary-700 text-sm ml-2"
                        title="Copy account number"
                      >
                        Copy
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Contact support
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Investment Plan & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Current Plan */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Investment Plan</h3>
                  <p className="text-sm text-gray-600">Current subscription</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              {userPlan ? (
                <div>
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900">{userPlan.name}</h4>
                    <div className="text-3xl font-bold text-primary-600 mt-2">
                      {userPlan.interestRate}%
                    </div>
                    <p className="text-sm text-gray-600">Annual Interest Rate</p>
                  </div>
                  <div className="space-y-3">
                    {userPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-success-500 rounded-full mr-3"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <button className="btn-primary w-full py-2 text-sm">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center">No plan selected</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio Summary</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Total Invested</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalInvested)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Active Investments</span>
                <span className="font-semibold text-gray-900">
                  {activeInvestments}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="font-semibold text-primary-600">
                  {userPlan?.name || 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                <p className="text-sm text-gray-600">Manage your account security</p>
              </div>
            </div>
          </div>
          <div className="card-body space-y-4">
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Change Password</span>
              </div>
              <span className="text-sm text-gray-400">Update</span>
            </button>
            
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
              </div>
              <span className="text-sm text-success-600">Enabled</span>
            </button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Manage your notification preferences</p>
              </div>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                <p className="text-xs text-gray-600">Receive investment updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                <p className="text-xs text-gray-600">Receive alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                <p className="text-xs text-gray-600">Receive browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="card border-danger-200"
      >
        <div className="card-header border-danger-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-danger-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-danger-900">Danger Zone</h3>
              <p className="text-sm text-danger-600">Irreversible and destructive actions</p>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <button className="btn-danger px-4 py-2 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;