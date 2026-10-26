import Fastify from 'fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import jwt from '@fastify/jwt';
import authRoutes from './modules/auth/auth.routes.js';
import shopsRoutes from './modules/shops/shops.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import itemsRoutes from './modules/items/items.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import returnsRoutes from './modules/returns/returns.routes.js';
import expensesRoutes from './modules/expenses/expenses.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';
import { env } from './config/env.js';
import prisma from './lib/prisma.js';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  memberships?: Array<{
    shopId: string;
    role: 'OWNER' | 'SELLER';
    active: boolean;
    shop?: any;
  }>;
  currentShopId?: string;
  currentShopRole?: 'OWNER' | 'SELLER';
};

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireShopAccess: (shopId: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireShopRole: (shopId: string, roles: Array<'OWNER' | 'SELLER'>) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const getRequestUser = (request: FastifyRequest) => (request as any).user as AuthUser | undefined;

export async function buildServer() {
  const app = Fastify({
    logger: env.NODE_ENV === 'development',
  });

  await app.register(jwt, { secret: env.JWT_SECRET });
  app.decorate('prisma', prisma);

  app.decorate('requireAuth', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Unauthorized', message: 'A bearer token is required.' });
      return;
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = await app.jwt.verify<{ sub: string }>(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        include: {
          memberships: {
            where: { active: true },
            include: { shop: true },
          },
        },
      });

      if (!user || !user.active) {
        throw new Error('inactive-user');
      }

      (request as any).user = {
        id: user.id,
        name: user.name,
        email: user.email,
        memberships: user.memberships.map((membership: any) => ({
          shopId: membership.shopId,
          role: membership.role,
          active: membership.active,
          shop: membership.shop,
        })),
      };
    } catch {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token.' });
      return;
    }
  });

  app.decorate('requireShopAccess', (shopId: string) => async (request, reply) => {
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await app.requireAuth(request, reply);
    const requestUser = getRequestUser(request);
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const membership = requestUser.memberships?.find((item: any) => item.shopId === shopId);
    if (!membership) {
      reply.code(403).send({ error: 'Forbidden', message: 'You do not have access to this shop.' });
      return;
    }

    (request as any).user = {
      ...requestUser,
      currentShopId: shopId,
      currentShopRole: membership.role,
    };
  });

  app.decorate('requireShopRole', (shopId: string, roles: Array<'OWNER' | 'SELLER'>) => async (request, reply) => {
    await app.requireShopAccess(shopId)(request, reply);
    const requestUser = getRequestUser(request);
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const membership = requestUser.memberships?.find((item: any) => item.shopId === shopId);
    if (!membership || !roles.includes(membership.role)) {
      reply.code(403).send({ error: 'Forbidden', message: 'Insufficient permissions for this action.' });
      return;
    }
  });

  app.get('/health', async () => ({ ok: true, status: 'healthy', environment: env.NODE_ENV }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(shopsRoutes, { prefix: '/api' });
  await app.register(productsRoutes, { prefix: '/api' });
  await app.register(itemsRoutes, { prefix: '/api' });
  await app.register(salesRoutes, { prefix: '/api' });
  await app.register(returnsRoutes, { prefix: '/api' });
  await app.register(expensesRoutes, { prefix: '/api' });
  await app.register(reportsRoutes, { prefix: '/api' });
  await app.register(syncRoutes, { prefix: '/api' });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof Error && error.message === 'Unauthorized') {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    app.log.error({ err: error, url: request.url }, 'Unhandled server error');
    reply.code(500).send({
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'production' ? 'Something went wrong.' : error instanceof Error ? error.message : 'Unknown error',
    });
  });

  return app;
}

export default buildServer;
