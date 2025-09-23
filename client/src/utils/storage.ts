import { CONSTANTS } from '../config/constants';
import type { User } from '../types';

type StorageKey = typeof CONSTANTS.STORAGE_KEYS[keyof typeof CONSTANTS.STORAGE_KEYS];

// Storage utility functions
export const StorageUtils = {
  // Generic storage operations
  setItem: <T>(key: StorageKey, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
    }
  },

  getItem: <T>(key: StorageKey): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },

  removeItem: (key: StorageKey): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Specific storage operations
  setAuthToken: (token: string): void => {
    StorageUtils.setItem(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getAuthToken: (): string | null => {
    return StorageUtils.getItem<string>(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
  },

  removeAuthToken: (): void => {
    StorageUtils.removeItem(CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
  },

  setUserData: (user: User): void => {
    StorageUtils.setItem(CONSTANTS.STORAGE_KEYS.USER_DATA, user);
  },

  getUserData: (): User | null => {
    return StorageUtils.getItem<User>(CONSTANTS.STORAGE_KEYS.USER_DATA);
  },

  removeUserData: (): void => {
    StorageUtils.removeItem(CONSTANTS.STORAGE_KEYS.USER_DATA);
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    StorageUtils.setItem(CONSTANTS.STORAGE_KEYS.THEME, theme);
  },

  getTheme: (): 'light' | 'dark' | null => {
    return StorageUtils.getItem<'light' | 'dark'>(CONSTANTS.STORAGE_KEYS.THEME);
  },

  setLanguage: (language: string): void => {
    StorageUtils.setItem(CONSTANTS.STORAGE_KEYS.LANGUAGE, language);
  },

  getLanguage: (): string | null => {
    return StorageUtils.getItem<string>(CONSTANTS.STORAGE_KEYS.LANGUAGE);
  },

  setCart: (cart: any[]): void => {
    StorageUtils.setItem(CONSTANTS.STORAGE_KEYS.CART, cart);
  },

  getCart: (): any[] | null => {
    return StorageUtils.getItem<any[]>(CONSTANTS.STORAGE_KEYS.CART);
  },

  removeCart: (): void => {
    StorageUtils.removeItem(CONSTANTS.STORAGE_KEYS.CART);
  },

  // Session storage operations
  setSessionItem: <T>(key: string, value: T): void => {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error storing session ${key}:`, error);
    }
  },

  getSessionItem: <T>(key: string): T | null => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error retrieving session ${key}:`, error);
      return null;
    }
  },

  removeSessionItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing session ${key}:`, error);
    }
  },

  clearSession: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  },

  // Storage validation
  isStorageAvailable: (): boolean => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Storage size calculation
  getStorageSize: (): number => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Cleanup old data
  cleanupOldData: (maxAge: number = 30 * 24 * 60 * 60 * 1000): void => {
    // Clean up data older than maxAge (default 30 days)
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('temp_')) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const data = JSON.parse(item);
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // If parsing fails, remove the item
            keysToRemove.push(key);
          }
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },
};
