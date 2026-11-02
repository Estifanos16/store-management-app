import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  brand: z.string().max(50, 'Brand must be less than 50 characters').optional(),
  defaultSellingPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a positive number',
  }),
  categoryId: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
