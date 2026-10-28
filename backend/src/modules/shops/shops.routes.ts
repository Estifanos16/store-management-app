import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const shopIdParam = z.object({ shopId: z.string().min(1) });

const shopsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/shops', {
    schema: {
      tags: ['Shops'],
      summary: 'List shops for current user',
      description: 'Returns all active shops the current authenticated user belongs to.',
      response: {
        200: { type: 'object', properties: { shops: { type: 'array' } } },
        401: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    await fastify.requireAuth(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const memberships = await prisma.userShopAccess.findMany({
      where: { userId: requestUser.id, active: true },
      include: { shop: true },
    });

    reply.send({ shops: memberships.map((membership: any) => ({
      id: membership.shop.id,
      name: membership.shop.name,
      currency: membership.shop.currency,
      role: membership.role,
    })) });
  });

  fastify.get('/shops/:shopId', {
    schema: {
      tags: ['Shops'],
      summary: 'Get shop details',
      description: 'Returns a shop record and current user membership role for the selected shop.',
      params: {
        type: 'object',
        required: ['shopId'],
        properties: {
          shopId: { type: 'string' },
        },
      },
      response: {
        200: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, currency: { type: 'string' }, currentRole: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
        404: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      },
    },
  }, async (request, reply) => {
    const params = shopIdParam.parse(request.params);
    await fastify.requireShopAccess(params.shopId)(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const shop = await prisma.shop.findUnique({ where: { id: params.shopId } });
    if (!shop) {
      reply.code(404).send({ error: 'Not Found', message: 'Shop not found.' });
      return;
    }

    reply.send({
      id: shop.id,
      name: shop.name,
      address: shop.address,
      phone: shop.phone,
      currency: shop.currency,
      currentRole: requestUser.currentShopRole,
    });
  });
};

export default shopsRoutes;
