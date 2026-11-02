export interface Sale {
  id: string;
  shopId: string;
  saleNumber: string;
  totalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER';
  status: 'COMPLETED' | 'REFUNDED' | 'CANCELLED';
  soldAt: string;
  createdByUserId: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    costPrice: number;
  }>;
}

export const mockSales: Sale[] = [
  {
    id: 'sale-1',
    shopId: 'shop-1',
    saleNumber: 'SALE-2026-001',
    totalAmount: 4850,
    totalCost: 3750,
    profit: 1100,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    soldAt: new Date(Date.now() - 3600000).toISOString(),
    createdByUserId: 'user-2',
    items: [
      {
        id: 'si-1',
        productId: '1',
        productName: 'Wireless Headphones',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
        costPrice: 3500,
      },
      {
        id: 'si-2',
        productId: '2',
        productName: 'USB-C Charging Cable',
        quantity: 1,
        unitPrice: 350,
        totalPrice: 350,
        costPrice: 250,
      },
    ],
  },
  {
    id: 'sale-2',
    shopId: 'shop-1',
    saleNumber: 'SALE-2026-002',
    totalAmount: 2350,
    totalCost: 1900,
    profit: 450,
    paymentMethod: 'MOBILE_MONEY',
    status: 'COMPLETED',
    soldAt: new Date(Date.now() - 7200000).toISOString(),
    createdByUserId: 'user-2',
    items: [
      {
        id: 'si-3',
        productId: '3',
        productName: 'Phone Case - Black',
        quantity: 1,
        unitPrice: 550,
        totalPrice: 550,
        costPrice: 400,
      },
      {
        id: 'si-4',
        productId: '4',
        productName: 'Portable Power Bank',
        quantity: 1,
        unitPrice: 1800,
        totalPrice: 1800,
        costPrice: 1500,
      },
    ],
  },
  {
    id: 'sale-3',
    shopId: 'shop-1',
    saleNumber: 'SALE-2026-003',
    totalAmount: 800,
    totalCost: 600,
    profit: 200,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    soldAt: new Date(Date.now() - 86400000).toISOString(),
    createdByUserId: 'user-1',
    items: [
      {
        id: 'si-5',
        productId: '8',
        productName: 'Wireless Mouse',
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
        costPrice: 600,
      },
    ],
  },
];
