import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Address interface for delivery addresses
interface Address {
  contactPerson: string; // Contact person name
  contactNumber: string; // Contact number for this address
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// This is the full User type, matching our Prisma schema
// and the data returned by the backend API.
interface User {
  id: string;
  phone: string;
  businessName: string;
  isWholesaler: boolean;
  address: string; // Business address (kept separate)
  addresses: Address[]; // Delivery addresses
  defaultAddressIndex: number; // Index of default address
  pickupPoint: string | null; // Can be null
  email: string | null; // Can be null
  contactNumber: string | null; // Can be null
  licenseNumber: string | null; // Can be null
  gstNumber: string | null; // Can be null
}

interface AuthState {
  user: User | null;
  isAuthModalOpen: boolean; // Is the modal currently visible?
  setUser: (user: User) => void;
  logout: () => void;
  openAuthModal: () => void; // Function to open the modal
  closeAuthModal: () => void; // Function to close the modal
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthModalOpen: false, // Initially, the modal is closed
      setUser: (user) => {
        try {
          // Validate user data before setting
          if (!user || !user.id || !user.phone || !user.businessName || typeof user.isWholesaler !== 'boolean') {
            console.error('Invalid user data provided to setUser:', user);
            return;
          }
          set({ user, isAuthModalOpen: false }); // Also close modal on login
        } catch (error) {
          console.error('Error setting user in auth store:', error);
        }
      },
      logout: () => {
        try {
          set({ user: null });
        } catch (error) {
          console.error('Error during logout:', error);
        }
      },
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
    }),
    {
      name: 'auth-storage',
      // Only persist the 'user' object, not the modal's open/closed state
      partialize: (state) => ({ user: state.user }),
      // Add error handling for persistence
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating auth store:', error);
          // Clear corrupted data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
          }
        } else if (state?.user) {
          // Validate persisted user data
          const { user } = state;
          if (!user.id || !user.phone || !user.businessName || typeof user.isWholesaler !== 'boolean') {
            console.warn('Invalid persisted user data, clearing:', user);
            state.user = null;
          }
        }
      },
    },
  ),
);
