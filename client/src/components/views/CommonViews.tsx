// =============================================================================
// TradeMed Client - Common Views (Consolidated)
// =============================================================================

import React from 'react';
import { ComingSoonView, DetailView, ErrorView } from '../common/PlaceholderView';

// Simple placeholder components using consolidated PlaceholderView
export const BidRequestView: React.FC = () => (
  <ComingSoonView title="Bid Requests" message="Bid request management coming soon..." />
);

export const CreateBidView: React.FC = () => (
  <ComingSoonView title="Create Bid" message="Create bid form coming soon..." />
);

export const CreateOrderView: React.FC = () => (
  <ComingSoonView title="Create Order" message="Create order form coming soon..." />
);

export const InventoryUploadView: React.FC = () => (
  <ComingSoonView title="Upload Inventory" message="Inventory upload form coming soon..." />
);

export const ProductsView: React.FC = () => (
  <ComingSoonView title="Products" message="Product catalog coming soon..." />
);

export const ProfileEditView: React.FC = () => (
  <ComingSoonView title="Edit Profile" message="Profile edit form coming soon..." />
);

export const ProfileSettingsView: React.FC = () => (
  <ComingSoonView title="Profile Settings" message="Profile settings coming soon..." />
);

export const SupportTicketsView: React.FC = () => (
  <ComingSoonView title="Support Tickets" message="Support tickets management coming soon..." />
);

export const CartView: React.FC = () => (
  <ComingSoonView title="Shopping Cart" message="Shopping cart coming soon..." />
);

// Detail views using consolidated DetailView
export const OrderDetailView: React.FC = () => (
  <DetailView title="Order Details" id="" />
);

export const InventoryDetailView: React.FC = () => (
  <DetailView title="Inventory Details" id="" />
);

export const ProductDetailView: React.FC = () => (
  <DetailView title="Product Details" id="" />
);

// Error views using consolidated ErrorView
export const NotFoundView: React.FC = () => (
  <ErrorView
    code="404"
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    showHomeButton
  />
);

export const UnauthorizedView: React.FC = () => (
  <ErrorView
    code="401"
    title="Unauthorized Access"
    message="You need to be logged in to access this page."
    showHomeButton
  />
);

export const ForbiddenView: React.FC = () => (
  <ErrorView
    code="403"
    title="Access Forbidden"
    message="You don't have permission to access this resource."
    showHomeButton
  />
);

export const ServerErrorView: React.FC = () => (
  <ErrorView
    code="500"
    title="Server Error"
    message="Something went wrong on our end. Please try again later."
    showHomeButton
    showReloadButton
  />
);
