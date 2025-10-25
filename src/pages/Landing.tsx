import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConsentModal from '../components/ConsentModal';
import { 
  CreditCard, 
  User, 
  Building, 
  TrendingUp, 
  Smartphone, 
  Shield, 
  Check, 
  Star, 
  Eye, 
  Zap,
  Lock,
  Brain,
  Globe,
  ShieldCheck,
  Fingerprint,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Menu
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConsentModal(true);
  };

  const handleConsentAccept = () => {
    setShowConsentModal(false);
    navigate('/signup');
  };

  const handleConsentReject = () => {
    setShowConsentModal(false);
  };

  const handleConsentClose = () => {
    setShowConsentModal(false);
  };

  useEffect(() => {
    // Initialize any necessary effects here
    const handleScroll = () => {
      const navbar = document.querySelector('nav');
      if (navbar && window.scrollY > 100) {
        navbar.classList.add('shadow-lg');
      } else if (navbar) {
        navbar.classList.remove('shadow-lg');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation - Cash App Style */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#d8ed36] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">$</span>
              </div>
              <span className="text-xl font-bold text-white">InvestFlow Bank</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="nav-link text-gray-300 hover:text-white font-medium transition-colors">Home</a>
              <a href="#services" className="nav-link text-gray-300 hover:text-white font-medium transition-colors">Services</a>
              <a href="#features" className="nav-link text-gray-300 hover:text-white font-medium transition-colors">Features</a>
              <a href="/security" className="nav-link text-gray-300 hover:text-white font-medium transition-colors">Security</a>
              <a href="#about" className="nav-link text-gray-300 hover:text-white font-medium transition-colors">About</a>
              <a href="#contact" className="nav-link text-gray-300 hover:text-white font-medium transition-colors">Contact</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">Login</Link>
              <button onClick={handleSignupClick} className="bg-[#d8ed36] hover:bg-[#c4d630] text-black px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105">Get Started</button>
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={toggleMobileMenu} className="md:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" className="md:hidden hidden bg-black border-t border-gray-800">
          <div className="px-4 py-4 space-y-3">
            <a href="#home" className="block text-gray-300 hover:text-white font-medium">Home</a>
            <a href="#services" className="block text-gray-300 hover:text-white font-medium">Services</a>
            <a href="#features" className="block text-gray-300 hover:text-white font-medium">Features</a>
            <a href="/security" className="block text-gray-300 hover:text-white font-medium">Security</a>
            <a href="#about" className="block text-gray-300 hover:text-white font-medium">About</a>
            <a href="#contact" className="block text-gray-300 hover:text-white font-medium">Contact</a>
            <div className="pt-4 border-t border-gray-800 space-y-3">
              <Link to="/login" className="block w-full text-left text-gray-300 hover:text-white font-medium">Login</Link>
              <button onClick={handleSignupClick} className="block w-full bg-[#d8ed36] text-black px-4 py-2 rounded-full font-semibold">Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Cash App Style */}
      <section id="home" className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                  <span className="block">Banking</span>
                  <span className="block text-[#d8ed36]">Made Simple</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-lg">
                  Send, spend, bank, and invest with InvestFlow Bank. The easiest way to manage your money.
                </p>
              </div>
              
              {/* Hero Stats - Cash App Style */}
              <div className="grid grid-cols-3 gap-8 py-8">
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-[#d8ed36] mb-2">50M+</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-[#d8ed36] mb-2">$100B+</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-[#d8ed36] mb-2">4.8★</div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">App Store</div>
                </div>
              </div>
              
              {/* CTA Buttons - Cash App Style */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleSignupClick} 
                  className="bg-[#d8ed36] text-black px-8 py-4 rounded-full font-semibold hover:bg-[#c4d630] transition-all duration-200 transform hover:scale-105 shadow-lg text-center text-lg"
                >
                  Get Started
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-200 text-lg">
                  Download App
                </button>
              </div>
            </div>
            
            {/* Hero Graphics - Cash App Style */}
            <div className="relative">
              {/* Main Phone Mockup */}
              <div className="relative mx-auto w-80 h-[600px] bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-100">
                    <div className="text-sm font-semibold text-black">9:41</div>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                      <div className="w-4 h-2 bg-black rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* App Header */}
                  <div className="bg-black px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 bg-[#d8ed36] rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">$</span>
                      </div>
                      <div className="text-white text-lg font-semibold">InvestFlow Bank</div>
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Balance Card */}
                  <div className="px-6 py-6">
                    <div className="bg-[#d8ed36] rounded-2xl p-6 text-black">
                      <div className="text-sm opacity-80 mb-1">Your Balance</div>
                      <div className="text-3xl font-bold mb-4">$1,234.56</div>
                      <div className="flex space-x-4">
                        <button className="flex-1 bg-black text-white py-3 rounded-xl font-semibold text-sm">
                          Add Cash
                        </button>
                        <button className="flex-1 bg-white text-black py-3 rounded-xl font-semibold text-sm">
                          Cash Out
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">📱</span>
                        </div>
                        <div className="text-xs text-gray-600">Pay</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div className="text-xs text-gray-600">Card</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">📈</span>
                        </div>
                        <div className="text-xs text-gray-600">Invest</div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">🏦</span>
                        </div>
                        <div className="text-xs text-gray-600">Bank</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-[#d8ed36] rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-white rounded-full opacity-30 animate-bounce"></div>
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#d8ed36] rounded-full opacity-40 animate-ping"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-4">
              Comprehensive Banking Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From everyday banking to wealth management, we provide a full suite of financial services designed to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Personal Banking */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#d8ed36] rounded-xl flex items-center justify-center mb-6">
                <User className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Personal Banking</h3>
              <p className="text-gray-700 mb-6">Complete banking solutions for individuals including checking, savings, and personal loans.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Free checking accounts</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />High-yield savings</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Personal loans</li>
              </ul>
            </div>
            
            {/* Business Banking */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#d8ed36] rounded-xl flex items-center justify-center mb-6">
                <Building className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Business Banking</h3>
              <p className="text-gray-700 mb-6">Tailored solutions for businesses of all sizes to manage cash flow and growth.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Business accounts</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Commercial loans</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Merchant services</li>
              </ul>
            </div>
            
            {/* Investment Management */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#d8ed36] rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Investment Management</h3>
              <p className="text-gray-700 mb-6">Professional investment management and wealth advisory services.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Portfolio management</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Financial planning</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Retirement planning</li>
              </ul>
            </div>
            
            {/* Digital Banking */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#d8ed36] rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Digital Banking</h3>
              <p className="text-gray-700 mb-6">24/7 online and mobile banking with cutting-edge technology.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Mobile app</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Online banking</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Digital payments</li>
              </ul>
            </div>
            
            {/* Credit Solutions */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#d8ed36] rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Credit Solutions</h3>
              <p className="text-gray-700 mb-6">Flexible credit options including cards, lines of credit, and mortgages.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Credit cards</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Home loans</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Lines of credit</li>
              </ul>
            </div>
            
            {/* Insurance */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-[#d8ed36] rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Insurance</h3>
              <p className="text-gray-700 mb-6">Comprehensive insurance products to protect what matters most.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Life insurance</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Auto insurance</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-[#d8ed36] mr-2" />Home insurance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-4">
              Why Choose InvestFlow Bank?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience banking reimagined with innovative features designed for the modern world.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Features List */}
            <div className="space-y-8">
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Lightning Fast Transfers</h3>
                  <p className="text-gray-600">Send and receive money instantly with our advanced payment processing system.</p>
                </div>
              </div>
              
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Bank-Grade Security</h3>
                  <p className="text-gray-600">Your money and data are protected with military-grade encryption and fraud monitoring.</p>
                </div>
              </div>
              
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">Get personalized financial advice and spending insights powered by artificial intelligence.</p>
                </div>
              </div>
              
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-[#d8ed36] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-2">Global Access</h3>
                  <p className="text-gray-600">Access your account from anywhere in the world with no international fees.</p>
                </div>
              </div>
            </div>
            
            {/* Feature Showcase */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-r from-[#d8ed36] to-[#c4d630] rounded-2xl p-6 text-black mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">InvestFlow Platinum</span>
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold mb-2">•••• •••• •••• 8749</div>
                  <div className="flex items-center justify-between text-sm">
                    <span>JOHN SMITH</span>
                    <span>12/27</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Available Balance</span>
                    <span className="font-semibold text-gray-900">$12,845.67</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Credit Limit</span>
                    <span className="font-semibold text-gray-900">$25,000.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rewards Points</span>
                    <span className="font-semibold text-[#d8ed36]">24,567 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">
              Your Security is Our Priority
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced security measures protect your financial information with multiple layers of defense.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d8ed36] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2">256-bit Encryption</h3>
              <p className="text-gray-400 text-sm">Military-grade encryption protects all your data and transactions.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d8ed36] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2">Biometric Access</h3>
              <p className="text-gray-400 text-sm">Secure login with fingerprint and facial recognition technology.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d8ed36] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2">24/7 Monitoring</h3>
              <p className="text-gray-400 text-sm">Round-the-clock fraud detection and prevention systems.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#d8ed36] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instant Alerts</h3>
              <p className="text-gray-400 text-sm">Real-time notifications for all account activities and transactions.</p>
            </div>
          </div>
          
          {/* Security Certifications */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8">Trusted & Certified</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-[#d8ed36]">FDIC</div>
                  <div className="text-xs text-gray-400">Insured</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-[#d8ed36]">SOC 2</div>
                  <div className="text-xs text-gray-400">Compliant</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-[#d8ed36]">PCI DSS</div>
                  <div className="text-xs text-gray-400">Certified</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-[#d8ed36]">ISO 27001</div>
                  <div className="text-xs text-gray-400">Certified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what real customers have to say about their InvestFlow Bank experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-[#d8ed36]">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "InvestFlow Bank has completely transformed how I manage my finances. The mobile app is intuitive and the customer service is exceptional."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#d8ed36] rounded-full flex items-center justify-center text-black font-bold mr-4">
                  JS
                </div>
                <div>
                  <div className="font-semibold text-black">Jessica Smith</div>
                  <div className="text-gray-600 text-sm">Small Business Owner</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-[#d8ed36]">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The investment management services have helped me grow my portfolio significantly. Their AI-powered insights are incredibly valuable."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#d8ed36] rounded-full flex items-center justify-center text-black font-bold mr-4">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-black">Michael Johnson</div>
                  <div className="text-gray-600 text-sm">Software Engineer</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-[#d8ed36]">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "As a frequent traveler, the global access and no international fees have saved me thousands. Best banking decision I've ever made."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#d8ed36] rounded-full flex items-center justify-center text-black font-bold mr-4">
                  SD
                </div>
                <div>
                  <div className="font-semibold text-black">Sarah Davis</div>
                  <div className="text-gray-600 text-sm">Marketing Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Banking Experience?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join over 500,000 satisfied customers who trust InvestFlow Bank with their financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleSignupClick} className="bg-[#d8ed36] text-black px-8 py-4 rounded-full font-semibold hover:bg-[#c4d630] transition-all duration-200 transform hover:scale-105 shadow-lg">
              Open Your Account Today
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-200">
              Schedule a Consultation
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-[#d8ed36] mb-1">2 Minutes</div>
              <div className="text-gray-300 text-sm">Account Opening</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#d8ed36] mb-1">$0</div>
              <div className="text-gray-300 text-sm">Monthly Fees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#d8ed36] mb-1">24/7</div>
              <div className="text-gray-300 text-sm">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-[#d8ed36] rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">$</span>
                </div>
                <span className="text-xl font-bold">InvestFlow Bank</span>
              </div>
              <p className="text-gray-400 mb-6">
                Your trusted financial partner, providing innovative banking solutions for a better financial future.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#d8ed36] hover:text-black transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#d8ed36] hover:text-black transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#d8ed36] hover:text-black transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#d8ed36] hover:text-black transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Services</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Personal Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Banking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Credit Solutions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Insurance</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/security" className="hover:text-white transition-colors">Security Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>1-800-INVEST (468378)</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>support@investflowbank.com</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 mt-1" />
                  <span>123 Financial District<br />New York, NY 10004</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 InvestFlow Bank. All rights reserved. Member FDIC.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Accessibility</a>
                <a href="#" className="hover:text-white transition-colors">Site Map</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
        }
        
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .security-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
          background-size: 20px 20px;
        }

        .testimonial-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .testimonial-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .feature-icon {
          transition: all 0.3s ease;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.1);
          color: #3b82f6;
        }

        .nav-link {
          position: relative;
          transition: color 0.3s ease;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: #3b82f6;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>

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

export default Landing;
