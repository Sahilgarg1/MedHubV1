-- Migration: Add Enhanced Dynamic Constants and Location Features
-- This migration adds support for dynamic constants, support contacts, and location-aware addresses

-- 1. Support Contact Information Table
CREATE TABLE support_contacts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  department VARCHAR(100), -- 'sales', 'support', 'technical', 'billing'
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Business Configuration Table
CREATE TABLE business_config (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(100) NOT NULL, -- 'pricing', 'discounts', 'limits', 'support', 'ui'
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key)
);

-- 3. Pickup Points Table
CREATE TABLE pickup_points (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  coordinates JSONB, -- {lat, lng} for pickup points
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Validation Rules Table
CREATE TABLE validation_rules (
  id VARCHAR(50) PRIMARY KEY,
  field_type VARCHAR(50) NOT NULL, -- 'phone', 'email', 'gst', 'price', 'quantity'
  rule_name VARCHAR(100) NOT NULL,
  rule_value JSONB NOT NULL, -- Pattern, min/max values
  error_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. System Messages Table
CREATE TABLE system_messages (
  id VARCHAR(50) PRIMARY KEY,
  message_type VARCHAR(50) NOT NULL, -- 'error', 'success', 'warning', 'info'
  message_key VARCHAR(100) NOT NULL,
  message_text TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_type, message_key, language)
);

-- 6. Enhanced User table with location-aware address
ALTER TABLE "User" ADD COLUMN address_coordinates JSONB; -- {lat, lng, accuracy, updated_at}
ALTER TABLE "User" ADD COLUMN location_permission_granted BOOLEAN DEFAULT false;

-- Insert default support contacts
INSERT INTO support_contacts (id, name, phone, email, department, is_primary) VALUES
('support-primary', 'Customer Support', '+919284009691', 'support@medtrade.com', 'support', true),
('sales-primary', 'Sales Team', '+919284009692', 'sales@medtrade.com', 'sales', true),
('technical-primary', 'Technical Support', '+919284009693', 'tech@medtrade.com', 'technical', true),
('billing-primary', 'Billing Support', '+919284009694', 'billing@medtrade.com', 'billing', true);

-- Insert default business configuration
INSERT INTO business_config (id, category, key, value, description) VALUES
('discount-buffer', 'pricing', 'retailer_discount_buffer', '5', 'Percentage buffer for retailer discounts'),
('max-discount', 'validation', 'max_discount_percent', '100', 'Maximum discount percentage allowed'),
('min-price', 'validation', 'min_price', '0.01', 'Minimum price allowed'),
('max-price', 'validation', 'max_price', '1000000', 'Maximum price allowed'),
('min-quantity', 'validation', 'min_quantity', '1', 'Minimum quantity allowed'),
('max-quantity', 'validation', 'max_quantity', '10000', 'Maximum quantity allowed'),
('location-timeout', 'ui', 'location_request_timeout', '10000', 'Location request timeout in milliseconds'),
('location-accuracy', 'ui', 'location_accuracy_threshold', '100', 'Minimum location accuracy in meters'),
('cart-max-items', 'ui', 'cart_max_items', '50', 'Maximum items allowed in cart'),
('search-timeout', 'ui', 'search_timeout', '5000', 'Search request timeout in milliseconds');

-- Insert default pickup points
INSERT INTO pickup_points (id, name, address, description, coordinates) VALUES
('mumbai-central', 'Mumbai Central Station', 'Mumbai Central Railway Station, Mumbai, Maharashtra 400001', 'Main railway station pickup point', '{"lat": 19.0176, "lng": 72.8562}'),
('delhi-airport', 'Delhi Airport', 'Indira Gandhi International Airport, New Delhi, Delhi 110037', 'Airport pickup point', '{"lat": 28.5562, "lng": 77.1000}'),
('bangalore-central', 'Bangalore Central', 'Bangalore City Railway Station, Bangalore, Karnataka 560023', 'Central railway station pickup', '{"lat": 12.9767, "lng": 77.5753}'),
('chennai-port', 'Chennai Port', 'Chennai Port Trust, Chennai, Tamil Nadu 600001', 'Port area pickup point', '{"lat": 13.0827, "lng": 80.2707}'),
('kolkata-station', 'Kolkata Station', 'Howrah Railway Station, Kolkata, West Bengal 711101', 'Main railway station pickup', '{"lat": 22.5851, "lng": 88.3468}');

-- Insert default validation rules
INSERT INTO validation_rules (id, field_type, rule_name, rule_value, error_message) VALUES
('phone-pattern', 'phone', 'pattern', '{"pattern": "^[6-9]\\d{9}$"}', 'Please enter a valid 10-digit mobile number'),
('email-pattern', 'email', 'pattern', '{"pattern": "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"}', 'Please enter a valid email address'),
('gst-pattern', 'gst', 'pattern', '{"pattern": "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"}', 'Please enter a valid GST number'),
('price-min', 'price', 'min_value', '{"value": 0.01}', 'Price must be greater than 0'),
('price-max', 'price', 'max_value', '{"value": 1000000}', 'Price cannot exceed ₹10,00,000'),
('quantity-min', 'quantity', 'min_value', '{"value": 1}', 'Quantity must be at least 1'),
('quantity-max', 'quantity', 'max_value', '{"value": 10000}', 'Quantity cannot exceed 10,000');

-- Insert default system messages
INSERT INTO system_messages (id, message_type, message_key, message_text, language) VALUES
('error-generic', 'error', 'generic', 'Something went wrong. Please try again.', 'en'),
('error-network', 'error', 'network', 'Network error. Please check your connection.', 'en'),
('error-validation', 'error', 'validation', 'Please check your input and try again.', 'en'),
('success-save', 'success', 'save', 'Data saved successfully!', 'en'),
('success-update', 'success', 'update', 'Updated successfully!', 'en'),
('success-delete', 'success', 'delete', 'Deleted successfully!', 'en'),
('warning-location', 'warning', 'location_permission', 'Location access is optional but helps us provide better service.', 'en'),
('info-loading', 'info', 'loading', 'Loading...', 'en'),
('info-no-data', 'info', 'no_data', 'No data available.', 'en');
