import { useQuery } from '@tanstack/react-query';

export interface SupportContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  department: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const fetchSupportContacts = async (): Promise<SupportContact[]> => {
  const response = await fetch('/api/support-contacts');
  if (!response.ok) {
    throw new Error('Failed to fetch support contacts');
  }
  return response.json();
};

const fetchPrimarySupportContact = async (): Promise<SupportContact | null> => {
  const response = await fetch('/api/support-contacts/primary');
  if (!response.ok) {
    throw new Error('Failed to fetch primary support contact');
  }
  return response.json();
};

export const useSupportContacts = () => {
  return useQuery({
    queryKey: ['support-contacts'],
    queryFn: fetchSupportContacts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const usePrimarySupportContact = () => {
  return useQuery({
    queryKey: ['support-contacts', 'primary'],
    queryFn: fetchPrimarySupportContact,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
