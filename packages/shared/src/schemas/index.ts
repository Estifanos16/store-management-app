import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  shopId: z.string().uuid('Invalid shop ID'),
});

// Product schemas
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional(),
  sellingPrice: z.number().int().positive('Selling price must be positive'),
});

export const updateProductSchema = productSchema.partial();

// Item schemas
export const itemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  costPrice: z.number().int().positive('Cost price must be positive'),
  qrCode: z.string().min(1, 'QR code is required'),
});

// Sale schemas
export const saleSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().uuid('Invalid item ID'),
    sellingPrice: z.number().int().positive('Selling price must be positive'),
  })).min(1, 'At least one item is required'),
});

export const returnSchema = z.object({
  saleLineId: z.string().uuid('Invalid sale line ID'),
  reason: z.string().min(1, 'Reason is required'),
});

// Shop schemas
export const shopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  currency: z.string().default('ETB'),
});

// Error codes
export const errorCodes = [
  'ITEM_ALREADY_SOLD',
  'ITEM_NOT_FOUND',
  'ITEM_NOT_IN_STOCK',
  'FORBIDDEN',
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'NOT_FOUND',
] as const;

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum(errorCodes),
    message: z.string(),
    details: z.any().optional(),
  }),
});

// Response schemas
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum(['owner', 'seller']),
    shopId: z.string().uuid(),
    active: z.boolean(),
  }),
  token: z.string(),
});

export const productResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sellingPrice: z.number(),
  shopId: z.string().uuid(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const itemResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  qrCode: z.string(),
  costPrice: z.number(),
  status: z.enum(['in_stock', 'sold', 'returned', 'damaged', 'lost']),
  shopId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
