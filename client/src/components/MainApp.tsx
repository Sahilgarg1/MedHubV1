import { lazy, Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
// LoadingSpinner component inline
const LoadingSpinner = ({ size = 'medium' }: { size?: string }) => (
  <div className={`loading-spinner ${size}`}></div>
);

// Lazy load TabView
const TabView = lazy(() => import('./TabView').then(m => ({ default: m.TabView })));

export const MainApp = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'inventory' | 'contact' | 'profile'>('home');

  const handleTabChange = (tab: 'home' | 'orders' | 'inventory' | 'contact' | 'profile') => {
    setActiveTab(tab);
  };

  // Listen for custom tab switch events from child components
  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      const tab = event.detail as 'home' | 'orders' | 'inventory' | 'contact' | 'profile';
      handleTabChange(tab);
    };

    window.addEventListener('switchTab', handleTabSwitch as EventListener);
    
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch as EventListener);
    };
  }, []);



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <main className="flex-1 flex flex-col min-h-0">
          <Suspense fallback={<LoadingSpinner size="large" />}>
            <TabView 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
};