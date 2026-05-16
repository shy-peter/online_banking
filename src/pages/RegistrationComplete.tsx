import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight, Clock } from 'lucide-react';

const RegistrationComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    // If no email param, redirect to home
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  const handleContinueToLogin = () => {
    navigate('/login');
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H5.75A4.25 4.25 0 001.5 5.75v8.5a4.25 4.25 0 004.25 4.25h8.5a4.25 4.25 0 004.25-4.25v-8.5a4.25 4.25 0 00-4.25-4.25h-3.75" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M7 10h6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white ml-3">InvestFlow</h1>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 md:p-12"
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-400"
              />
            </motion.div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Registration Complete!
          </h2>

          <p className="text-gray-300 text-center mb-8 text-lg">
            Your account has been successfully created
          </p>

          {/* Email Display */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8 text-center border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Verification link sent to:</p>
            <p className="text-[#d8ed36] font-bold text-lg break-all">{email}</p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex-shrink-0 w-8 h-8 bg-[#d8ed36] rounded-full flex items-center justify-center text-black font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Check Your Email</h3>
                <p className="text-gray-300 text-sm">
                  Look for a verification email from InvestFlow in your inbox
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex-shrink-0 w-8 h-8 bg-[#d8ed36] rounded-full flex items-center justify-center text-black font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Click the Link</h3>
                <p className="text-gray-300 text-sm">
                  Click the verification link in the email to confirm your account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex-shrink-0 w-8 h-8 bg-[#d8ed36] rounded-full flex items-center justify-center text-black font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Sign In</h3>
                <p className="text-gray-300 text-sm">
                  Once verified, log in with your email and password
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-sm">
                  <strong>Didn't receive the email?</strong> Check your spam or junk folder. The verification link is valid for 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinueToLogin}
              className="w-full bg-[#d8ed36] text-black py-3 px-6 rounded-lg font-semibold hover:bg-[#c4d630] transition-colors flex items-center justify-center text-lg"
            >
              Continue to Login
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-800 text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-center text-gray-400 text-sm mt-8">
            Already verified your email?{' '}
            <button
              onClick={handleContinueToLogin}
              className="text-[#d8ed36] hover:text-[#c4d630] font-semibold transition-colors"
            >
              Sign in now
            </button>
          </p>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            Welcome to InvestFlow! We're excited to have you on board.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationComplete;
