// =============================================================================
// TradeMed Client - App Layout
// =============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-full overflow-x-hidden">
      <Header />
      
      <div className="flex flex-1 min-h-0 max-w-full">
        <Sidebar />
        
        <main className="flex-1 flex flex-col min-h-0 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};