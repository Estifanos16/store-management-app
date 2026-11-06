import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const categoryBody = z.object({
  shopId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/categories', {
    schema: {
      tags: ['Categories'],
      summary: 'List shop categories',
      description: 'Returns all categories in the selected shop.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { categories: { type: 'array' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const shopId = (request.query as any)?.shopId as string | undefined;
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const categories = await prisma.category.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
    });

    reply.send({ categories });
  });

  fastify.post('/categories', {
    schema: {
      tags: ['Categories'],
      summary: 'Create a category',
      description: 'Creates a product category in the authorized shop.',
      body: {
        type: 'object',
        required: ['shopId', 'name'],
        properties: {
          shopId: { type: 'string' },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
        },
      },
      response: {
        201: { type: 'object', properties: { category: { type: 'object' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        409: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const payload = categoryBody.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);

    const existing = await prisma.category.findFirst({
      where: { shopId: payload.shopId, name: payload.name },
    });
    if (existing) {
      reply.code(409).send({ error: 'Conflict', message: 'A category with that name already exists.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        shopId: payload.shopId,
        name: payload.name,
        description: payload.description,
      },
    });

    reply.code(201).send({ category });
  });
};

export default categoriesRoutes;
