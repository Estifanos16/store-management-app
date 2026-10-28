export interface LabelData {
  id: string;
  name: string;
  price: number;
  qrCode: string;
  category?: string;
  serialNumber?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  shopName: string;
  shopAddress?: string;
  shopPhone?: string;
}

export interface PrintOptions {
  printerUrl?: string;
  orientation?: 'portrait' | 'landscape';
}
