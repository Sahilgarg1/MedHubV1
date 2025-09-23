// =============================================================================
// TradeMed Client - App Router
// =============================================================================

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../config/routes.config';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Loading Spinner Component
const LoadingSpinner = ({ size = 'medium' }: { size?: string }) => (
  <div className={`loading-spinner ${size}`}></div>
);

// Lazy load components for code splitting
const LandingPage = React.lazy(() => import('../components/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthModal = React.lazy(() => import('../components/AuthModal').then(m => ({ default: m.AuthModal })));

// App Layout Components
const AppLayout = React.lazy(() => import('../components/layout/AppLayout').then(m => ({ default: m.AppLayout })));

// Bid Management Components
const LiveBidsView = React.lazy(() => import('../components/views/RetailerBidsView').then(m => ({ default: m.LiveBidsView })));
const MyBidsView = React.lazy(() => import('../components/views/WholesalerBidsView').then(m => ({ default: m.WholesalerBidsView })));

// Order Management Components
const OrdersView = React.lazy(() => import('../components/views/OrdersView').then(m => ({ default: m.OrdersView })));

// Inventory Components
const InventoryView = React.lazy(() => import('../components/views/InventoryView').then(m => ({ default: m.InventoryView })));

// Profile Components
const ProfileView = React.lazy(() => import('../components/views/ProfileView').then(m => ({ default: m.ProfileView })));

// Support Components
const ContactUsView = React.lazy(() => import('../components/common/ContactComponents').then(m => ({ default: m.ContactUsView })));

// Common Views (Combined) - Import directly since they're simple components
import {
  BidRequestView,
  CreateBidView,
  OrderDetailView,
  CreateOrderView,
  InventoryDetailView,
  InventoryUploadView,
  ProductsView,
  ProductDetailView,
  ProfileEditView,
  ProfileSettingsView,
  SupportTicketsView,
  CartView,
  NotFoundView,
  UnauthorizedView,
  ForbiddenView,
  ServerErrorView
} from '../components/views/CommonViews';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireWholesaler?: boolean; // true = requires wholesaler, false = requires retailer, undefined = any role
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireWholesaler 
}) => {
  const { user } = useAuthStore();

  if (requireAuth && !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (typeof requireWholesaler === 'boolean' && user?.isWholesaler !== requireWholesaler) {
    return <Navigate to={ROUTES.ERROR.FORBIDDEN} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to app if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  
  if (user) {
    return <Navigate to={ROUTES.BIDS.LIVE} replace />;
  }
  
  return <>{children}</>;
};

// Main App Router Component
export const AppRouter: React.FC = () => {
  const { isAuthModalOpen } = useAuthStore();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route 
              path={ROUTES.HOME} 
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner size="large" />}>
                    <LandingPage />
                  </Suspense>
                </PublicRoute>
              } 
            />
            
            <Route 
              path={ROUTES.LOGIN} 
              element={
                <PublicRoute>
                  <Suspense fallback={<LoadingSpinner size="medium" />}>
                    <AuthModal />
                  </Suspense>
                </PublicRoute>
              } 
            />

            {/* App Routes - Protected */}
            <Route 
              path={ROUTES.APP} 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingSpinner size="large" />}>
                    <AppLayout />
                  </Suspense>
                </ProtectedRoute>
              }
            >
              {/* Default redirect to Live Bids */}
              <Route index element={<Navigate to={ROUTES.BIDS.LIVE} replace />} />

              {/* Bid Management Routes */}
              <Route path="bids">
                <Route index element={<Navigate to="live" replace />} />
                <Route 
                  path="live" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <LiveBidsView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="my-bids" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <MyBidsView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="create" 
                  element={<CreateBidView />}
                />
                <Route 
                  path=":id" 
                  element={<BidRequestView />}
                />
              </Route>

              {/* Bid Requests Routes */}
              <Route path="bid-requests">
                <Route index element={<Navigate to="list" replace />} />
                <Route 
                  path="list" 
                  element={<BidRequestView />}
                />
                <Route 
                  path="my-requests" 
                  element={<BidRequestView />}
                />
                <Route 
                  path=":id" 
                  element={<BidRequestView />}
                />
              </Route>

              {/* Orders Routes */}
              <Route path="orders">
                <Route index element={<Navigate to="list" replace />} />
                <Route 
                  path="list" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <OrdersView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="my-orders" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <OrdersView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="create" 
                  element={<CreateOrderView />}
                />
                <Route 
                  path=":id" 
                  element={<OrderDetailView />}
                />
                <Route 
                  path=":id/tracking" 
                  element={<OrderDetailView />}
                />
              </Route>

              {/* Inventory Routes */}
              <Route path="inventory">
                <Route index element={<Navigate to="list" replace />} />
                <Route 
                  path="list" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <InventoryView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="upload" 
                  element={<InventoryUploadView />}
                />
                <Route 
                  path=":id" 
                  element={<InventoryDetailView />}
                />
              </Route>

              {/* Products Routes */}
              <Route path="products">
                <Route index element={<Navigate to="list" replace />} />
                <Route 
                  path="list" 
                  element={<ProductsView />}
                />
                <Route 
                  path="search" 
                  element={<ProductsView />}
                />
                <Route 
                  path=":id" 
                  element={<ProductDetailView />}
                />
              </Route>

              {/* Profile Routes */}
              <Route path="profile">
                <Route index element={<Navigate to="view" replace />} />
                <Route 
                  path="view" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <ProfileView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="edit" 
                  element={<ProfileEditView />}
                />
                <Route 
                  path="settings" 
                  element={<ProfileSettingsView />}
                />
              </Route>


              {/* Support Routes */}
              <Route path="support">
                <Route index element={<Navigate to="contact" replace />} />
                <Route 
                  path="contact" 
                  element={
                    <Suspense fallback={<LoadingSpinner size="large" />}>
                      <ContactUsView />
                    </Suspense>
                  } 
                />
                <Route 
                  path="tickets" 
                  element={<SupportTicketsView />}
                />
              </Route>

              {/* Cart Routes */}
              <Route path="cart">
                <Route index element={<Navigate to="view" replace />} />
                <Route 
                  path="view" 
                  element={<CartView />}
                />
              </Route>
            </Route>

            {/* Error Routes */}
            <Route path={ROUTES.ERROR.NOT_FOUND} element={<NotFoundView />} />
            <Route path={ROUTES.ERROR.UNAUTHORIZED} element={<UnauthorizedView />} />
            <Route path={ROUTES.ERROR.FORBIDDEN} element={<ForbiddenView />} />
            <Route path={ROUTES.ERROR.SERVER_ERROR} element={<ServerErrorView />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to={ROUTES.ERROR.NOT_FOUND} replace />} />
          </Routes>

          {/* Global Auth Modal */}
          {isAuthModalOpen && (
            <Suspense fallback={<LoadingSpinner size="medium" />}>
              <AuthModal />
            </Suspense>
          )}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
