import { Product } from './types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality Bluetooth headphones with noise cancellation',
    price: 4500.00,
    stock: 45,
    shopId: 'shop1',
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'USB-C Charging Cable',
    description: 'Fast charging cable for modern devices',
    price: 350.00,
    stock: 120,
    shopId: 'shop1',
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/150',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Phone Case - Black',
    description: 'Durable protective case for smartphones',
    price: 550.00,
    stock: 75,
    shopId: 'shop1',
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/150',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Portable Power Bank',
    description: '10000mAh portable charger',
    price: 1800.00,
    stock: 30,
    shopId: 'shop1',
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/150',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Screen Protector',
    description: 'Tempered glass screen protector',
    price: 250.00,
    stock: 200,
    shopId: 'shop1',
    category: 'Accessories',
    imageUrl: 'https://via.placeholder.com/150',
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useMockProducts = (useMock: boolean = true) => {
  if (useMock) {
    return {
      data: mockProducts,
      isLoading: false,
      error: null,
    };
  }
  return null;
};
