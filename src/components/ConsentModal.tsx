import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Check, AlertTriangle } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onAccept,
  onReject,
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-sm"
            style={{
              borderRadius: '5px',
              width: '300px',
              height: '220px',
              padding: '30px',
              opacity: 1,
              position: 'fixed',
              top: 'calc(50vh - 100px)',
              left: 'calc(50vw - 150px)',
              zIndex: 900000001
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-lg font-semibold" style={{ color: '#002082' }}>
                Notice Of Consent!
              </h5>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <hr className="mb-2 border-gray-300" />

            {/* Content */}
            <div 
              className="p-1 mt-3 text-sm leading-relaxed"
              style={{ color: 'rgb(1, 33, 104)' }}
            >
              We will collect your personal data for the purpose of opening and managing your account. 
              Kindly accept to continue.
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={onReject}
                className="rounded p-3 text-sm font-medium transition-colors duration-200 hover:opacity-80"
                style={{ 
                  color: '#002082', 
                  backgroundColor: 'rgb(186, 191, 190)',
                  cursor: 'pointer'
                }}
              >
                I reject
              </button>
              
              <button
                onClick={onAccept}
                className="rounded p-3 text-sm font-medium text-white transition-colors duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#002082',
                  cursor: 'pointer'
                }}
              >
                I accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConsentModal;
