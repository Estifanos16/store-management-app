import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const syncOperationSchema = z.object({
  shopId: z.string().min(1),
  deviceId: z.string().optional(),
  entityType: z.string().min(1),
  entityId: z.string().optional(),
  operation: z.string().min(1),
  payload: z.record(z.any()).optional().default({}),
});

const syncRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/sync/operations', {
    schema: {
      tags: ['Sync'],
      summary: 'List sync operations',
      description: 'Returns queued and processed synchronization operations for the selected shop.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { operations: { type: 'array' } } },
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
    const operations = await prisma.syncOperation.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({ operations });
  });

  fastify.post('/sync/operations', {
    schema: {
      tags: ['Sync'],
      summary: 'Queue sync operation',
      description: 'Queues a pending synchronization operation captured from an offline device.',
      body: {
        type: 'object',
        required: ['shopId', 'entityType', 'operation'],
        properties: {
          shopId: { type: 'string' },
          deviceId: { type: 'string' },
          entityType: { type: 'string' },
          entityId: { type: 'string' },
          operation: { type: 'string' },
          payload: { type: 'object' },
        },
      },
      response: {
        201: { type: 'object', properties: { operation: { type: 'object' } } },
        401: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const payload = syncOperationSchema.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const operation = await prisma.syncOperation.create({
      data: {
        shopId: payload.shopId,
        deviceId: payload.deviceId,
        entityType: payload.entityType,
        entityId: payload.entityId,
        operation: payload.operation,
        payload: payload.payload,
        createdByUserId: requestUser.id,
        status: 'PENDING',
      },
    });

    reply.code(201).send({ operation });
  });

  fastify.get('/sync/status', {
    schema: {
      tags: ['Sync'],
      summary: 'Get sync status',
      description: 'Returns counts of pending, completed, and failed synchronization operations.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { shopId: { type: 'string' }, pending: { type: 'integer' }, completed: { type: 'integer' }, failed: { type: 'integer' } } },
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
    const [pending, completed, failed] = await Promise.all([
      prisma.syncOperation.count({ where: { shopId, status: 'PENDING' } }),
      prisma.syncOperation.count({ where: { shopId, status: 'COMPLETED' } }),
      prisma.syncOperation.count({ where: { shopId, status: 'FAILED' } }),
    ]);

    reply.send({ shopId, pending, completed, failed });
  });
};

export default syncRoutes;
