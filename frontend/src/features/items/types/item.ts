export interface Item {
  id: string;
  shopId: string;
  productId: string;
  publicIdentifier: string;
  uniqueQrCode: string;
  status: 'IN_STOCK' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'LOST';
  costPrice: number;
  sellingPrice: number;
  registeredAt: string;
  soldAt?: string;
  createdByUserId?: string;
  product?: {
    id: string;
    name: string;
    description?: string;
    brand?: string;
    defaultSellingPrice: number;
  };
}

export interface CreateItemData {
  shopId: string;
  productId: string;
  quantity: number;
  costPrice: number;
  sellingPrice?: number;
}

export interface UpdateItemStatusData {
  shopId: string;
  status: 'IN_STOCK' | 'SOLD' | 'RETURNED' | 'DAMAGED';
  reason?: string;
}
