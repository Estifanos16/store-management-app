// Shared TypeScript types for Store Management App

export type UserRole = 'owner' | 'seller';

export type ItemStatus = 'in_stock' | 'sold' | 'returned' | 'damaged' | 'lost';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  shopId: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  sellingPrice: number; // in minor units (cents)
  shopId: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  productId: string;
  qrCode: string; // non-guessable item ID encoded
  costPrice: number; // in minor units (cents)
  status: ItemStatus;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  shopId: string;
  sellerId: string;
  total: number; // in minor units (cents)
  profit: number; // in minor units (cents)
  clientId?: string; // for offline sync deduplication
  createdAt: Date;
}

export interface SaleLine {
  id: string;
  saleId: string;
  itemId: string;
  productId: string;
  quantity: number;
  costPrice: number; // copied at moment of sale
  sellingPrice: number; // copied at moment of sale
}

export interface StockMovement {
  id: string;
  itemId: string;
  userId: string;
  fromStatus: ItemStatus;
  toStatus: ItemStatus;
  reason: string;
  createdAt: Date;
}

export interface Shop {
  id: string;
  name: string;
  currency: string; // e.g., 'ETB', 'USD'
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
