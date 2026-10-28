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
    sellingPrice: number;
    shopId: string;
    archived: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Item {
    id: string;
    productId: string;
    qrCode: string;
    costPrice: number;
    status: ItemStatus;
    shopId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Sale {
    id: string;
    shopId: string;
    sellerId: string;
    total: number;
    profit: number;
    clientId?: string;
    createdAt: Date;
}
export interface SaleLine {
    id: string;
    saleId: string;
    itemId: string;
    productId: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
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
    currency: string;
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
