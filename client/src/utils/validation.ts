import { CONSTANTS } from '../config/constants';

// Validation utility functions
export const ValidationUtils = {
  // Phone number validation
  isValidPhone: (phone: string): boolean => {
    const { MIN_LENGTH, MAX_LENGTH, PATTERN } = CONSTANTS.VALIDATION_RULES.PHONE;
    return phone.length >= MIN_LENGTH && 
           phone.length <= MAX_LENGTH && 
           PATTERN.test(phone);
  },

  // Email validation
  isValidEmail: (email: string): boolean => {
    return CONSTANTS.VALIDATION_RULES.EMAIL.PATTERN.test(email);
  },

  // GST number validation
  isValidGST: (gst: string): boolean => {
    return CONSTANTS.VALIDATION_RULES.GST.PATTERN.test(gst);
  },

  // Discount validation
  isValidDiscount: (discount: number): boolean => {
    const { MIN, MAX } = CONSTANTS.VALIDATION_RULES.DISCOUNT;
    return discount >= MIN && discount <= MAX;
  },

  // Price validation
  isValidPrice: (price: number): boolean => {
    const { MIN, MAX } = CONSTANTS.VALIDATION_RULES.PRICE;
    return price >= MIN && price <= MAX;
  },

  // Quantity validation
  isValidQuantity: (quantity: number): boolean => {
    const { MIN, MAX } = CONSTANTS.VALIDATION_RULES.QUANTITY;
    return quantity >= MIN && quantity <= MAX;
  },

  // File type validation
  isValidFileType: (file: File): boolean => {
    const supportedTypes = Object.values(CONSTANTS.MIME_TYPES);
    return supportedTypes.includes(file.type as any);
  },

  // File size validation
  isValidFileSize: (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
    return file.size <= maxSize;
  },

  // Required field validation
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Business name validation
  isValidBusinessName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  // Address validation
  isValidAddress: (address: string): boolean => {
    return address.trim().length >= 10 && address.trim().length <= 500;
  },
};

// Form validation helpers
export const FormValidation = {
  // Validate login form
  validateLoginForm: (data: { phone: string }) => {
    const errors: Record<string, string> = {};
    
    if (!ValidationUtils.isRequired(data.phone)) {
      errors.phone = 'Phone number is required';
    } else if (!ValidationUtils.isValidPhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Validate OTP form
  validateOtpForm: (data: { phone: string; otp: string }) => {
    const errors: Record<string, string> = {};
    
    if (!ValidationUtils.isRequired(data.phone)) {
      errors.phone = 'Phone number is required';
    } else if (!ValidationUtils.isValidPhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!ValidationUtils.isRequired(data.otp)) {
      errors.otp = 'OTP is required';
    } else if (data.otp.length !== 6) {
      errors.otp = 'OTP must be 6 digits';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Validate registration form
  validateRegisterForm: (data: {
    phone: string;
    businessName: string;
    isWholesaler: boolean;
    address: string;
    email?: string;
  }) => {
    const errors: Record<string, string> = {};
    
    if (!ValidationUtils.isRequired(data.phone)) {
      errors.phone = 'Phone number is required';
    } else if (!ValidationUtils.isValidPhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!ValidationUtils.isRequired(data.businessName)) {
      errors.businessName = 'Business name is required';
    } else if (!ValidationUtils.isValidBusinessName(data.businessName)) {
      errors.businessName = 'Business name must be between 2 and 100 characters';
    }
    
    if (typeof data.isWholesaler !== 'boolean') {
      errors.isWholesaler = 'Business type is required';
    }
    
    if (!ValidationUtils.isRequired(data.address)) {
      errors.address = 'Address is required';
    } else if (!ValidationUtils.isValidAddress(data.address)) {
      errors.address = 'Address must be between 10 and 500 characters';
    }
    
    if (data.email && !ValidationUtils.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Validate profile update form
  validateProfileForm: (data: {
    businessName?: string;
    address?: string;
    email?: string;
    gstNumber?: string;
  }) => {
    const errors: Record<string, string> = {};
    
    if (data.businessName && !ValidationUtils.isValidBusinessName(data.businessName)) {
      errors.businessName = 'Business name must be between 2 and 100 characters';
    }
    
    if (data.address && !ValidationUtils.isValidAddress(data.address)) {
      errors.address = 'Address must be between 10 and 500 characters';
    }
    
    if (data.email && !ValidationUtils.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (data.gstNumber && !ValidationUtils.isValidGST(data.gstNumber)) {
      errors.gstNumber = 'Please enter a valid GST number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Validate bid form
  validateBidForm: (data: {
    discountPercent: number;
    mrp?: number;
  }) => {
    const errors: Record<string, string> = {};
    
    if (!ValidationUtils.isValidDiscount(data.discountPercent)) {
      errors.discountPercent = 'Discount must be between 0% and 100%';
    }
    
    if (data.mrp && !ValidationUtils.isValidPrice(data.mrp)) {
      errors.mrp = 'MRP must be between ₹0.01 and ₹10,00,000';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  // Validate bid request form
  validateBidRequestForm: (data: {
    productId: number;
    quantity: number;
  }) => {
    const errors: Record<string, string> = {};
    
    if (!data.productId) {
      errors.productId = 'Product is required';
    }
    
    if (!ValidationUtils.isValidQuantity(data.quantity)) {
      errors.quantity = 'Quantity must be between 1 and 10,000';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
