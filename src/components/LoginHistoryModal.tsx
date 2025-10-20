import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Smartphone, Globe, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  loginTime: string;
  isCurrent: boolean;
  status: 'active' | 'expired' | 'suspicious';
}

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetLoginHistory: () => Promise<LoginSession[]>;
  onTerminateSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  onTerminateAllOtherSessions: () => Promise<{ success: boolean; error?: string }>;
}

const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({
  isOpen,
  onClose,
  onGetLoginHistory,
  onTerminateSession,
  onTerminateAllOtherSessions
}) => {
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTerminating, setIsTerminating] = useState<string | null>(null);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLoginHistory();
    }
  }, [isOpen]);

  const fetchLoginHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const history = await onGetLoginHistory();
      setSessions(history);
    } catch (error) {
      setError('Failed to load login history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (isTerminating) return;
    
    setIsTerminating(sessionId);
    try {
      const result = await onTerminateSession(sessionId);
      if (result.success) {
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        setError(result.error || 'Failed to terminate session');
      }
    } catch (error) {
      setError('Failed to terminate session');
    } finally {
      setIsTerminating(null);
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    if (isTerminatingAll) return;
    
    setIsTerminatingAll(true);
    setError('');
    try {
      const result = await onTerminateAllOtherSessions();
      if (result.success) {
        // Refresh the login history to show updated sessions
        await fetchLoginHistory();
      } else {
        setError(result.error || 'Failed to terminate all sessions');
      }
    } catch (error) {
      setError('Failed to terminate all sessions');
    } finally {
      setIsTerminatingAll(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      case 'suspicious':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Shield className="w-4 h-4" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Login History</h3>
                  <p className="text-sm text-gray-600">View and manage your active sessions</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Login History</h4>
                  <p className="text-gray-600">No login sessions found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const { date, time, relative } = formatDate(session.loginTime);
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {getDeviceIcon(session.device)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {session.device}
                                </h4>
                                {session.isCurrent && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Current Session
                                  </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                  {getStatusIcon(session.status)}
                                  <span className="ml-1 capitalize">{session.status}</span>
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Globe className="w-4 h-4" />
                                  <span>{session.browser} on {session.os}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4" />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{relative}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">IP: {session.ipAddress}</span>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-xs text-gray-500">
                                {date} at {time}
                              </div>
                            </div>
                          </div>
                          
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleTerminateSession(session.id)}
                              disabled={isTerminating === session.id}
                              className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                            >
                              {isTerminating === session.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Terminate'
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-600">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
                  </p>
                  {sessions.filter(s => !s.isCurrent).length > 0 && (
                    <button
                      onClick={handleTerminateAllOtherSessions}
                      disabled={isTerminatingAll || isLoading}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {isTerminatingAll ? 'Terminating...' : 'Terminate All Others'}
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchLoginHistory}
                  disabled={isLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginHistoryModal;
