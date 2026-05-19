import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Shield,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface SignupData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Personal Info
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  occupation: string;
  annualIncome: string;
  ssn: string; // For US users
}

const EnhancedSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    occupation: '',
    annualIncome: '',
    ssn: ''
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Your account details' },
    { id: 2, title: 'Personal Information', description: 'Additional details' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };


  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return false;
        }
        break;
      case 2:
        if (!formData.dateOfBirth || !formData.address || !formData.city || !formData.country) {
          setError('Please fill in all required personal information');
          return false;
        }
        // Validate SSN for US users
        if (formData.country === 'US' && !formData.ssn) {
          setError('SSN is required for US residents');
          return false;
        }
        if (formData.country === 'US' && formData.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
          setError('Please enter SSN in format XXX-XX-XXXX');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateStep(2)) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signup(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`,
        {
          phone: formData.phone,
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
            occupation: formData.occupation,
            annualIncome: parseFloat(formData.annualIncome) || 0,
            ssn: formData.ssn
          }
        }
      );
      
      if (result.success) {
        // User is automatically logged in, redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please check your information and try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`input-field pl-10  ${errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
              </div>
            </div>

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
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
            </div>

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
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="form-label">Date of Birth *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your city"
                  required
                />
              </div>
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your state"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter ZIP code"
                />
              </div>
              <div>
                <label className="form-label">Country *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="SE">Sweden</option>
                  <option value="NO">Norway</option>
                  <option value="DK">Denmark</option>
                  <option value="FI">Finland</option>
                  <option value="CH">Switzerland</option>
                  <option value="AT">Austria</option>
                  <option value="BE">Belgium</option>
                  <option value="IE">Ireland</option>
                  <option value="PT">Portugal</option>
                  <option value="GR">Greece</option>
                  <option value="LU">Luxembourg</option>
                  <option value="MT">Malta</option>
                  <option value="CY">Cyprus</option>
                  <option value="EE">Estonia</option>
                  <option value="LV">Latvia</option>
                  <option value="LT">Lithuania</option>
                  <option value="PL">Poland</option>
                  <option value="CZ">Czech Republic</option>
                  <option value="SK">Slovakia</option>
                  <option value="SI">Slovenia</option>
                  <option value="HU">Hungary</option>
                  <option value="RO">Romania</option>
                  <option value="BG">Bulgaria</option>
                  <option value="HR">Croatia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Occupation</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your occupation"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Annual Income</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your annual income"
                  min="0"
                  step="1000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional - Used for investment recommendations
              </p>
            </div>

            {/* SSN Field for US users */}
            {formData.country === 'US' && (
              <div>
                <label className="form-label">Social Security Number (SSN) *</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="ssn"
                    value={formData.ssn}
                    onChange={(e) => {
                      // Format SSN as user types
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 6) {
                        value = value.slice(0, 3) + '-' + value.slice(3, 5) + '-' + value.slice(5, 9);
                      } else if (value.length >= 4) {
                        value = value.slice(0, 3) + '-' + value.slice(3);
                      }
                      setFormData(prev => ({ ...prev, ssn: value }));
                    }}
                    className="form-input pl-10"
                    placeholder="XXX-XX-XXXX"
                    maxLength={11}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for US residents. Your SSN is encrypted and stored securely.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="relative max-w-4xl mx-auto">
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
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Join thousands of investors building wealth with our smart investment platform          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 1 ? 'bg-[#d8ed36] text-black' : 'bg-gray-700 text-gray-400'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 rounded ${currentStep >= 2 ? 'bg-[#d8ed36]' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 2 ? 'bg-[#d8ed36] text-black' : 'bg-gray-700 text-gray-400'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-center space-x-8 text-xs text-gray-300">
            <span>Basic Info</span>
            <span>Personal Info</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-300 text-center">
                  {steps[currentStep - 1].description}
                </p>
              </div>

          {renderStepContent()}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Previous
            </button>

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="btn-primary px-6 py-3 disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Create Account
                    <Check className="w-4 h-4 ml-2 inline" />
                  </>
                )}
              </button>
            )}
          </div>
            </div>
          </div>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-300">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[#d8ed36] hover:text-[#c4d630] font-medium transition-colors"
            >
              Sign in here
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedSignup;