import { lazy, Suspense } from 'react';
// LoadingSpinner component inline
const LoadingSpinner = ({ size = 'medium' }: { size?: string }) => (
  <div className={`loading-spinner ${size}`}></div>
);

// Lazy load views for code splitting
const LiveBidsView = lazy(() => import('./views/RetailerBidsView').then(m => ({ default: m.LiveBidsView })));
const OrdersView = lazy(() => import('./views/OrdersView').then(m => ({ default: m.OrdersView })));
const ProfileView = lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));
const InventoryView = lazy(() => import('./views/InventoryView').then(m => ({ default: m.InventoryView })));
const ContactUsView = lazy(() => import('./views/ContactUsView').then(m => ({ default: m.ContactUsView })));

type Tab = 'home' | 'orders' | 'inventory' | 'contact' | 'profile';

interface TabViewProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const TabView = ({ activeTab }: TabViewProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <LiveBidsView />
          </Suspense>
        );
      case 'orders':
        return (
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <OrdersView />
          </Suspense>
        );
      case 'inventory':
        return (
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <InventoryView />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <ContactUsView />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <ProfileView />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <LiveBidsView />
          </Suspense>
        );
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-hidden max-w-full">
      {renderContent()}
    </div>
  );
};