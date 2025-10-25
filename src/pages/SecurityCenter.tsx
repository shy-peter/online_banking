import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, AlertTriangle, Phone, MessageCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import securityHero from '../assets/security-hero.svg';
import proactiveSecurity from '../assets/proactive-security.svg';
import activityAlerts from '../assets/activity-alerts.svg';
import privacyControls from '../assets/privacy-controls.svg';
import identityVerification from '../assets/identity-verification.svg';
import supportCall from '../assets/support-call.svg';
import supportChat from '../assets/support-chat.svg';
import supportHelp from '../assets/support-help.svg';
import savingsGoals from '../assets/savings-goals.svg';
import sendMoney from '../assets/send-money.svg';
import banking from '../assets/banking.svg';

const SecurityCenter = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does InvestFlow Bank keep my account safe from fraud?",
      answer: "InvestFlow Bank uses encryption and fraud detection technology to help keep your data and money secure. Any information you submit is encrypted and sent to our servers securely, regardless of whether you're using a public or private Wi-Fi connection or data service."
    },
    {
      question: "How does InvestFlow Bank keep my money safe?",
      answer: "InvestFlow Bank protects millions of people's payments each month. Built on a secure platform, InvestFlow Bank has proactive security features that power and protect your money, personal info, and transactions."
    },
    {
      question: "Are my investments protected by the SIPC?",
      answer: "Yes, InvestFlow Bank Investing LLC is a member of SIPC. Securities in your account are protected up to $500,000. For details, please see www.sipc.org. InvestFlow Bank Investing does not hold your proceeds from the sale of stocks or ETFs. You authorize that proceeds from sale of stocks or ETFs to be automatically transferred to your InvestFlow Bank balance, which is not SIPC-protected."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100"></div>
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Image */}
            <div className="order-2 lg:order-1">
              <div className="bg-[#d8ed36] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#d8ed36] to-[#c4d630] opacity-90"></div>
                <div className="relative z-10">
                  <img 
                    src={securityHero} 
                    alt="Security Hero" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Know your money is safe
                </h1>
                <h2 className="text-xl md:text-2xl text-gray-600 mb-8">
                  Our secure platform keeps your money protected
                </h2>
                
                {/* QR Code Section */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">QR Code</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">Download InvestFlow Bank</p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="text-sm text-gray-500">
                  <p>
                    InvestFlow Bank is a financial services platform, not a bank. Banking services are provided by InvestFlow Bank's bank partner(s). 
                    See <a href="#" className="text-[#d8ed36] hover:underline">Terms and Conditions</a>.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Proactive Security Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h6 className="text-[#d8ed36] font-semibold text-sm uppercase tracking-wider mb-4">
                  PROACTIVE SECURITY
                </h6>
                <p className="text-xl text-gray-700 leading-relaxed">
                  We ask you to confirm before sending money to anyone who isn't in your contacts.
                </p>
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <img 
                  src={proactiveSecurity} 
                  alt="Proactive Security" 
                  className="w-full h-auto rounded-lg"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Alerts Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={activityAlerts} 
                  alt="Activity Alerts" 
                  className="w-full h-auto rounded-lg"
                />
              </motion.div>
            </div>
            <div className="order-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h6 className="text-[#d8ed36] font-semibold text-sm uppercase tracking-wider mb-4">
                  ACTIVITY ALERTS
                </h6>
                <p className="text-xl text-gray-700 leading-relaxed">
                  If there's suspicious activity on your account, we let you know to make sure your money's safe.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Cards Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
            >
              <img 
                src={privacyControls} 
                alt="Privacy Controls" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h6 className="text-[#d8ed36] font-semibold text-sm uppercase tracking-wider mb-4">
                PRIVACY CONTROLS
              </h6>
              <p className="text-gray-600 leading-relaxed">
                Control what you share and who can request money from you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg"
            >
              <img 
                src={identityVerification} 
                alt="Identity Verification" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h6 className="text-[#d8ed36] font-semibold text-sm uppercase tracking-wider mb-4">
                IDENTITY VERIFICATION
              </h6>
              <p className="text-gray-600 leading-relaxed">
                We ask everyone to verify their identity to keep InvestFlow Bank safe.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">InvestFlow Bank Support</h3>
            <button className="bg-transparent border-2 border-[#d8ed36] text-[#d8ed36] px-8 py-3 rounded-lg font-semibold hover:bg-[#d8ed36] hover:text-black transition-colors">
              Get support
            </button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg p-6 mb-4 shadow-lg border border-gray-200">
                <img 
                  src={supportCall} 
                  alt="Call Support" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <p className="text-gray-600">Call support at 1 (800) 969-1940</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg p-6 mb-4 shadow-lg border border-gray-200">
                <img 
                  src={supportChat} 
                  alt="Chat Support" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <p className="text-gray-600">Chat with support anytime in the app</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg p-6 mb-4 shadow-lg border border-gray-200">
                <img 
                  src={supportHelp} 
                  alt="Help Articles" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <p className="text-gray-600">Find support articles at investflowbank.com/help</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900">Common questions</h3>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#d8ed36] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#d8ed36] flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore More Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900">Explore more</h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg p-6 mb-4 shadow-lg border border-gray-200">
                <img 
                  src={savingsGoals} 
                  alt="Savings" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Save for your goals, your way*</h4>
              <button className="bg-transparent border-2 border-[#d8ed36] text-[#d8ed36] px-6 py-2 rounded-lg font-semibold hover:bg-[#d8ed36] hover:text-black transition-colors">
                Start saving
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg p-6 mb-4 shadow-lg border border-gray-200">
                <img 
                  src={sendMoney} 
                  alt="Send Money" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Send money with InvestFlow Bank for free</h4>
              <button className="bg-transparent border-2 border-[#d8ed36] text-[#d8ed36] px-6 py-2 rounded-lg font-semibold hover:bg-[#d8ed36] hover:text-black transition-colors">
                Send money
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-white rounded-lg p-6 mb-4 shadow-lg border border-gray-200">
                <img 
                  src={banking} 
                  alt="Banking" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              <p className="text-gray-600 mb-4">Bank** on your terms—without all the fees</p>
              <button className="bg-transparent border-2 border-[#d8ed36] text-[#d8ed36] px-6 py-2 rounded-lg font-semibold hover:bg-[#d8ed36] hover:text-black transition-colors">
                Explore banking**
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecurityCenter;
