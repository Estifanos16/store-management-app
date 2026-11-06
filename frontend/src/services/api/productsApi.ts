import { API_BASE_URL, getAuthHeaders } from './client';
import { Product, StockCounts, CreateProductData, UpdateProductData } from '../../features/products/types/product';

interface BackendCategory {
  id: string;
  name: string;
}

interface BackendProduct {
  id: string;
  shopId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  brand?: string | null;
  defaultSellingPrice: number | string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  category?: BackendCategory | null;
  stockCounts?: StockCounts;
}

const EMPTY_STOCK: StockCounts = { available: 0, sold: 0, damaged: 0, returned: 0, lost: 0 };

const toUiProduct = (product: BackendProduct): Product => {
  const stockCounts = product.stockCounts ?? { ...EMPTY_STOCK };
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    price: Number(product.defaultSellingPrice),
    defaultSellingPrice: Number(product.defaultSellingPrice),
    stock: stockCounts.available,
    shopId: product.shopId,
    categoryId: product.categoryId ?? undefined,
    category: product.category?.name,
    brand: product.brand ?? undefined,
    imageUrl: undefined,
    active: !product.archived,
    archived: product.archived,
    stockCounts,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const resolveArchived = (data: UpdateProductData) =>
  data.archived ?? (data.active === undefined ? undefined : !data.active);

const toCreatePayload = (data: CreateProductData) => {
  const defaultSellingPrice = data.defaultSellingPrice ?? data.price;
  if (defaultSellingPrice == null) {
    throw new Error('A selling price is required.');
  }
  return {
    shopId: data.shopId,
    name: data.name,
    description: data.description,
    brand: data.brand,
    defaultSellingPrice,
    categoryId: data.categoryId,
    archived: data.archived,
  };
};

const toUpdatePayload = (data: UpdateProductData) => ({
  shopId: data.shopId,
  name: data.name,
  description: data.description,
  brand: data.brand,
  defaultSellingPrice: data.defaultSellingPrice ?? data.price,
  categoryId: data.categoryId,
  archived: resolveArchived(data),
});

export const productsApi = {
  async getProducts(params?: { shopId?: string; search?: string; category?: string }): Promise<Product[]> {
    const headers = await getAuthHeaders();

    const queryParams = new URLSearchParams();
    if (params?.shopId) queryParams.append('shopId', params.shopId);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const url = `${API_BASE_URL}/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch products');
    }

    const data = await response.json();
    return (data.products || []).map(toUiProduct);
  },

  async getProductById(id: string, shopId?: string): Promise<Product> {
    const headers = await getAuthHeaders();

    const query = shopId ? `?shopId=${encodeURIComponent(shopId)}` : '';
    const response = await fetch(`${API_BASE_URL}/api/products/${id}${query}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product');
    }

    const data = await response.json();
    return toUiProduct(data.product ?? data);
  },

  async createProduct(data: CreateProductData): Promise<Product> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(toCreatePayload(data)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.message || error.error || 'Failed to create product');
      } catch {
        throw new Error(errorText || 'Failed to create product');
      }
    }

    const result = await response.json();
    return toUiProduct(result.product ?? result);
  },

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(toUpdatePayload(data)),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }

    const result = await response.json();
    return toUiProduct(result.product ?? result);
  },
};
