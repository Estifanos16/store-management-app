import { API_BASE_URL, getAuthHeaders } from './client';

interface CreateReturnData {
  shopId: string;
  itemId: string;
  reason: string;
}

export const returnsApi = {
  async getReturns(shopId: string): Promise<{ returns: any[] }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/returns?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch returns');
    }

    return await response.json();
  },

  async createReturn(data: CreateReturnData): Promise<{ returnRecord: any }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/returns`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create return');
    }

    return await response.json();
  },
};
