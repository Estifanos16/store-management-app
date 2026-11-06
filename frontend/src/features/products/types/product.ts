export interface ProductItem {
  id: string;
  serialNumber?: string;
  status: 'in_stock' | 'sold' | 'damaged' | 'lost' | 'returned';
  condition?: string;
  purchaseDate?: string;
  saleDate?: string;
}

export interface StockCounts {
  available: number;
  sold: number;
  damaged: number;
  returned: number;
  lost: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  defaultSellingPrice: number;
  archived: boolean;
  shopId: string;
  categoryId?: string;
  category?: string;
  stockCounts?: StockCounts;
  // Derived/UI convenience fields populated by productsApi mapping
  price: number;
  stock?: number;
  active: boolean;
  imageUrl?: string;
  items?: ProductItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  shopId: string;
  name: string;
  description?: string;
  brand?: string;
  defaultSellingPrice?: number;
  price?: number;
  categoryId?: string;
  archived?: boolean;
  // Legacy UI-only fields accepted for compatibility; not sent to the API
  stock?: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateProductData {
  shopId?: string;
  name?: string;
  description?: string;
  brand?: string;
  defaultSellingPrice?: number;
  price?: number;
  categoryId?: string;
  archived?: boolean;
  active?: boolean;
  // Legacy UI-only fields accepted for compatibility; not sent to the API
  stock?: number;
  category?: string;
  imageUrl?: string;
}
