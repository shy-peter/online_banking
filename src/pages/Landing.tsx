import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  TrendingUp as TrendingUpIcon,
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InvestFlow Bank</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="nav-link text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="#services" className="nav-link text-gray-700 hover:text-blue-600 font-medium">Services</a>
              <a href="#features" className="nav-link text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#security" className="nav-link text-gray-700 hover:text-blue-600 font-medium">Security</a>
              <a href="#about" className="nav-link text-gray-700 hover:text-blue-600 font-medium">About</a>
              <a href="#contact" className="nav-link text-gray-700 hover:text-blue-600 font-medium">Contact</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Login</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Open Account</Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button onClick={toggleMobileMenu} className="md:hidden text-gray-700">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div id="mobile-menu" className="md:hidden hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <a href="#home" className="block text-gray-700 hover:text-blue-600 font-medium">Home</a>
            <a href="#services" className="block text-gray-700 hover:text-blue-600 font-medium">Services</a>
            <a href="#features" className="block text-gray-700 hover:text-blue-600 font-medium">Features</a>
            <a href="#security" className="block text-gray-700 hover:text-blue-600 font-medium">Security</a>
            <a href="#about" className="block text-gray-700 hover:text-blue-600 font-medium">About</a>
            <a href="#contact" className="block text-gray-700 hover:text-blue-600 font-medium">Contact</a>
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link to="/login" className="block w-full text-left text-blue-600 font-medium">Login</Link>
              <Link to="/register" className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">Open Account</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-16 gradient-bg overflow-hidden">
        <div className="security-pattern absolute inset-0 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Banking Made
                <span className="text-yellow-300"> Simple</span> &
                <span className="text-yellow-300"> Secure</span>
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
                Experience the future of digital banking with InvestFlow Bank. Manage your finances, grow your wealth, and secure your future with our cutting-edge platform.
              </p>
              
              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-300">500K+</div>
                  <div className="text-blue-100 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-300">$2.5B</div>
                  <div className="text-blue-100 text-sm">Assets Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-300">99.9%</div>
                  <div className="text-blue-100 text-sm">Uptime</div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg text-center">
                  Open Free Account
                </Link>
                <button className="glass-effect text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            
            {/* Hero Image/Graphics */}
            <div className="relative">
              <div className="animate-float bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Account Balance</h3>
                    <Eye className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">$24,567.89</div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    +5.2% this month
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-sm text-gray-600 mb-1">Savings</div>
                    <div className="text-xl font-bold text-gray-900">$18,240</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="text-sm text-gray-600 mb-1">Investment</div>
                    <div className="text-xl font-bold text-gray-900">$6,327</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Banking Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From everyday banking to wealth management, we provide a full suite of financial services designed to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Personal Banking */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Banking</h3>
              <p className="text-gray-700 mb-6">Complete banking solutions for individuals including checking, savings, and personal loans.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Free checking accounts</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />High-yield savings</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Personal loans</li>
              </ul>
            </div>
            
            {/* Business Banking */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Building className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Business Banking</h3>
              <p className="text-gray-700 mb-6">Tailored solutions for businesses of all sizes to manage cash flow and growth.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Business accounts</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Commercial loans</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Merchant services</li>
              </ul>
            </div>
            
            {/* Investment Management */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment Management</h3>
              <p className="text-gray-700 mb-6">Professional investment management and wealth advisory services.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Portfolio management</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Financial planning</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Retirement planning</li>
              </ul>
            </div>
            
            {/* Digital Banking */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Banking</h3>
              <p className="text-gray-700 mb-6">24/7 online and mobile banking with cutting-edge technology.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Mobile app</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Online banking</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Digital payments</li>
              </ul>
            </div>
            
            {/* Credit Solutions */}
            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Credit Solutions</h3>
              <p className="text-gray-700 mb-6">Flexible credit options including cards, lines of credit, and mortgages.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Credit cards</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Home loans</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Lines of credit</li>
              </ul>
            </div>
            
            {/* Insurance */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Insurance</h3>
              <p className="text-gray-700 mb-6">Comprehensive insurance products to protect what matters most.</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Life insurance</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Auto insurance</li>
                <li className="flex items-center"><Check className="w-4 h-4 text-green-600 mr-2" />Home insurance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
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
                <div className="feature-icon w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast Transfers</h3>
                  <p className="text-gray-600">Send and receive money instantly with our advanced payment processing system.</p>
                </div>
              </div>
              
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bank-Grade Security</h3>
                  <p className="text-gray-600">Your money and data are protected with military-grade encryption and fraud monitoring.</p>
                </div>
              </div>
              
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">Get personalized financial advice and spending insights powered by artificial intelligence.</p>
                </div>
              </div>
              
              <div className="feature-card flex items-start space-x-4">
                <div className="feature-icon w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Global Access</h3>
                  <p className="text-gray-600">Access your account from anywhere in the world with no international fees.</p>
                </div>
              </div>
            </div>
            
            {/* Feature Showcase */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
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
                    <span className="font-semibold text-blue-600">24,567 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="security-pattern absolute inset-0 opacity-10"></div>
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
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">256-bit Encryption</h3>
              <p className="text-gray-400 text-sm">Military-grade encryption protects all your data and transactions.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Fingerprint className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Biometric Access</h3>
              <p className="text-gray-400 text-sm">Secure login with fingerprint and facial recognition technology.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">24/7 Monitoring</h3>
              <p className="text-gray-400 text-sm">Round-the-clock fraud detection and prevention systems.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
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
                  <div className="text-2xl font-bold text-blue-400">FDIC</div>
                  <div className="text-xs text-gray-400">Insured</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-green-400">SOC 2</div>
                  <div className="text-xs text-gray-400">Compliant</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-purple-400">PCI DSS</div>
                  <div className="text-xs text-gray-400">Certified</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-700 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-yellow-400">ISO 27001</div>
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
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what real customers have to say about their InvestFlow Bank experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
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
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  JS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Jessica Smith</div>
                  <div className="text-gray-600 text-sm">Small Business Owner</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
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
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Michael Johnson</div>
                  <div className="text-gray-600 text-sm">Software Engineer</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
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
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SD
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Davis</div>
                  <div className="text-gray-600 text-sm">Marketing Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg relative overflow-hidden">
        <div className="security-pattern absolute inset-0 opacity-30"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Banking Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join over 500,000 satisfied customers who trust InvestFlow Bank with their financial future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg">
              Open Your Account Today
            </Link>
            <button className="glass-effect text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors">
              Schedule a Consultation
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-300 mb-1">2 Minutes</div>
              <div className="text-blue-100 text-sm">Account Opening</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-300 mb-1">$0</div>
              <div className="text-blue-100 text-sm">Monthly Fees</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-300 mb-1">24/7</div>
              <div className="text-blue-100 text-sm">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">InvestFlow Bank</span>
              </div>
              <p className="text-gray-400 mb-6">
                Your trusted financial partner, providing innovative banking solutions for a better financial future.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
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
                <li><a href="#" className="hover:text-white transition-colors">Security Center</a></li>
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

      <style jsx>{`
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
    </div>
  );
};

export default Landing;
