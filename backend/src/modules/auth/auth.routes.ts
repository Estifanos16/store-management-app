import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'node:crypto';
import * as argon2 from 'argon2';
import prisma from '../../lib/prisma.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  shopName: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  currency: z.string().default('ETB'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(16),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const serializeUser = (user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    active: user.active,
    memberships: user.memberships?.map((membership: any) => ({
      shopId: membership.shopId,
      role: membership.role,
      shop: membership.shop,
    })) ?? [],
  });

  const createTokenPair = async (userId: string) => {
    const accessToken = fastify.jwt.sign({ sub: userId }, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  };

  const findValidRefreshToken = async (token: string) => {
    const records = await prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    for (const record of records) {
      const valid = await argon2.verify(record.tokenHash, token).catch(() => false);
      if (valid) {
        return record;
      }
    }

    return null;
  };

  fastify.post('/register', async (request, reply) => {
    const payload = registerSchema.parse(request.body);
    const email = payload.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      reply.code(409).send({ error: 'Conflict', message: 'An account with that email already exists.' });
      return;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const shop = await tx.shop.create({
        data: {
          name: payload.shopName,
          address: payload.address,
          phone: payload.phone,
          currency: payload.currency,
        },
      });

      const user = await tx.user.create({
        data: {
          name: payload.name,
          email,
          passwordHash: await argon2.hash(payload.password),
          memberships: {
            create: [{ shopId: shop.id, role: 'OWNER' }],
          },
        },
        include: {
          memberships: {
            include: { shop: true },
          },
        },
      });

      const tokenPair = await createTokenPair(user.id);
      return { user: serializeUser(user), ...tokenPair };
    });

    reply.code(201).send(result);
  });

  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: {
        memberships: {
          where: { active: true },
          include: { shop: true },
        },
      },
    });

    if (!user || !(await argon2.verify(user.passwordHash, body.password))) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Invalid credentials.' });
      return;
    }

    const tokenPair = await createTokenPair(user.id);
    reply.send({ user: serializeUser(user), ...tokenPair });
  });

  fastify.post('/refresh', async (request, reply) => {
    const payload = refreshSchema.parse(request.body);
    const validToken = await findValidRefreshToken(payload.refreshToken);

    if (!validToken) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Refresh token is invalid or expired.' });
      return;
    }

    const newPair = await createTokenPair(validToken.userId);
    await prisma.refreshToken.update({
      where: { id: validToken.id },
      data: { revokedAt: new Date() },
    });

    reply.send({ accessToken: newPair.accessToken, refreshToken: newPair.refreshToken });
  });

  fastify.post('/logout', async (request, reply) => {
    await fastify.requireAuth(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const body = request.body as { refreshToken?: string } | undefined;
    const valid = body?.refreshToken
      ? await findValidRefreshToken(body.refreshToken)
      : null;

    if (body?.refreshToken && valid) {
      await prisma.refreshToken.update({
        where: { id: valid.id },
        data: { revokedAt: new Date() },
      });
    } else if (!body?.refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { userId: requestUser.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    reply.send({ success: true, message: 'Logged out successfully.' });
  });

  fastify.get('/me', async (request, reply) => {
    await fastify.requireAuth(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: requestUser.id },
      include: {
        memberships: { where: { active: true }, include: { shop: true } },
      },
    });

    if (!user) {
      reply.code(404).send({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    reply.send(serializeUser(user));
  });
};

export default authRoutes;
