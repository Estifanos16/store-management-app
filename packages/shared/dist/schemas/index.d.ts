import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    identifier: string;
    password: string;
}, {
    identifier: string;
    password: string;
}>;
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    shopId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    name: string;
    shopId: string;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    password: string;
    name: string;
    shopId: string;
    email?: string | undefined;
    phone?: string | undefined;
}>;
export declare const productSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sellingPrice: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    sellingPrice: number;
    description?: string | undefined;
}, {
    name: string;
    sellingPrice: number;
    description?: string | undefined;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sellingPrice: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    sellingPrice?: number | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    sellingPrice?: number | undefined;
}>;
export declare const itemSchema: z.ZodObject<{
    productId: z.ZodString;
    costPrice: z.ZodNumber;
    qrCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productId: string;
    costPrice: number;
    qrCode: string;
}, {
    productId: string;
    costPrice: number;
    qrCode: string;
}>;
export declare const saleSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        sellingPrice: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        sellingPrice: number;
        itemId: string;
    }, {
        sellingPrice: number;
        itemId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        sellingPrice: number;
        itemId: string;
    }[];
}, {
    items: {
        sellingPrice: number;
        itemId: string;
    }[];
}>;
export declare const returnSchema: z.ZodObject<{
    saleLineId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    saleLineId: string;
    reason: string;
}, {
    saleLineId: string;
    reason: string;
}>;
export declare const shopSchema: z.ZodObject<{
    name: z.ZodString;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    currency: string;
}, {
    name: string;
    currency?: string | undefined;
}>;
export declare const errorCodes: readonly ["ITEM_ALREADY_SOLD", "ITEM_NOT_FOUND", "ITEM_NOT_IN_STOCK", "FORBIDDEN", "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"];
export declare const errorResponseSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodEnum<["ITEM_ALREADY_SOLD", "ITEM_NOT_FOUND", "ITEM_NOT_IN_STOCK", "FORBIDDEN", "VALIDATION_ERROR", "UNAUTHORIZED", "NOT_FOUND"]>;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: "ITEM_ALREADY_SOLD" | "ITEM_NOT_FOUND" | "ITEM_NOT_IN_STOCK" | "FORBIDDEN" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND";
        message: string;
        details?: any;
    }, {
        code: "ITEM_ALREADY_SOLD" | "ITEM_NOT_FOUND" | "ITEM_NOT_IN_STOCK" | "FORBIDDEN" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND";
        message: string;
        details?: any;
    }>;
}, "strip", z.ZodTypeAny, {
    error: {
        code: "ITEM_ALREADY_SOLD" | "ITEM_NOT_FOUND" | "ITEM_NOT_IN_STOCK" | "FORBIDDEN" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND";
        message: string;
        details?: any;
    };
}, {
    error: {
        code: "ITEM_ALREADY_SOLD" | "ITEM_NOT_FOUND" | "ITEM_NOT_IN_STOCK" | "FORBIDDEN" | "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND";
        message: string;
        details?: any;
    };
}>;
export declare const loginResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodEnum<["owner", "seller"]>;
        shopId: z.ZodString;
        active: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name: string;
        shopId: string;
        id: string;
        role: "owner" | "seller";
        active: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        shopId: string;
        id: string;
        role: "owner" | "seller";
        active: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    }>;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        name: string;
        shopId: string;
        id: string;
        role: "owner" | "seller";
        active: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    };
    token: string;
}, {
    user: {
        name: string;
        shopId: string;
        id: string;
        role: "owner" | "seller";
        active: boolean;
        email?: string | undefined;
        phone?: string | undefined;
    };
    token: string;
}>;
export declare const productResponseSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    sellingPrice: z.ZodNumber;
    shopId: z.ZodString;
    archived: z.ZodBoolean;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    shopId: string;
    description: string | null;
    sellingPrice: number;
    id: string;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
}, {
    name: string;
    shopId: string;
    description: string | null;
    sellingPrice: number;
    id: string;
    archived: boolean;
    createdAt: string;
    updatedAt: string;
}>;
export declare const itemResponseSchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    qrCode: z.ZodString;
    costPrice: z.ZodNumber;
    status: z.ZodEnum<["in_stock", "sold", "returned", "damaged", "lost"]>;
    shopId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "in_stock" | "sold" | "returned" | "damaged" | "lost";
    shopId: string;
    productId: string;
    costPrice: number;
    qrCode: string;
    id: string;
    createdAt: string;
    updatedAt: string;
}, {
    status: "in_stock" | "sold" | "returned" | "damaged" | "lost";
    shopId: string;
    productId: string;
    costPrice: number;
    qrCode: string;
    id: string;
    createdAt: string;
    updatedAt: string;
}>;
