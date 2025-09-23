import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ErrorHandler } from '../exceptions/custom.exceptions';

// User context interface
export interface UserContext {
  id: string;
  isWholesaler: boolean;
  businessName?: string;
  phone?: string;
  email?: string;
}

// Authorization result interface
export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
}

@Injectable()
export class AuthService {
  constructor(private database: DatabaseService) {}

  // Extract user context from headers
  extractUserContext(headers: Record<string, string>): UserContext {
    const userId = headers['x-user-id'];
    const isWholesaler = headers['x-user-is-wholesaler'] === 'true';

    if (!userId) {
      ErrorHandler.handleUnauthorized('Missing user context in headers');
    }

    return {
      id: userId,
      isWholesaler: isWholesaler,
    };
  }

  // Validate user exists and is active
  async validateUser(userId: string): Promise<UserContext> {
    const user = await this.database.findById('user', userId);
    
    if (!user) {
      ErrorHandler.handleNotFound('User', userId);
    }

    return {
      id: (user as any).id,
      isWholesaler: (user as any).isWholesaler,
      businessName: (user as any).businessName,
      phone: (user as any).phone,
      email: (user as any).email,
    };
  }

  // Check if user is wholesaler
  isWholesaler(userContext: UserContext): boolean {
    return userContext.isWholesaler;
  }

  // Check if user is retailer
  isRetailer(userContext: UserContext): boolean {
    return !userContext.isWholesaler;
  }

  // Check if user can access resource (owns it)
  canAccessResource(userContext: UserContext, resourceOwnerId: string): boolean {
    return userContext.id === resourceOwnerId;
  }

  // Check if user can perform action on resource
  canPerformAction(
    userContext: UserContext,
    action: string,
    resource: string,
    resourceOwnerId?: string
  ): AuthorizationResult {
    // Wholesaler can do admin actions
    if (userContext.isWholesaler && action === 'admin') {
      return { authorized: true };
    }

    // User can access their own resources
    if (resourceOwnerId && this.canAccessResource(userContext, resourceOwnerId)) {
      return { authorized: true };
    }

    // Role-based permissions
    switch (action) {
      case 'create_bid_request':
        return {
          authorized: !userContext.isWholesaler, // Retailers
          reason: userContext.isWholesaler ? 'Only retailers can create bid requests' : undefined,
        };

      case 'create_bid':
        return {
          authorized: userContext.isWholesaler,
          reason: !userContext.isWholesaler ? 'Only wholesalers can create bids' : undefined,
        };

      case 'view_inventory':
        return {
          authorized: userContext.isWholesaler,
          reason: !userContext.isWholesaler ? 'Only wholesalers can view inventory' : undefined,
        };

      case 'upload_inventory':
        return {
          authorized: userContext.isWholesaler,
          reason: !userContext.isWholesaler ? 'Only wholesalers can upload inventory' : undefined,
        };

      case 'view_orders':
        return { authorized: true }; // Both roles can view orders

      case 'create_order':
        return {
          authorized: !userContext.isWholesaler, // Retailers
          reason: userContext.isWholesaler ? 'Only retailers can create orders' : undefined,
        };

      default:
        return {
          authorized: false,
          reason: `Unknown action: ${action}`,
        };
    }
  }

  // Require wholesaler role
  requireWholesaler(userContext: UserContext): void {
    if (!this.isWholesaler(userContext)) {
      ErrorHandler.handleInsufficientPermissions(
        'perform wholesaler action',
        'resource'
      );
    }
  }

  // Require retailer role
  requireRetailer(userContext: UserContext): void {
    if (!this.isRetailer(userContext)) {
      ErrorHandler.handleInsufficientPermissions(
        'perform retailer action',
        'resource'
      );
    }
  }

  // Require resource ownership
  requireResourceOwnership(userContext: UserContext, resourceOwnerId: string): void {
    if (!this.canAccessResource(userContext, resourceOwnerId)) {
      ErrorHandler.handleInsufficientPermissions('access', 'this resource');
    }
  }

  // Require action permission
  requireActionPermission(
    userContext: UserContext,
    action: string,
    resource: string,
    resourceOwnerId?: string
  ): void {
    const result = this.canPerformAction(userContext, action, resource, resourceOwnerId);
    if (!result.authorized) {
      ErrorHandler.handleInsufficientPermissions(action, resource);
    }
  }

  // Get user's business context
  async getUserBusinessContext(userId: string): Promise<{
    businessName: string;
    isWholesaler: boolean;
    isRetailer: boolean;
  }> {
    const user = await this.validateUser(userId);
    
    return {
      businessName: user.businessName || 'Unknown Business',
      isWholesaler: user.isWholesaler,
      isRetailer: !user.isWholesaler,
    };
  }

  // Check if user can modify resource
  canModifyResource(
    userContext: UserContext,
    resource: any,
    resourceType: 'bid' | 'bidRequest' | 'order' | 'product'
  ): boolean {
    switch (resourceType) {
      case 'bid':
        return resource.wholesalerId === userContext.id;
      case 'bidRequest':
        return resource.retailerId === userContext.id;
      case 'order':
        return resource.retailerId === userContext.id;
      case 'product':
        return userContext.isWholesaler;
      default:
        return false;
    }
  }

  // Require resource modification permission
  requireModifyPermission(
    userContext: UserContext,
    resource: any,
    resourceType: 'bid' | 'bidRequest' | 'order' | 'product'
  ): void {
    if (!this.canModifyResource(userContext, resource, resourceType)) {
      ErrorHandler.handleInsufficientPermissions('modify', resourceType);
    }
  }
}
