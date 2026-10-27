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
  active: z.boolean().optional(),
});

const productPatch = productBody.partial();

const productsRoutes: FastifyPluginAsync = async (fastify) => {
  const getShopIdFromQuery = (request: any) => {
    const shopId = request.query?.shopId ?? request.body?.shopId ?? request.params?.shopId;
    return typeof shopId === 'string' ? shopId : undefined;
  };

  fastify.get('/products', async (request, reply) => {
    const shopId = getShopIdFromQuery(request);
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const products = await prisma.product.findMany({
      where: { shopId, active: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({ products });
  });

  fastify.post('/products', async (request, reply) => {
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
        active: payload.active ?? true,
      },
    });

    reply.code(201).send({ product });
  });

  fastify.get('/products/:productId', async (request, reply) => {
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

    reply.send({ product });
  });

  fastify.patch('/products/:productId', async (request, reply) => {
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
        active: payload.active,
      },
    });

    reply.send({ product });
  });
};

export default productsRoutes;
