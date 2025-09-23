// =============================================================================
// TradeMed Client - Sidebar Component
// =============================================================================

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROUTES } from '../../config/routes.config';
import { Activity, Package, User, Warehouse, Phone } from 'lucide-react';

interface TabConfig {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  description: string;
}

export const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs: TabConfig[] = [
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
      label: !user?.isWholesaler ? `${user?.businessName} (Retail)` : `${user?.businessName} (Wholesale)`,
      path: ROUTES.PROFILE.VIEW,
      icon: User, 
      description: 'Manage your Business Profile'
    },
  ];

  const isActiveTab = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-200">
      <nav className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dashboard</h2>
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={`w-full flex items-start space-x-3 px-3 py-3 rounded-lg text-left transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} className="mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm">{tab.label}</div>
                  <div className={`text-xs mt-1 ${
                    isActive ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};