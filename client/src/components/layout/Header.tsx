import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes.config';
import { User, Activity, Package, Warehouse, LogOut, Phone, Menu, ArrowLeft } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate(ROUTES.HOME);
  };


  const mobileMenuTabs = [
    {
      id: 'bids',
      label: 'Live Bids',
      path: ROUTES.BIDS.LIVE,
      icon: Activity,
      description: !user?.isWholesaler ? 'View and manage your bid requests' : 'Browse and respond to bid requests'
    },
    {
      id: 'orders',
      label: 'Orders',
      path: ROUTES.ORDERS.LIST,
      icon: Package,
      description: 'Track your order history and status'
    },
    ...(user?.isWholesaler ? [{
      id: 'inventory',
      label: 'Inventory',
      path: ROUTES.INVENTORY.LIST,
      icon: Warehouse,
      description: 'Manage and upload your product inventory'
    }] : []),
    {
      id: 'contact',
      label: 'Contact Us',
      path: ROUTES.SUPPORT.CONTACT,
      icon: Phone,
      description: 'Get help and support from our team'
    },
    {
      id: 'profile',
      label: user?.businessName || 'Business Profile',
      path: ROUTES.PROFILE.VIEW,
      icon: User,
      description: 'Manage your business information'
    }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          <div className="flex items-center">
            {/* Mobile Menu Button - only visible when sidebar is hidden */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-3 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📋</div>
              <span className="text-xl font-bold text-gray-900">{"MedTrade"}</span>
            </div>
          </div>

          {/* Actions - Visible on all screen sizes */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Product Count - Show on inventory tab */}
            {/* {activeTab === 'inventory' && user?.isWholesaler && stats?.activeProducts !== undefined && (
              <button
                onClick={() => setIsInventoryMenuOpen(true)}
                className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {stats.activeProducts} Products
              </button>
            )} */}
            
            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Menu Overlay - Transparent backdrop with blur */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${isMobileMenuOpen ? 'bg-gray-900/20 backdrop-blur-sm' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={`fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl border-r border-white/20 overflow-y-auto transform transition-all duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
            <nav className="h-full flex flex-col">
              {/* Header Section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">📋</div>
                    <span className="text-xl font-bold text-gray-900">{"MedTrade"}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Close menu"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
              </div>
              
              {/* Menu Options - Top Aligned */}
              <div className="flex-1 flex items-start justify-center">
                <div className="w-full px-6 pt-6">
                  <div className="space-y-2 -mt-2">
                    {mobileMenuTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            navigate(tab.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                            location.pathname === tab.path || location.pathname.startsWith(tab.path + '/')
                              ? 'bg-primary text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon size={18} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{tab.label}</div>
                            <div className={`text-xs mt-1 ${
                              location.pathname === tab.path || location.pathname.startsWith(tab.path + '/') ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {tab.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Logout Section */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={18} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Logout</div>
                    <div className="text-xs text-red-500 mt-1">Sign out of your account</div>
                  </div>
                </button>
              </div>
            </nav>
          </div>
        </div>
    </header>
  );
};
