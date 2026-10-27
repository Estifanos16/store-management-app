import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { User } from '../../types/auth';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'http://localhost:3000';

const TOKEN_KEY = 'auth_token';

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
  },
  'owner@demo.com': {
    id: 'user-1',
    name: 'Store Owner',
    email: 'owner@demo.com',
    phone: '+1234567890',
    role: 'owner',
    shopId: 'shop-1',
    active: true,
  },
  'seller@demo.com': {
    id: 'user-2',
    name: 'Store Seller',
    email: 'seller@demo.com',
    phone: '+0987654321',
    role: 'seller',
    shopId: 'shop-1',
    active: true,
  },
};

const MOCK_PASSWORDS: { [key: string]: string } = {
  'admin@demo.com': 'admin123',
  'owner@demo.com': 'demo123',
  'seller@demo.com': 'demo123',
};

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginRequest {
  identifier: string;
  password: string;
}

export const authApi = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    // Try mock login first for development
    const mockUser = MOCK_USERS[identifier] || MOCK_USERS[identifier.toLowerCase()];
    const mockPassword = MOCK_PASSWORDS[identifier] || MOCK_PASSWORDS[identifier.toLowerCase()];
    if (mockUser && password === mockPassword) {
      const mockToken = `mock-token-${mockUser.id}-${Date.now()}`;
      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      await SecureStore.setItemAsync('mock_user_id', mockUser.id);
      return { user: mockUser, token: mockToken };
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password } as LoginRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getCurrentUser(): Promise<User> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Handle mock token
    if (token.startsWith('mock-token-')) {
      const mockUserId = await SecureStore.getItemAsync('mock_user_id');
      if (mockUserId) {
        const mockUser = Object.values(MOCK_USERS).find(u => u.id === mockUserId);
        if (mockUser) return mockUser;
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
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

    return await response.json();
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
};
