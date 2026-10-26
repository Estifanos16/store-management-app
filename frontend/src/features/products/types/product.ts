export interface ProductItem {
  id: string;
  serialNumber?: string;
  status: 'in_stock' | 'sold' | 'damaged' | 'lost' | 'returned';
  condition?: string;
  purchaseDate?: string;
  saleDate?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  shopId: string;
  category?: string;
  imageUrl?: string;
  active: boolean;
  items?: ProductItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
  active?: boolean;
}
