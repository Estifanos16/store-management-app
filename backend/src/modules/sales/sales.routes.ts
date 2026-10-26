import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const saleCreateSchema = z.object({
  shopId: z.string().min(1),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER']).default('CASH'),
  discount: z.number().min(0).default(0),
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      unitPrice: z.number().positive().optional(),
      discount: z.number().min(0).optional(),
    }),
  ).min(1),
});

const salesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/sales', async (request, reply) => {
    const shopId = (request.query as any)?.shopId as string | undefined;
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const sales = await prisma.sale.findMany({
      where: { shopId },
      include: {
        saleItems: { include: { item: true, product: true } },
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    reply.send({ sales });
  });

  fastify.post('/sales', async (request, reply) => {
    const payload = saleCreateSchema.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);
    const requestUser = (request as any).user as any;
    if (!requestUser) {
      reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      let totalAmount = 0;
      const itemRecords: any[] = [];

      for (const entry of payload.items) {
        const locked = await tx.$queryRaw<any[]>`SELECT * FROM "Item" WHERE id = ${entry.itemId} FOR UPDATE`;
        const item = locked[0];
        if (!item) {
          throw new Error(`Item ${entry.itemId} not found.`);
        }
        if (item.shopId !== payload.shopId) {
          throw new Error(`Item ${entry.itemId} does not belong to the caller’s shop.`);
        }
        if (item.status !== 'IN_STOCK') {
          throw new Error(`Item ${entry.itemId} is not available for sale.`);
        }

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const unitPrice = entry.unitPrice ?? item.sellingPrice ?? product?.defaultSellingPrice ?? 0;
        const itemDiscount = entry.discount ?? 0;
        const lineTotal = Number(unitPrice) - Number(itemDiscount);
        totalAmount += lineTotal;

        itemRecords.push({ itemId: item.id, productId: item.productId, unitPrice, itemDiscount, lineTotal });
      }

      const totalDiscount = Number(payload.discount) || 0;
      const grandTotal = Math.max(totalAmount - totalDiscount, 0);

      const sale = await tx.sale.create({
        data: {
          shopId: payload.shopId,
          sellerId: requestUser.id,
          saleNumber: `SALE-${Date.now()}`,
          status: 'COMPLETED',
          paymentMethod: payload.paymentMethod,
          discount: totalDiscount,
          totalAmount: grandTotal,
        },
      });

      for (const record of itemRecords) {
        const item = await tx.item.findUnique({ where: { id: record.itemId }, include: { product: true } });
        if (!item) {
          throw new Error(`Item ${record.itemId} could not be located during sale finalization.`);
        }

        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            itemId: record.itemId,
            productId: record.productId,
            unitPrice: record.unitPrice,
            discount: record.itemDiscount,
            totalAmount: record.lineTotal,
          },
        });

        await tx.item.update({
          where: { id: record.itemId },
          data: {
            status: 'SOLD',
            soldAt: new Date(),
          },
        });

        await tx.inventoryMovement.create({
          data: {
            shopId: payload.shopId,
            itemId: record.itemId,
            fromStatus: 'IN_STOCK',
            toStatus: 'SOLD',
            reason: 'Sold through POS',
            performedByUserId: requestUser.id,
          },
        });
      }

      return tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          seller: true,
          saleItems: {
            include: { item: { include: { product: true } } },
          },
        },
      });
    });

    reply.code(201).send({ sale: result });
  });

  fastify.get('/sales/:saleId', async (request, reply) => {
    const { saleId } = request.params as { saleId: string };
    const shopId = (request.query as any)?.shopId as string | undefined;
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, shopId },
      include: {
        seller: true,
        saleItems: {
          include: { item: true, product: true },
        },
      },
    });

    if (!sale) {
      reply.code(404).send({ error: 'Not Found', message: 'Sale not found.' });
      return;
    }

    reply.send({ sale });
  });
};

export default salesRoutes;
