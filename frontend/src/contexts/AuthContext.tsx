import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/auth';
import { authApi } from '../services/api/authApi';

interface Shop {
  id: string;
  name: string;
  currency: string;
  role: 'OWNER' | 'SELLER';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isSeller: boolean;
  currentShop: Shop | null;
  shops: Shop[];
  setCurrentShop: (shop: Shop) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SHOP_KEY = 'current_shop';
const SHOPS_KEY = 'user_shops';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentShop, setCurrentShopState] = useState<Shop | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);

  const setCurrentShop = async (shop: Shop) => {
    setCurrentShopState(shop);
    await SecureStore.setItemAsync(SHOP_KEY, JSON.stringify(shop));
  };

  const loadShops = async () => {
    try {
      const shopsData = await SecureStore.getItemAsync(SHOPS_KEY);
      if (shopsData) {
        setShops(JSON.parse(shopsData));
      }
    } catch (error) {
      console.error('Failed to load shops:', error);
    }
  };

  const loadCurrentShop = async () => {
    try {
      const shopData = await SecureStore.getItemAsync(SHOP_KEY);
      if (shopData) {
        setCurrentShopState(JSON.parse(shopData));
      }
    } catch (error) {
      console.error('Failed to load current shop:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      
      // Extract shops from user memberships
      if (userData.memberships && userData.memberships.length > 0) {
        const userShops: Shop[] = userData.memberships.map((m: any) => ({
          id: m.shopId,
          name: m.shop?.name || 'Unknown Shop',
          currency: m.shop?.currency || 'ETB',
          role: m.role,
        }));
        setShops(userShops);
        await SecureStore.setItemAsync(SHOPS_KEY, JSON.stringify(userShops));
        
        // Auto-select first shop if no current shop
        if (!currentShop && userShops.length > 0) {
          await setCurrentShop(userShops[0]);
        }
      }
    } catch (error) {
      setUser(null);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setCurrentShopState(null);
    setShops([]);
    await SecureStore.deleteItemAsync(SHOP_KEY);
    await SecureStore.deleteItemAsync(SHOPS_KEY);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await authApi.getToken();
        if (token) {
          await loadShops();
          await loadCurrentShop();
          await refreshUser();
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isOwner: user?.role === 'owner',
    isSeller: user?.role === 'seller',
    currentShop,
    shops,
    setCurrentShop,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
