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
