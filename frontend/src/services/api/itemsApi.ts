import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL || 
                     process.env.EXPO_PUBLIC_API_BASE_URL || 
                     'http://localhost:3000';

const TOKEN_KEY = 'auth_token';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

interface Item {
  id: string;
  shopId: string;
  productId: string;
  publicIdentifier: string;
  uniqueQrCode: string;
  status: 'IN_STOCK' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'LOST';
  costPrice: number;
  sellingPrice: number;
  registeredAt: string;
  soldAt?: string;
  createdByUserId?: string;
  product?: {
    id: string;
    name: string;
    description?: string;
    brand?: string;
    defaultSellingPrice: number;
  };
}

interface CreateItemData {
  shopId: string;
  productId: string;
  quantity: number;
  costPrice: number;
  sellingPrice?: number;
}

interface UpdateItemStatusData {
  shopId: string;
  status: 'IN_STOCK' | 'SOLD' | 'RETURNED' | 'DAMAGED';
  reason?: string;
}

export const itemsApi = {
  async getItems(shopId: string, status?: string): Promise<{ items: Item[] }> {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams({ shopId });
    if (status) queryParams.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/api/items?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch items');
    }

    return await response.json();
  },

  async getItemById(itemId: string, shopId: string): Promise<{ item: Item }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/items/${itemId}?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch item');
    }

    return await response.json();
  },

  async createItems(data: CreateItemData): Promise<{ items: Item[]; count: number }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create items');
    }

    return await response.json();
  },

  async updateItemStatus(itemId: string, data: UpdateItemStatusData): Promise<{ item: Item }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/items/${itemId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update item status');
    }

    return await response.json();
  },

  async getItemByQRCode(qrCode: string, shopId: string): Promise<{ item: Item }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/items/by-qr-code?qrCode=${encodeURIComponent(qrCode)}&shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch item by QR code');
    }

    return await response.json();
  },
};
