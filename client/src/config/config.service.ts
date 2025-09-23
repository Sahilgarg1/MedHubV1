/**
 * Centralized Configuration Service
 * 
 * This service provides easy access to all frontend configurations
 * with proper typing and validation. All components should use this
 * service instead of directly accessing environment variables.
 * 
 * @author TradeMed Team
 * @version 1.0.0
 */

import { config } from './app.config';

/**
 * Configuration Service Class
 * 
 * Provides typed access to all configuration sections
 */
export class ConfigService {
  // ============================================================================
  // APPLICATION CONFIGURATION
  // ============================================================================

  /**
   * Get application configuration
   * 
   * Used by: main.tsx, App.tsx, all components
   * @see app.config.ts - appConfig
   */
  get app() {
    return config.app;
  }

  /**
   * Check if running in production
   * 
   * Used by: All components for environment-specific behavior
   */
  get isProduction(): boolean {
    return config.app.isProduction;
  }

  /**
   * Check if running in development
   * 
   * Used by: All components for development features
   */
  get isDevelopment(): boolean {
    return config.app.isDevelopment;
  }

  /**
   * Check if running in test environment
   * 
   * Used by: Test suites and testing utilities
   */
  get isTest(): boolean {
    return config.app.isTest;
  }

  // ============================================================================
  // API CONFIGURATION
  // ============================================================================

  /**
   * Get API configuration
   * 
   * Used by: axios instance, all API calls
   * @see app.config.ts - apiConfig
   */
  get api() {
    return config.api;
  }

  // ============================================================================
  // UI CONFIGURATION
  // ============================================================================

  /**
   * Get UI configuration
   * 
   * Used by: All components, theme providers
   * @see app.config.ts - uiConfig
   */
  get ui() {
    return config.ui;
  }

  // ============================================================================
  // BUSINESS LOGIC CONFIGURATION
  // ============================================================================

  /**
   * Get business logic configuration
   * 
   * Used by: All business logic components
   * @see app.config.ts - businessConfig
   */
  get business() {
    return config.business;
  }

  // ============================================================================
  // FEATURE FLAGS CONFIGURATION
  // ============================================================================

  /**
   * Get feature flags configuration
   * 
   * Used by: All components for feature gating
   * @see app.config.ts - featuresConfig
   */
  get features() {
    return config.features;
  }

  // ============================================================================
  // AUTHENTICATION CONFIGURATION
  // ============================================================================

  /**
   * Get authentication configuration
   * 
   * Used by: Authentication components, auth hooks
   * @see app.config.ts - authConfig
   */
  get auth() {
    return config.auth;
  }

  // ============================================================================
  // DEVELOPMENT CONFIGURATION
  // ============================================================================

  /**
   * Get development configuration
   * 
   * Used by: Development tools, debugging
   * @see app.config.ts - developmentConfig
   */
  get development() {
    return config.development;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get a configuration value by key path
   * 
   * Used by: Components that need dynamic configuration access
   * @param key - Configuration key path (e.g., 'ui.theme.primary')
   * @returns Configuration value
   */
  getValue<T = any>(key: string): T | undefined {
    const keys = key.split('.');
    let value: any = config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value as T;
  }

  /**
   * Get a configuration value with default
   * 
   * Used by: Components that need fallback values
   * @param key - Configuration key path
   * @param defaultValue - Default value if key not found
   * @returns Configuration value or default
   */
  getValueOrDefault<T = any>(key: string, defaultValue: T): T {
    const value = this.getValue<T>(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Check if a feature is enabled
   * 
   * Used by: Components for feature gating
   * @param feature - Feature name
   * @returns Whether the feature is enabled
   */
  isFeatureEnabled(feature: keyof typeof config.features): boolean {
    return config.features[feature];
  }

  /**
   * Get all configuration as a flat object
   * 
   * Used by: Configuration debugging, health checks
   * @returns Flat object with all configuration values
   */
  getAllConfig(): Record<string, any> {
    return {
      app: config.app,
      api: config.api,
      ui: config.ui,
      business: config.business,
      features: config.features,
      auth: config.auth,
      development: config.development,
    };
  }

  /**
   * Validate required configuration
   * 
   * Used by: Application startup validation
   * @param requiredKeys - Array of required configuration keys
   * @throws Error if any required keys are missing
   */
  validateRequired(requiredKeys: string[]): void {
    const missing: string[] = [];
    
    for (const key of requiredKeys) {
      const value = this.getValue(key);
      if (value === undefined || value === null || value === '') {
        missing.push(key);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
  }
}

/**
 * Create and export a singleton instance
 */
export const configService = new ConfigService();

/**
 * Export the configuration object directly for convenience
 */
export { config };

/**
 * Export types
 */
export type {
  AppConfig,
  ApiConfig,
  UiConfig,
  BusinessConfig,
  FeaturesConfig,
  AuthConfig,
  DevelopmentConfig,
  Config,
} from './app.config';
