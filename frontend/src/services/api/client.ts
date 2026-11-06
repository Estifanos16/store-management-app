import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL as string | undefined) ||
  'http://localhost:3000';

export const TOKEN_KEY = 'auth_token';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
