import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import prisma from '../../lib/prisma.js';

const expenseSchema = z.object({
  shopId: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(3),
  amount: z.number().positive(),
  expenseDate: z.string().datetime().optional(),
});

const expensesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/expenses', async (request, reply) => {
    const shopId = (request.query as any)?.shopId as string | undefined;
    if (!shopId) {
      reply.code(400).send({ error: 'Bad Request', message: 'shopId is required.' });
      return;
    }

    await fastify.requireShopAccess(shopId)(request, reply);
    const expenses = await prisma.expense.findMany({
      where: { shopId },
      orderBy: { expenseDate: 'desc' },
    });

    reply.send({ expenses });
  });

  fastify.post('/expenses', async (request, reply) => {
    const payload = expenseSchema.parse(request.body);
    await fastify.requireShopAccess(payload.shopId)(request, reply);

    const expense = await prisma.expense.create({
      data: {
        shopId: payload.shopId,
        category: payload.category,
        description: payload.description,
        amount: payload.amount,
        expenseDate: payload.expenseDate ? new Date(payload.expenseDate) : new Date(),
      },
    });

    reply.code(201).send({ expense });
  });
};

export default expensesRoutes;
