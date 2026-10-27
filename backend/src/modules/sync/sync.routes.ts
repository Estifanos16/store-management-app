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
  fastify.get('/sync/operations', async (request, reply) => {
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

  fastify.post('/sync/operations', async (request, reply) => {
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

  fastify.get('/sync/status', async (request, reply) => {
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
