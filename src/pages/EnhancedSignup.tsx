import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Building,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Shield,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DocumentUpload from '../components/DocumentUpload';
import IDDocumentUpload from '../components/IDDocumentUpload';
import IDDocumentUploadFallback from '../components/IDDocumentUploadFallback';
import SecretPhraseModal from '../components/SecretPhraseModal';
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
  
  // ID Type and Documents
  idType: 'drivers-license' | 'passport' | 'state-id' | 'national-id';
  documents: {
    front?: { id: string; name: string };
    back?: { id: string; name: string };
    dataPage?: { id: string; name: string };
  };
  
  // Secret Phrase
  secretPhrase: string;
}

const EnhancedSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecretPhraseModal, setShowSecretPhraseModal] = useState(false);
  const [tempSecretPhrase, setTempSecretPhrase] = useState('');
  const [tempUserId] = useState(() => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [useStorageFallback, setUseStorageFallback] = useState(true); // Set to true to use fallback
  
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
    ssn: '',
    idType: 'drivers-license',
    documents: {},
    secretPhrase: ''
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Your account details' },
    { id: 2, title: 'Personal Information', description: 'Additional details' },
    { id: 3, title: 'Document Verification', description: 'Upload required documents' },
    { id: 4, title: 'Security Setup', description: 'Set up your secret phrase' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = (fileId: string, fileName: string, documentSide: string) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentSide]: { id: fileId, name: fileName }
      }
    }));
  };

  const handleDocumentRemove = (documentSide: string) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentSide]: undefined
      }
    }));
  };

  const handleSecretPhraseConfirm = async (phrase: string): Promise<boolean> => {
    setTempSecretPhrase(phrase);
    setFormData(prev => ({
      ...prev,
      secretPhrase: phrase
    }));
    return true;
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
      case 3:
        if (!formData.documents.front) {
          setError('Please upload the front of your ID document');
          return false;
        }
        // Check if back is required based on ID type
        if (formData.idType !== 'passport' && !formData.documents.back) {
          setError('Please upload the back of your ID document');
          return false;
        }
        // For passport, check if data page is uploaded
        if (formData.idType === 'passport' && !formData.documents.dataPage) {
          setError('Please upload the data page of your passport');
          return false;
        }
        break;
      case 4:
        if (!formData.secretPhrase) {
          setError('Please set up your secret phrase');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4) {
        setShowSecretPhraseModal(true);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signup(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`,
        {
          phone: formData.phone,
          secretPhrase: formData.secretPhrase,
          documents: formData.documents,
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
            annualIncome: formData.annualIncome,
            ssn: formData.ssn,
            idType: formData.idType
          }
        }
      );
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="form-input pl-10"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Confirm your password"
                  required
                />
              </div>
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
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Identity Verification</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Please select your ID type and upload clear, high-quality images. 
                    All documents will be securely stored and used for verification purposes only.
                  </p>
                </div>
              </div>
            </div>

            {/* ID Type Selection */}
            <div>
              <label className="form-label">Select Your ID Type *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {[
                  { value: 'drivers-license', label: 'Driver\'s License', icon: '🚗' },
                  { value: 'passport', label: 'Passport', icon: '📘' },
                  { value: 'state-id', label: 'State ID', icon: '🆔' },
                  { value: 'national-id', label: 'National ID', icon: '🆔' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.idType === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="idType"
                      value={option.value}
                      checked={formData.idType === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                    {formData.idType === option.value && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* ID Document Upload */}
            {useStorageFallback ? (
              <IDDocumentUploadFallback
                idType={formData.idType}
                onUpload={handleDocumentUpload}
                onRemove={handleDocumentRemove}
                currentFiles={formData.documents}
              />
            ) : (
              <IDDocumentUpload
                idType={formData.idType}
                userId={tempUserId}
                onUpload={handleDocumentUpload}
                onRemove={handleDocumentRemove}
                currentFiles={formData.documents}
              />
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Security Setup Required</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need to set up a 6-digit secret phrase that will be used to verify your identity 
                    when changing your password. This phrase will be generated for you and must be saved securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Up Secret Phrase</h3>
              <p className="text-gray-600 mb-6">
                Click the button below to generate and confirm your secret phrase
              </p>
              <button
                onClick={() => setShowSecretPhraseModal(true)}
                className="btn-primary px-6 py-3"
              >
                <Lock className="w-4 h-4 mr-2" />
                Set Up Secret Phrase
              </button>
            </div>

            {formData.secretPhrase && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Secret Phrase Set</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your secret phrase has been successfully set up and saved securely.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">
            Complete your registration in a few simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-gray-600 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="btn-secondary disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !formData.secretPhrase}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Create Account
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      {/* Secret Phrase Modal */}
      <SecretPhraseModal
        isOpen={showSecretPhraseModal}
        onClose={() => setShowSecretPhraseModal(false)}
        onConfirm={handleSecretPhraseConfirm}
        mode="setup"
        title="Set Up Secret Phrase"
        description="A 6-digit secret phrase will be generated for you. Please confirm it to complete your security setup."
      />
    </div>
  );
};

export default EnhancedSignup;
