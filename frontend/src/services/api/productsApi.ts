import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Product, CreateProductData, UpdateProductData } from '../../features/products/types/product';

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

export const productsApi = {
  async getProducts(params?: { shopId?: string; search?: string; category?: string }): Promise<Product[]> {
    const headers = await getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    if (params?.shopId) queryParams.append('shopId', params.shopId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    
    const url = `${API_BASE_URL}/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    const data = await response.json();
    return data.products || [];
  },

  async getProductById(id: string): Promise<Product> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product');
    }

    return await response.json();
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const headers = await getAuthHeaders();
    
    console.log('Creating product at:', `${API_BASE_URL}/api/products`);
    console.log('Request data:', data);
    console.log('Headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || error.error || 'Failed to create product');
      } catch {
        throw new Error(errorText || 'Failed to create product');
      }
    }

    return await response.json();
  },

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    return await response.json();
  },
};
