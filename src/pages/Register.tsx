import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, DollarSign, Check, ArrowRight, Calendar, Shield, Phone, MapPin, Hash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { INVESTMENT_PLANS, formatCurrency } from '../lib/appwrite';
import { referralService } from '../lib/referralService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConsentModal from '../components/ConsentModal';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [showConsentModal, setShowConsentModal] = useState(true);
  const [referralError, setReferralError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    annualIncome: '',
    selectedPlan: null as any,
    agreedToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();

  const handleConsentAccept = () => {
    setShowConsentModal(false);
  };

  const handleConsentReject = () => {
    setShowConsentModal(false);
  };

  const handleConsentClose = () => {
    setShowConsentModal(false);
    navigate('/');
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone) && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }
    
    if (!formData.ssn.trim()) {
      newErrors.ssn = 'SSN is required';
    } else if (!/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn) && !/^\d{9}$/.test(formData.ssn.replace(/\D/g, ''))) {
      newErrors.ssn = 'Please enter a valid SSN (XXX-XX-XXXX)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    if (!formData.selectedPlan) {
      setErrors({ plan: 'Please select an investment plan' });
      return false;
    }
    
    if (!formData.agreedToTerms) {
      setErrors({ terms: 'Please agree to the terms and conditions' });
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePlanSelect = (plan: any) => {
    setFormData(prev => ({ ...prev, selectedPlan: plan }));
    if (errors.plan) {
      setErrors(prev => ({ ...prev, plan: '' }));
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep4()) return;

    setIsLoading(true);
    
    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name
      );

      if (result.success) {
        // Check for referral code in URL parameters
        const referralCode = searchParams.get('ref');
        if (referralCode && result.user) {
          try {
            await referralService.completeReferral(referralCode, result.user.$id);
          } catch (referralError) {
            console.error('Failed to complete referral:', referralError);
            setReferralError(referralError instanceof Error ? referralError.message : 'Failed to complete referral');
          }
        }
        navigate('/verify-email');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
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
            Join thousands of investors building wealth with our smart investment platform
          </p>
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
              step >= 1 ? 'bg-[#d8ed36] text-black' : 'bg-gray-700 text-gray-400'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 rounded ${step >= 2 ? 'bg-[#d8ed36]' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'bg-[#d8ed36] text-black' : 'bg-gray-700 text-gray-400'
            }`}>
              2
            </div>
            <div className={`h-1 w-16 rounded ${step >= 3 ? 'bg-[#d8ed36]' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 3 ? 'bg-[#d8ed36] text-black' : 'bg-gray-700 text-gray-400'
            }`}>
              3
            </div>
            <div className={`h-1 w-16 rounded ${step >= 4 ? 'bg-[#d8ed36]' : 'bg-gray-700'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 4 ? 'bg-[#d8ed36] text-black' : 'bg-gray-700 text-gray-400'
            }`}>
              4
            </div>
          </div>
          <div className="flex justify-center space-x-8 text-xs text-gray-300">
            <span>Account</span>
            <span>Personal</span>
            <span>Address</span>
            <span>Plan</span>
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
              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                      Create Your Account
                    </h2>

                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                          className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                          onChange={handleChange}
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
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary w-full py-3 text-lg font-semibold"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                ) : step === 2 ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                      Personal Information
                    </h2>

                    {/* Phone Field */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    {/* Date of Birth Field */}
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
                    </div>

                    {/* SSN Field */}
                    <div>
                      <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-2">
                        Social Security Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="ssn"
                          name="ssn"
                          type="text"
                          required
                          value={formData.ssn}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.ssn ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="XXX-XX-XXXX"
                          maxLength={11}
                        />
                      </div>
                      {errors.ssn && <p className="mt-1 text-sm text-red-600">{errors.ssn}</p>}
                      <p className="mt-1 text-xs text-gray-500">Required for identity verification and tax reporting</p>
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn-secondary px-6 py-3"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn-primary px-6 py-3"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ) : step === 3 ? (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                      Address Information
                    </h2>

                    {/* Address Field */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          required
                          value={formData.address}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="123 Main Street"
                        />
                      </div>
                      {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* City Field */}
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className={`input-field ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="New York"
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                      </div>

                      {/* State Field */}
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <select
                          id="state"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleChange}
                          className={`input-field ${errors.state ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        >
                          <option value="">Select State</option>
                          <option value="AL">Alabama</option>
                          <option value="AK">Alaska</option>
                          <option value="AZ">Arizona</option>
                          <option value="AR">Arkansas</option>
                          <option value="CA">California</option>
                          <option value="CO">Colorado</option>
                          <option value="CT">Connecticut</option>
                          <option value="DE">Delaware</option>
                          <option value="FL">Florida</option>
                          <option value="GA">Georgia</option>
                          <option value="HI">Hawaii</option>
                          <option value="ID">Idaho</option>
                          <option value="IL">Illinois</option>
                          <option value="IN">Indiana</option>
                          <option value="IA">Iowa</option>
                          <option value="KS">Kansas</option>
                          <option value="KY">Kentucky</option>
                          <option value="LA">Louisiana</option>
                          <option value="ME">Maine</option>
                          <option value="MD">Maryland</option>
                          <option value="MA">Massachusetts</option>
                          <option value="MI">Michigan</option>
                          <option value="MN">Minnesota</option>
                          <option value="MS">Mississippi</option>
                          <option value="MO">Missouri</option>
                          <option value="MT">Montana</option>
                          <option value="NE">Nebraska</option>
                          <option value="NV">Nevada</option>
                          <option value="NH">New Hampshire</option>
                          <option value="NJ">New Jersey</option>
                          <option value="NM">New Mexico</option>
                          <option value="NY">New York</option>
                          <option value="NC">North Carolina</option>
                          <option value="ND">North Dakota</option>
                          <option value="OH">Ohio</option>
                          <option value="OK">Oklahoma</option>
                          <option value="OR">Oregon</option>
                          <option value="PA">Pennsylvania</option>
                          <option value="RI">Rhode Island</option>
                          <option value="SC">South Carolina</option>
                          <option value="SD">South Dakota</option>
                          <option value="TN">Tennessee</option>
                          <option value="TX">Texas</option>
                          <option value="UT">Utah</option>
                          <option value="VT">Vermont</option>
                          <option value="VA">Virginia</option>
                          <option value="WA">Washington</option>
                          <option value="WV">West Virginia</option>
                          <option value="WI">Wisconsin</option>
                          <option value="WY">Wyoming</option>
                        </select>
                        {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                      </div>
                    </div>

                    {/* ZIP Code Field */}
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Hash className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="zipCode"
                          name="zipCode"
                          type="text"
                          required
                          value={formData.zipCode}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.zipCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="12345"
                          maxLength={10}
                        />
                      </div>
                      {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                    </div>

                    {/* Annual Income Field */}
                    <div>
                      <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Income
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="annualIncome"
                          name="annualIncome"
                          type="number"
                          value={formData.annualIncome}
                          onChange={handleChange}
                          className={`input-field pl-10 ${errors.annualIncome ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="Enter your annual income"
                          min="0"
                          step="1000"
                        />
                      </div>
                      {errors.annualIncome && <p className="mt-1 text-sm text-red-600">{errors.annualIncome}</p>}
                      <p className="mt-1 text-xs text-gray-500">Optional - Used for investment recommendations</p>
                    </div>

                    <div className="flex justify-between pt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn-secondary px-6 py-3"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn-primary px-6 py-3"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                      Choose Your Investment Plan
                    </h2>

                    <div className="grid gap-4 max-h-96 overflow-y-auto">
                      {INVESTMENT_PLANS.map((plan: any) => (
                        <div
                          key={plan.id}
                          onClick={() => handlePlanSelect(plan)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.selectedPlan?.id === plan.id
                              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  formData.selectedPlan?.id === plan.id
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-gray-300'
                                }`}>
                                  {formData.selectedPlan?.id === plan.id && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                  <p className="text-sm text-gray-600">{plan.description}</p>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                Min: {formatCurrency(plan.minAmount * 100)} • 
                                Max: {plan.maxAmount ? formatCurrency(plan.maxAmount * 100) : 'No limit'} • 
                                Rate: {plan.interestRate}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.plan && <p className="text-sm text-red-600">{errors.plan}</p>}

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3">
                      <input
                        id="agreedToTerms"
                        name="agreedToTerms"
                        type="checkbox"
                        checked={formData.agreedToTerms}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="agreedToTerms" className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn-secondary flex-1 py-3 text-lg font-semibold"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex-1 py-3 text-lg font-semibold disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600  hover:text-[#8c9e0b] text-[#dcf428] font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
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
    </div>
  );
};

export default Register;