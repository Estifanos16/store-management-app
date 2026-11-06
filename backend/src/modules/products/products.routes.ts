import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const productBody = z.object({
  shopId: z.string().min(1),
  categoryId: z.string().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  brand: z.string().optional(),
  defaultSellingPrice: z.number().positive(),
  archived: z.boolean().optional(),
});

const productPatch = productBody.partial();

const EMPTY_STOCK = { available: 0, sold: 0, damaged: 0, returned: 0, lost: 0 };

const getStockCounts = async (shopId: string, productIds: string[]) => {
  const counts = new Map<string, { available: number; sold: number; damaged: number; returned: number; lost: number }>(
    productIds.map((id) => [id, { ...EMPTY_STOCK }]),
  );
  if (productIds.length === 0) return counts;

  const rows = await prisma.item.groupBy({
    by: ['productId', 'status'],
    where: { shopId, productId: { in: productIds } },
    _count: { _all: true },
  });

  for (const row of rows) {
    const entry = counts.get(row.productId);
    if (!entry) continue;
    const key = row.status === 'IN_STOCK' ? 'available' : (row.status.toLowerCase() as keyof typeof entry);
    entry[key] += row._count._all;
  }
  return counts;
};

const withStockCounts = <T extends { id: string }>(product: T, counts: Map<string, any>) => ({
  ...product,
  stockCounts: counts.get(product.id) ?? { ...EMPTY_STOCK },
});

const productsRoutes: FastifyPluginAsync = async (fastify) => {
  const getShopIdFromQuery = (request: any) => {
    const shopId = request.query?.shopId ?? request.body?.shopId ?? request.params?.shopId;
    return typeof shopId === 'string' ? shopId : undefined;
  };

  fastify.get('/products', {
    schema: {
      tags: ['Products'],
      summary: 'List shop products',
      description: 'Returns active products in the selected shop.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: {
          shopId: { type: 'string' },
        },
      },
      response: {
        200: { type: 'object', properties: { products: { type: 'array' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const shopId = getShopIdFromQuery(request);
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const products = await prisma.product.findMany({
      where: { shopId, archived: false },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    const counts = await getStockCounts(shopId, products.map((p) => p.id));

    reply.send({ products: products.map((p) => withStockCounts(p, counts)) });
  });

  fastify.post('/products', {
    schema: {
      tags: ['Products'],
      summary: 'Create product',
      description: 'Creates a catalog product in the authorized shop.',
      body: {
        type: 'object',
        required: ['shopId', 'name', 'defaultSellingPrice'],
        properties: {
          shopId: { type: 'string' },
          categoryId: { type: 'string' },
          name: { type: 'string', minLength: 2 },
          description: { type: 'string' },
          brand: { type: 'string' },
          defaultSellingPrice: { type: 'number' },
          archived: { type: 'boolean' },
        },
      },
      response: {
        201: { type: 'object', properties: { product: { type: 'object' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const payload = productBody.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);
    const product = await prisma.product.create({
      data: {
        shopId: payload.shopId,
        categoryId: payload.categoryId,
        name: payload.name,
        description: payload.description,
        brand: payload.brand,
        defaultSellingPrice: payload.defaultSellingPrice,
        archived: payload.archived ?? false,
      },
      include: { category: true },
    });
    const counts = await getStockCounts(payload.shopId, [product.id]);

    reply.code(201).send({ product: withStockCounts(product, counts) });
  });

  fastify.get('/products/:productId', {
    schema: {
      tags: ['Products'],
      summary: 'Get a single product',
      description: 'Returns one product from the selected shop.',
      params: {
        type: 'object',
        required: ['productId'],
        properties: { productId: { type: 'string' } },
      },
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { product: { type: 'object' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { productId } = request.params as { productId: string };
    const shopId = getShopIdFromQuery(request);
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const product = await prisma.product.findFirst({
      where: { id: productId, shopId },
      include: { category: true },
    });

    if (!product) {
      reply.code(404).send({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    const counts = await getStockCounts(shopId, [product.id]);
    reply.send({ product: withStockCounts(product, counts) });
  });

  fastify.patch('/products/:productId', {
    schema: {
      tags: ['Products'],
      summary: 'Update product',
      description: 'Updates product fields in the shop scope.',
      params: {
        type: 'object',
        required: ['productId'],
        properties: { productId: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          shopId: { type: 'string' },
          categoryId: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          brand: { type: 'string' },
          defaultSellingPrice: { type: 'number' },
          archived: { type: 'boolean' },
        },
      },
      response: {
        200: { type: 'object', properties: { product: { type: 'object' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const { productId } = request.params as { productId: string };
    const payload = productPatch.parse(request.body);
    const shopId = payload.shopId ?? getShopIdFromQuery(request);
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const existing = await prisma.product.findFirst({ where: { id: productId, shopId } });
    if (!existing) {
      reply.code(404).send({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        categoryId: payload.categoryId,
        name: payload.name,
        description: payload.description,
        brand: payload.brand,
        defaultSellingPrice: payload.defaultSellingPrice,
        archived: payload.archived,
      },
      include: { category: true },
    });
    const counts = await getStockCounts(shopId, [product.id]);

    reply.send({ product: withStockCounts(product, counts) });
  });
};

export default productsRoutes;
