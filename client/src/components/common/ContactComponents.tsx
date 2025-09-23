import React from 'react';
import { Phone, Mail, Clock, MessageCircle, User } from 'lucide-react';

// Consolidated contact functionality
interface ContactUsButtonProps {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  phone?: string;
  name?: string;
  email?: string;
}

export const ContactUsButton: React.FC<ContactUsButtonProps> = ({ 
  variant = 'outline', 
  size = 'md',
  className = '',
  phone = '+91-9876543210',
  name = 'Support Team',
  email = 'support@medtrade.com'
}) => {
  const handleContactUs = () => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else if (email) {
      const subject = encodeURIComponent('Support Request');
      const body = encodeURIComponent('Hi Support team,\n\n');
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const baseClasses = 'contact-us-btn';
  const variantClasses = {
    primary: 'btn-primary',
    outline: 'btn-outline', 
    ghost: 'btn-ghost'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return (
    <button 
      onClick={handleContactUs}
      className={buttonClasses}
      type="button"
    >
      Contact {name}
    </button>
  );
};

// Contact card component
interface ContactCardProps {
  title: string;
  contact: any;
  icon: string;
  color: 'green' | 'purple' | 'orange' | 'blue' | 'indigo' | 'gray';
  onCall: () => void;
  onEmail: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ title, contact, icon, color, onCall, onEmail }) => {
  const colorClasses = {
    green: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-violet-100 text-violet-600',
    orange: 'bg-amber-100 text-amber-600',
    blue: 'bg-primary-100 text-primary',
    indigo: 'bg-indigo-100 text-indigo-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-hidden">
      <div className="flex items-start gap-4 flex-wrap">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">{title}</h3>
          <p className="text-gray-600 mb-4 break-words">{contact.name}</p>
          <div className="space-y-2">
            <button
              onClick={onCall}
              className="w-full btn-outline flex items-center justify-center gap-2 cursor-pointer text-sm whitespace-normal break-all"
            >
              <Phone size={16} />
              {contact.phone}
            </button>
            {contact.email && (
              <button
                onClick={onEmail}
                className="w-full btn-outline flex items-center justify-center gap-2 cursor-pointer text-sm whitespace-normal break-all"
              >
                <Mail size={16} />
                {contact.email}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main contact view component
export const ContactUsView: React.FC = () => {
  const supportContacts = [
    {
      id: '1',
      department: 'technical',
      name: 'Technical Support Team',
      email: 'tech@medtrade.com',
      phone: '+91-9876543210',
      isPrimary: true,
      isActive: true,
      workingHours: '9:00 AM - 6:00 PM IST',
      timezone: 'Asia/Kolkata'
    },
    {
      id: '2',
      department: 'billing',
      name: 'Billing Support Team',
      email: 'billing@medtrade.com',
      phone: '+91-9876543211',
      isPrimary: false,
      isActive: true,
      workingHours: '9:00 AM - 5:00 PM IST',
      timezone: 'Asia/Kolkata'
    },
    {
      id: '3',
      department: 'general',
      name: 'General Support Team',
      email: 'support@medtrade.com',
      phone: '+91-9876543212',
      isPrimary: false,
      isActive: true,
      workingHours: '24/7',
      timezone: 'Asia/Kolkata'
    }
  ];

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    const subject = encodeURIComponent('Support Request');
    const body = encodeURIComponent('Hi Support team,\n\n');
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
  };

  const activeContacts = supportContacts?.filter((contact: any) => contact.isActive) || [];

  const getContactStyle = (contact: any) => {
    const department = contact.department?.toLowerCase() || '';
    const name = contact.name?.toLowerCase() || '';
    
    if (department.includes('sales') || name.includes('sales')) {
      return { icon: '💼', color: 'green', emoji: '💼' };
    }
    if (department.includes('technical') || department.includes('tech') || name.includes('tech')) {
      return { icon: '🔧', color: 'blue', emoji: '🔧' };
    }
    if (department.includes('billing') || name.includes('billing')) {
      return { icon: '💰', color: 'purple', emoji: '💰' };
    }
    if (department.includes('support') || name.includes('support')) {
      return { icon: '🎧', color: 'orange', emoji: '🎧' };
    }
    if (department.includes('manager') || name.includes('manager')) {
      return { icon: '👔', color: 'indigo', emoji: '👔' };
    }
    if (department.includes('admin') || name.includes('admin')) {
      return { icon: '⚙️', color: 'gray', emoji: '⚙️' };
    }
    return { icon: '👤', color: 'gray', emoji: '👤' };
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Dynamic Contact Cards */}
      {activeContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeContacts.map((contact: any, index: number) => {
            const style = getContactStyle(contact);
            return (
              <ContactCard 
                key={contact.id || index}
                title={contact.department || contact.name}
                contact={contact}
                icon={style.emoji}
                color={style.color as any}
                onCall={() => handleCall(contact.phone)}
                onEmail={() => contact.email && handleEmail(contact.email)}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <User size={20} className="text-amber-600" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">No Active Contacts</h4>
              <p className="text-amber-800 text-sm">
                No support contacts are currently active. Please check back later or contact your administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-hidden">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="bg-violet-100 p-3 rounded-lg">
            <Clock size={24} className="text-violet-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-medium">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="font-medium">Closed</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Support:</span>
                <span className="font-medium text-green-600">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <MessageCircle size={20} className="text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary-900 mb-2">Need Help?</h4>
            <p className="text-primary-800 text-sm">
              Our support team is here to help you with any questions about orders, 
              inventory management, or technical issues. We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
