import { API_BASE_URL, getAuthHeaders } from './client';

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const categoriesApi = {
  async getCategories(shopId: string): Promise<Category[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/categories?shopId=${encodeURIComponent(shopId)}`,
      { method: 'GET', headers },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    const data = await response.json();
    return data.categories || [];
  },

  async createCategory(data: { shopId: string; name: string; description?: string }): Promise<Category> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    const result = await response.json();
    return result.category;
  },
};
