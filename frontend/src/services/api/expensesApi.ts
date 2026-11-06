import { API_BASE_URL, getAuthHeaders } from './client';

interface CreateExpenseData {
  shopId: string;
  category: string;
  description: string;
  amount: number;
  expenseDate?: string;
}

export const expensesApi = {
  async getExpenses(shopId: string): Promise<{ expenses: any[] }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/expenses?shopId=${shopId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch expenses');
    }

    return await response.json();
  },

  async createExpense(data: CreateExpenseData): Promise<{ expense: any }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create expense');
    }

    return await response.json();
  },
};
