import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/axios';

export interface UpdateProfilePayload {
  businessName?: string;
  address?: string;
  pickupPoint?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  licenseNumber?: string | null;
  gstNumber?: string | null;
}

const updateProfile = async ({ payload, userId }: { payload: UpdateProfilePayload; userId: string }) => {
  const { data } = await api.patch('/auth/profile', payload, {
    headers: {
      'x-user-id': userId,
    },
  });
  return data;
};

export const useUpdateProfile = () => {

  return useMutation({
    mutationFn: updateProfile,
  });
};
