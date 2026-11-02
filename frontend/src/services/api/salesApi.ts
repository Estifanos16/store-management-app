import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { mockSales } from './mockSalesData';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'http://localhost:3000';

const TOKEN_KEY = 'auth_token';
const USE_MOCK_KEY = 'use_mock_auth';

// Helper for web-compatible storage
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await storage.getItem(TOKEN_KEY);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

interface SaleItem {
  itemId: string;
  unitPrice?: number;
  discount?: number;
}

interface CreateSaleData {
  shopId: string;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER';
  discount?: number;
  items: SaleItem[];
}

const shouldUseMock = async (): Promise<boolean> => {
  const useMock = await storage.getItem(USE_MOCK_KEY);
  return useMock === 'true';
};

export const salesApi = {
  async getSales(shopId: string): Promise<{ sales: any[] }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/sales?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sales');
    }

    return await response.json();
  },

  async getSaleById(saleId: string, shopId: string): Promise<{ sale: any }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/sales/${saleId}?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sale');
    }

    return await response.json();
  },

  async createSale(data: CreateSaleData): Promise<{ sale: any }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/sales`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create sale');
    }

    return await response.json();
  },
};
