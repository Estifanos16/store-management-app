import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const returnSchema = z.object({
  shopId: z.string().min(1),
  itemId: z.string().min(1),
  reason: z.string().min(3),
});

const returnsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/returns', {
    schema: {
      tags: ['Returns'],
      summary: 'Register a return',
      description: 'Marks a sold item as returned and stores the return reason in the shop context.',
      body: {
        type: 'object',
        required: ['shopId', 'itemId', 'reason'],
        properties: {
          shopId: { type: 'string' },
          itemId: { type: 'string' },
          reason: { type: 'string', minLength: 3 },
        },
      },
      response: {
        201: { type: 'object', properties: { returnRecord: { type: 'object' } } },
        401: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        400: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const payload = returnSchema.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const item = await prisma.item.findFirst({
      where: { id: payload.itemId, shopId: payload.shopId },
    });

    if (!item) {
      reply.code(404).send({ error: 'Not Found', message: 'Item not found.' });
      return;
    }

    if (item.status !== 'SOLD') {
      reply.code(400).send({ error: 'Bad Request', message: 'Only sold items can be returned.' });
      return;
    }

    const record = await prisma.$transaction(async (tx: any) => {
      const created = await tx.returnRecord.create({
        data: {
          shopId: payload.shopId,
          itemId: payload.itemId,
          createdByUserId: requestUser.id,
          reason: payload.reason,
          status: 'RETURNED',
        },
      });

      await tx.item.update({
        where: { id: payload.itemId },
        data: { status: 'RETURNED' },
      });

      await tx.inventoryMovement.create({
        data: {
          shopId: payload.shopId,
          itemId: payload.itemId,
          fromStatus: 'SOLD',
          toStatus: 'RETURNED',
          reason: payload.reason,
          performedByUserId: requestUser.id,
        },
      });

      return created;
    });

    reply.code(201).send({ returnRecord: record });
  });

  fastify.get('/returns', {
    schema: {
      tags: ['Returns'],
      summary: 'List return records',
      description: 'Returns recorded item returns for the selected shop.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { returns: { type: 'array' } } },
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
    const returns = await prisma.returnRecord.findMany({
      where: { shopId },
      include: { item: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({ returns });
  });
};

export default returnsRoutes;
