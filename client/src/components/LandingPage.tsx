import { useAuthStore } from '../stores/authStore';
import { Search, Gavel, Truck, ArrowRight, Shield, Users, BarChart3, Clock } from 'lucide-react';
import { ContactUsButton } from './common/ContactComponents';

export const LandingPage = () => {
  const { openAuthModal } = useAuthStore();

  const scrollToWhyChoosePlatform = () => {
    const whyChooseSection = document.querySelector('.why-choose-platform');
    if (whyChooseSection) {
      whyChooseSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📋</div>
              <span className="text-xl font-bold text-gray-900">MedTrade</span>
            </div>
            <nav className="flex items-center space-x-3">
              <ContactUsButton variant="outline" size="sm" />
              <button onClick={openAuthModal} className="btn-outline btn-sm cursor-pointer">Sign In</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-8">
              <Shield className="text-primary" size={16} />
              <span className="text-sm font-medium text-gray-700">Trusted by 1000+ healthcare businesses</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional B2B<br />
              <span className="text-primary">Pharmaceutical Trading</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect verified distributors with retailers through our secure platform. 
              Get competitive anonymous bids and ensure fast, reliable delivery for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button onClick={openAuthModal} className="btn-primary btn-lg flex items-center space-x-2">
                <span>Start Trading</span>
                <ArrowRight size={20} />
              </button>
              <button onClick={scrollToWhyChoosePlatform} className="btn-outline btn-lg">
                Learn More
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-sm text-gray-600">Successful Orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24h</div>
                <div className="text-sm text-gray-600">Average Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-gray-600">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="py-20 bg-white why-choose-platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Streamline your pharmaceutical trading with professional-grade tools</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Medicine Search</h3>
              <p className="text-gray-600">Advanced search with autocomplete, fuzzy matching, and real-time inventory updates for instant results.</p>
            </div>
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Gavel className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Anonymous Bidding</h3>
              <p className="text-gray-600">Secure competitive bidding system that protects both buyer and seller identities until deal completion.</p>
            </div>
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reliable Delivery</h3>
              <p className="text-gray-600">Extensive network of verified distributors ensuring fast, secure delivery across all major locations.</p>
            </div>
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Partners</h3>
              <p className="text-gray-600">All distributors and retailers are thoroughly verified with proper licensing and compliance checks.</p>
            </div>
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Analytics</h3>
              <p className="text-gray-600">Comprehensive reporting and analytics to help you make informed business decisions.</p>
            </div>
            <div className="card p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h3>
              <p className="text-gray-600">Round-the-clock customer support to ensure smooth operations and quick issue resolution.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Simple, efficient, and designed for modern healthcare businesses</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="card p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Retailers</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Create Your Profile</h4>
                    <p className="text-gray-600">Register with your pharmacy details, licensing, and service areas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Search & Request</h4>
                    <p className="text-gray-600">Find medicines and create detailed purchase requests with specifications</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Review Bids</h4>
                    <p className="text-gray-600">Receive competitive anonymous bids from verified distributors</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Complete Order</h4>
                    <p className="text-gray-600">Accept the best offer and receive fast, secure delivery</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-primary" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Distributors</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Register & Verify</h4>
                    <p className="text-gray-600">Complete registration with licensing verification and inventory upload</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">View Opportunities</h4>
                    <p className="text-gray-600">Browse anonymous purchase requests in your service areas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Submit Competitive Bids</h4>
                    <p className="text-gray-600">Offer your best prices and terms to win valuable orders</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Fulfill & Deliver</h4>
                    <p className="text-gray-600">Process accepted orders and coordinate efficient delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
              <p className="text-xl text-blue-100 mb-8">Join thousands of healthcare professionals already growing their business with our platform</p>
              <div className="flex flex-col items-center space-y-4">
                <button onClick={openAuthModal} className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-2">
                  <span>Get Started Free</span>
                  <ArrowRight size={20} />
                </button>
                <p className="text-blue-100 text-sm">No setup fees • No monthly charges • Pay only when you trade</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-400">&copy; 2024 MedTrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};