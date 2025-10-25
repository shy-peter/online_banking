import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConsentModal from '../components/ConsentModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    navigate('/register');
  };

  const handleConsentReject = () => {
    setShowConsentModal(false);
    // Stay on login page
  };

  const handleConsentClose = () => {
    setShowConsentModal(false);
    // Stay on login page
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="relative max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white ml-3">InvestFlow</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-300">Sign in to your account to continue investing</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md">
                    {errors.general}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`bg-gray-800 border border-gray-700 text-white w-full placeholder-gray-400 pl-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`bg-gray-800 border border-gray-700 text-white w-full placeholder-gray-400 pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d8ed36] focus:border-transparent ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#d8ed36]" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-[#d8ed36]" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#d8ed36] focus:ring-[#d8ed36] border-gray-600 rounded bg-gray-800"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button 
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[#d8ed36] hover:text-[#c4d630] font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#d8ed36] text-black w-full py-3 text-lg font-semibold disabled:opacity-50 rounded-lg hover:bg-[#c4d630] transition-colors"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  Don't have an account?{' '}
                  <button 
                    onClick={handleSignupClick}
                    className="text-[#d8ed36] hover:text-[#c4d630] font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-center"
        >
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <div className="font-semibold text-[#d8ed36]">Secure Platform</div>
              <div>Bank-level security</div>
            </div>
            <div>
              <div className="font-semibold text-[#d8ed36]">High Returns</div>
              <div>Up to 70% annual returns</div>
            </div>
            <div>
              <div className="font-semibold text-[#d8ed36]">Multiple Plans</div>
              <div>Start from $100</div>
            </div>
            <div>
              <div className="font-semibold text-[#d8ed36]">24/7 Support</div>
              <div>Always here to help</div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onReject={handleConsentReject}
        onClose={handleConsentClose}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default Login;