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

export const reportsApi = {
  async getDashboard(shopId: string): Promise<any> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/reports/dashboard?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard');
    }

    return await response.json();
  },

  async getProfitReport(shopId: string): Promise<any> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/reports/profit?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profit report');
    }

    return await response.json();
  },
};
