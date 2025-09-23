import { ContactUsView as ContactUsComponent } from '../common/ContactComponents';

export const ContactUsView = () => {
  return (
    <div className="flex-1 min-h-0 overflow-hidden max-w-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
              <p className="text-gray-600 mb-6">
                Have questions about our platform? Need support with your orders? 
                We're here to help you succeed in your medical supply business.
              </p>
            </div>
            
            <ContactUsComponent />
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Hours</h2>
              <div className="space-y-2 text-gray-600">
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Support</h2>
              <div className="space-y-2 text-gray-600">
                <p>For technical issues or platform support, please contact our support team.</p>
                <p>We typically respond within 24 hours during business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
