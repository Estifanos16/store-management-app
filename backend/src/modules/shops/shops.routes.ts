import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const shopIdParam = z.object({ shopId: z.string().min(1) });

const shopsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/shops', async (request, reply) => {
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

  fastify.get('/shops/:shopId', async (request, reply) => {
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
