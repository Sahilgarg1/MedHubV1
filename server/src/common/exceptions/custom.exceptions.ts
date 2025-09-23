import { 
  NotFoundException, 
  BadRequestException, 
  UnauthorizedException, 
  ForbiddenException,
  ConflictException,
  HttpException,
  HttpStatus
} from '@nestjs/common';

// Custom exception classes for better error handling
export class EntityNotFoundException extends NotFoundException {
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} not found`);
  }
}

export class ValidationException extends BadRequestException {
  constructor(message: string, details?: any) {
    super({ message, details });
  }
}

export class BusinessLogicException extends BadRequestException {
  constructor(message: string, code?: string) {
    super({ message, code });
  }
}

export class DuplicateEntityException extends ConflictException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} with ${field} '${value}' already exists`);
  }
}

export class InsufficientPermissionsException extends ForbiddenException {
  constructor(action: string, resource: string) {
    super(`Insufficient permissions to ${action} ${resource}`);
  }
}

// Common error response interface
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path?: string;
}

// Error handling utility functions
export class ErrorHandler {
  static handleNotFound(entity: string, id: string): never {
    throw new EntityNotFoundException(entity, id);
  }

  static handleValidationError(message: string, details?: any): never {
    throw new ValidationException(message, details);
  }

  static handleBusinessLogicError(message: string, code?: string): never {
    throw new BusinessLogicException(message, code);
  }

  static handleDuplicateEntity(entity: string, field: string, value: string): never {
    throw new DuplicateEntityException(entity, field, value);
  }

  static handleInsufficientPermissions(action: string, resource: string): never {
    throw new InsufficientPermissionsException(action, resource);
  }

  static handleUnauthorized(message: string = 'Unauthorized access'): never {
    throw new UnauthorizedException(message);
  }

  // Generic error handler for database operations
  static handleDatabaseError(error: any, operation: string): never {
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      throw new DuplicateEntityException('Entity', field, 'provided value');
    }
    
    if (error.code === 'P2025') {
      // Record not found
      throw new EntityNotFoundException('Record', 'provided ID');
    }

    // Generic database error
    throw new BadRequestException(`Database error during ${operation}: ${error.message}`);
  }
}

// Common validation helpers
export class ValidationHelper {
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateGSTNumber(gst: string): boolean {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  }

  static validateLicenseNumber(license: string): boolean {
    // Basic validation - can be enhanced based on specific requirements
    return license.length >= 5 && license.length <= 20;
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }

  static validateDiscountRange(discount: number): boolean {
    return discount >= 0 && discount <= 100;
  }

  static validatePriceRange(price: number): boolean {
    return price > 0 && price <= 1000000; // Max 1 million
  }
}

// Response wrapper for consistent API responses
export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ErrorResponse;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  constructor(
    success: boolean,
    data?: T,
    message?: string,
    error?: ErrorResponse,
    meta?: any
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.meta = meta;
  }

  static success<T>(data: T, message?: string, meta?: any): ApiResponse<T> {
    return new ApiResponse(true, data, message, undefined, meta);
  }

  static error(error: ErrorResponse, message?: string): ApiResponse {
    return new ApiResponse(false, undefined, message, error);
  }
}
