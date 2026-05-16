import React from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onContinue: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 max-w-md w-full"
      >
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-[#d8ed36]/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#d8ed36]" />
              </div>
              <div className="absolute bottom-0 right-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Account Created Successfully!
          </h2>
          
          <p className="text-gray-300 text-center mb-6">
            We've sent a verification link to:
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
            <p className="text-[#d8ed36] font-semibold text-sm break-all">{email}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Next Steps:</h3>
            <ol className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold mr-3 flex-shrink-0">1</span>
                <span>Check your email inbox</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold mr-3 flex-shrink-0">2</span>
                <span>Click the verification link</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold mr-3 flex-shrink-0">3</span>
                <span>Log in to your account</span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-gray-400 text-center mb-6">
            Check your spam folder if you don't see the email within a few minutes
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onContinue}
              className="w-full bg-[#d8ed36] text-black py-3 px-6 rounded-lg font-semibold hover:bg-[#c4d630] transition-colors flex items-center justify-center"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-800 text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            This window will close automatically if you don't need it
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationModal;
