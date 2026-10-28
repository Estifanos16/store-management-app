import { FastifyPluginAsync } from 'fastify';
import prisma from '../../lib/prisma.js';

const reportsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/reports/dashboard', {
    schema: {
      tags: ['Reports'],
      summary: 'Dashboard summary',
      description: 'Returns summary inventory and financial metrics for the selected shop.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { shopId: { type: 'string' }, inventory: { type: 'object' }, financials: { type: 'object' } } },
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

    const [totalItems, inStock, sold, returned, damaged, totalSales, totalExpenses] = await Promise.all([
      prisma.item.count({ where: { shopId } }),
      prisma.item.count({ where: { shopId, status: 'IN_STOCK' } }),
      prisma.item.count({ where: { shopId, status: 'SOLD' } }),
      prisma.item.count({ where: { shopId, status: 'RETURNED' } }),
      prisma.item.count({ where: { shopId, status: 'DAMAGED' } }),
      prisma.sale.aggregate({ where: { shopId }, _sum: { totalAmount: true } }),
      prisma.expense.aggregate({ where: { shopId }, _sum: { amount: true } }),
    ]);

    const revenue = Number(totalSales._sum.totalAmount ?? 0);
    const expenses = Number(totalExpenses._sum.amount ?? 0);

    reply.send({
      shopId,
      inventory: {
        totalItems,
        inStock,
        sold,
        returned,
        damaged,
      },
      financials: {
        revenue,
        expenses,
        netProfit: revenue - expenses,
      },
    });
  });

  fastify.get('/reports/profit', {
    schema: {
      tags: ['Reports'],
      summary: 'Profit report',
      description: 'Calculates revenue, cost of goods sold, gross profit, and net profit for a shop.',
      querystring: {
        type: 'object',
        required: ['shopId'],
        properties: { shopId: { type: 'string' } },
      },
      response: {
        200: { type: 'object', properties: { shopId: { type: 'string' }, totalRevenue: { type: 'number' }, costOfGoodsSold: { type: 'number' }, grossProfit: { type: 'number' }, expenses: { type: 'number' }, netProfit: { type: 'number' } } },
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

    const sales = await prisma.sale.findMany({
      where: { shopId },
      include: { saleItems: true },
    });

    const totalRevenue = sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);
    const costOfGoodsSold = sales.reduce((sum: number, sale: any) => {
      const soldItemsCost = sale.saleItems.reduce((inner: number, item: any) => inner + Number(item.unitPrice), 0);
      return sum + soldItemsCost;
    }, 0);

    const totalExpenses = await prisma.expense.aggregate({ where: { shopId }, _sum: { amount: true } });
    const expensesValue = Number(totalExpenses._sum.amount ?? 0);

    reply.send({
      shopId,
      totalRevenue,
      costOfGoodsSold,
      grossProfit: totalRevenue - costOfGoodsSold,
      expenses: expensesValue,
      netProfit: totalRevenue - costOfGoodsSold - expensesValue,
    });
  });
};

export default reportsRoutes;
