import { API_BASE_URL, getAuthHeaders } from './client';

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
