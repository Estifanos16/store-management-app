import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'node:crypto';
import prisma from '../../lib/prisma.js';

const getShopId = (request: any) => {
  const shopId = request.query?.shopId ?? request.body?.shopId ?? request.params?.shopId;
  return typeof shopId === 'string' ? shopId : undefined;
};

const itemCreateSchema = z.object({
  shopId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(1000),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative().optional(),
  createdByUserId: z.string().optional(),
});

const itemStatusSchema = z.object({
  shopId: z.string().min(1),
  status: z.enum(['IN_STOCK', 'SOLD', 'RETURNED', 'DAMAGED']),
  reason: z.string().optional(),
});

const itemsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/items', async (request, reply) => {
    const shopId = getShopId(request);
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const status = (request.query as any)?.status as string | undefined;

    const items = await prisma.item.findMany({
      where: {
        shopId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        product: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    reply.send({ items });
  });

  fastify.post('/items', async (request, reply) => {
    const payload = itemCreateSchema.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const product = await prisma.product.findFirst({ where: { id: payload.productId, shopId: payload.shopId } });
    if (!product) {
      reply.code(404).send({ error: 'Not Found', message: 'Product not found in the selected shop.' });
      return;
    }

    const created = await prisma.$transaction(async (tx: any) => {
      const records: any[] = [];
      for (let index = 0; index < payload.quantity; index += 1) {
        const publicIdentifier = `ITEM-${Date.now()}-${index + 1}`;
        const uniqueQrCode = `QR-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

        const item = await tx.item.create({
          data: {
            shopId: payload.shopId,
            productId: payload.productId,
            publicIdentifier,
            uniqueQrCode,
            costPrice: payload.costPrice,
            sellingPrice: payload.sellingPrice ?? product.defaultSellingPrice,
            createdByUserId: payload.createdByUserId ?? requestUser.id,
            status: 'IN_STOCK',
          },
          include: { product: true },
        });

        records.push(item);
      }

      return records;
    });

    reply.code(201).send({ items: created, count: created.length });
  });

  fastify.get('/items/:itemId', async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const shopId = getShopId(request);
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const item = await prisma.item.findFirst({
      where: { id: itemId, shopId },
      include: {
        product: true,
        createdBy: true,
      },
    });

    if (!item) {
      reply.code(404).send({ error: 'Not Found', message: 'Item not found.' });
      return;
    }

    reply.send({ item });
  });

  fastify.patch('/items/:itemId/status', async (request, reply) => {
    const { itemId } = request.params as { itemId: string };
    const payload = itemStatusSchema.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const item = await prisma.item.findFirst({
      where: { id: itemId, shopId: payload.shopId },
    });

    if (!item) {
      reply.code(404).send({ error: 'Not Found', message: 'Item not found.' });
      return;
    }

    const nextStatus = payload.status;
    const updateData: any = { status: nextStatus };
    if (nextStatus === 'SOLD') {
      updateData.soldAt = new Date();
    }
    if (nextStatus === 'RETURNED') {
      updateData.soldAt = item.soldAt ?? item.soldAt;
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
      include: { product: true },
    });

    await prisma.inventoryMovement.create({
      data: {
        shopId: payload.shopId,
        itemId: item.id,
        fromStatus: item.status,
        toStatus: nextStatus,
        reason: payload.reason ?? 'Status update',
        performedByUserId: requestUser.id,
      },
    });

    reply.send({ item: updated });
  });
};

export default itemsRoutes;
