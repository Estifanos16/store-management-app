import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof productSchema>;
