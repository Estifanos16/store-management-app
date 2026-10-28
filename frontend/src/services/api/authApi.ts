import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/auth';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'http://localhost:3000';

const TOKEN_KEY = 'auth_token';
const USE_MOCK_KEY = 'use_mock_auth';

// Mock user data for development
const MOCK_USERS: { [key: string]: User } = {
  'admin@demo.com': {
    id: 'user-0',
    name: 'Admin User',
    email: 'admin@demo.com',
    phone: '+1111111111',
    role: 'owner',
    shopId: 'shop-1',
    active: true,
    memberships: [
      {
        shopId: 'shop-1',
        role: 'OWNER',
        shop: {
          id: 'shop-1',
          name: 'Demo Shop',
          currency: 'ETB',
        },
      },
    ],
  },
  'owner@demo.com': {
    id: 'user-1',
    name: 'Store Owner',
    email: 'owner@demo.com',
    phone: '+1234567890',
    role: 'owner',
    shopId: 'shop-1',
    active: true,
    memberships: [
      {
        shopId: 'shop-1',
        role: 'OWNER',
        shop: {
          id: 'shop-1',
          name: 'Demo Shop',
          currency: 'ETB',
        },
      },
    ],
  },
  'seller@demo.com': {
    id: 'user-2',
    name: 'Store Seller',
    email: 'seller@demo.com',
    phone: '+0987654321',
    role: 'seller',
    shopId: 'shop-1',
    active: true,
    memberships: [
      {
        shopId: 'shop-1',
        role: 'SELLER',
        shop: {
          id: 'shop-1',
          name: 'Demo Shop',
          currency: 'ETB',
        },
      },
    ],
  },
};

const MOCK_PASSWORDS: { [key: string]: string } = {
  'admin@demo.com': 'admin123',
  'owner@demo.com': 'demo123',
  'seller@demo.com': 'demo123',
};

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  memberships: Array<{
    shopId: string;
    role: 'OWNER' | 'SELLER';
    shop: {
      id: string;
      name: string;
      currency: string;
    };
  }>;
}

const shouldUseMock = async (): Promise<boolean> => {
  const useMock = await SecureStore.getItemAsync(USE_MOCK_KEY);
  return useMock === 'true';
};

const convertBackendUser = (backendUser: BackendUser): User => {
  const membership = backendUser.memberships?.[0];
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    phone: '',
    role: membership?.role === 'OWNER' ? 'owner' : 'seller',
    shopId: membership?.shopId || '',
    active: backendUser.active,
    memberships: backendUser.memberships || [],
  };
};

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const useMock = await shouldUseMock();
    
    // Try mock login first for development
    if (useMock) {
      const mockUser = MOCK_USERS[email] || MOCK_USERS[email.toLowerCase()];
      const mockPassword = MOCK_PASSWORDS[email] || MOCK_PASSWORDS[email.toLowerCase()];
      if (mockUser && password === mockPassword) {
        const mockToken = `mock-token-${mockUser.id}-${Date.now()}`;
        const mockRefreshToken = `mock-refresh-${mockUser.id}-${Date.now()}`;
        await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
        await SecureStore.setItemAsync('mock_user_id', mockUser.id);
        return { user: mockUser, accessToken: mockToken, refreshToken: mockRefreshToken };
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password } as LoginRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    const user = convertBackendUser(data.user);
    await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
    return { user, accessToken: data.accessToken, refreshToken: data.refreshToken };
  },

  async logout(): Promise<void> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && !token.startsWith('mock-token-')) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync('mock_user_id');
  },

  async getCurrentUser(): Promise<User> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const useMock = await shouldUseMock();

    // Handle mock token
    if (token.startsWith('mock-token-')) {
      const mockUserId = await SecureStore.getItemAsync('mock_user_id');
      if (mockUserId) {
        const mockUser = Object.values(MOCK_USERS).find(u => u.id === mockUserId);
        if (mockUser) return mockUser;
      }
    }

    if (useMock) {
      // Fall back to mock even if token isn't mock
      const mockUser = MOCK_USERS['owner@demo.com'];
      return mockUser;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    const backendUser = await response.json();
    return convertBackendUser(backendUser);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setUseMock(useMock: boolean): Promise<void> {
    await SecureStore.setItemAsync(USE_MOCK_KEY, useMock ? 'true' : 'false');
  },
};
