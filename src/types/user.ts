export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  language: 'cs' | 'en';
  currency: 'CZK';
  notifications: {
    email: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
  };
  delivery: {
    defaultAddressId?: string;
    preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
    specialInstructions?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export const defaultUserPreferences: UserPreferences = {
  language: 'cs',
  currency: 'CZK',
  notifications: {
    email: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
  },
  privacy: {
    shareData: false,
    analytics: true,
  },
  delivery: {
    preferredTimeSlot: 'morning',
  },
};