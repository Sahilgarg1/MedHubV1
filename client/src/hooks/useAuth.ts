import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/axios';

// Define the shape of data for our functions
interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

// Corresponds to the RegisterDto on the backend
export interface RegisterPayload {
  phone: string;
  businessName: string;
  isWholesaler: boolean;
  address: string;
  email?: string;
  contactNumber?: string;
}


// --- API Functions ---

const initiateAuth = async (phone: string) => {
  const response = await api.post('/auth/initiate', { phone });
  return response.data;
};

const verifyOtp = async ({ phone, otp }: VerifyOtpPayload) => {
  const response = await api.post('/auth/verify', { phone, otp });
  return response.data;
};

// New API function for registration
const registerUser = async (payload: RegisterPayload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};


// --- React Query Hooks ---

export const useInitiateAuth = () => {
  return useMutation({
    mutationFn: initiateAuth,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtp,
  });
};

// New hook for registration
export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};