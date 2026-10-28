"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemResponseSchema = exports.productResponseSchema = exports.loginResponseSchema = exports.errorResponseSchema = exports.errorCodes = exports.shopSchema = exports.returnSchema = exports.saleSchema = exports.itemSchema = exports.updateProductSchema = exports.productSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Auth schemas
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'Email or phone is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address').optional(),
    phone: zod_1.z.string().min(10, 'Phone must be at least 10 characters').optional(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    shopId: zod_1.z.string().uuid('Invalid shop ID'),
});
// Product schemas
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name must be at least 2 characters'),
    description: zod_1.z.string().optional(),
    sellingPrice: zod_1.z.number().int().positive('Selling price must be positive'),
});
exports.updateProductSchema = exports.productSchema.partial();
// Item schemas
exports.itemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Invalid product ID'),
    costPrice: zod_1.z.number().int().positive('Cost price must be positive'),
    qrCode: zod_1.z.string().min(1, 'QR code is required'),
});
// Sale schemas
exports.saleSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string().uuid('Invalid item ID'),
        sellingPrice: zod_1.z.number().int().positive('Selling price must be positive'),
    })).min(1, 'At least one item is required'),
});
exports.returnSchema = zod_1.z.object({
    saleLineId: zod_1.z.string().uuid('Invalid sale line ID'),
    reason: zod_1.z.string().min(1, 'Reason is required'),
});
// Shop schemas
exports.shopSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Shop name must be at least 2 characters'),
    currency: zod_1.z.string().default('ETB'),
});
// Error codes
exports.errorCodes = [
    'ITEM_ALREADY_SOLD',
    'ITEM_NOT_FOUND',
    'ITEM_NOT_IN_STOCK',
    'FORBIDDEN',
    'VALIDATION_ERROR',
    'UNAUTHORIZED',
    'NOT_FOUND',
];
exports.errorResponseSchema = zod_1.z.object({
    error: zod_1.z.object({
        code: zod_1.z.enum(exports.errorCodes),
        message: zod_1.z.string(),
        details: zod_1.z.any().optional(),
    }),
});
// Response schemas
exports.loginResponseSchema = zod_1.z.object({
    user: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string(),
        email: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.enum(['owner', 'seller']),
        shopId: zod_1.z.string().uuid(),
        active: zod_1.z.boolean(),
    }),
    token: zod_1.z.string(),
});
exports.productResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    sellingPrice: zod_1.z.number(),
    shopId: zod_1.z.string().uuid(),
    archived: zod_1.z.boolean(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.itemResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    qrCode: zod_1.z.string(),
    costPrice: zod_1.z.number(),
    status: zod_1.z.enum(['in_stock', 'sold', 'returned', 'damaged', 'lost']),
    shopId: zod_1.z.string().uuid(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
