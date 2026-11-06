import { API_BASE_URL, getAuthHeaders } from './client';

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
