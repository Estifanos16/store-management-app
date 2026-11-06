import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';

const state = vi.hoisted(() => ({
  lockedItem: null as any,
  productRow: null as any,
  itemRow: null as any,
  saleItemCreates: [] as any[],
  itemUpdates: [] as any[],
  movementCreates: [] as any[],
  saleCreates: [] as any[],
  salesRows: [] as any[],
  expenseAggregate: { _sum: { amount: 0 } } as any,
  itemCounts: {} as Record<string, number>,
}));

vi.mock('../src/lib/prisma.js', () => {
  const tx = {
    $queryRaw: vi.fn(async () => [state.lockedItem].filter(Boolean)),
    product: {
      findUnique: vi.fn(async () => state.productRow),
    },
    item: {
      findUnique: vi.fn(async () => state.itemRow),
      update: vi.fn(async ({ data }: any) => {
        state.itemUpdates.push(data);
        return data;
      }),
    },
    sale: {
      create: vi.fn(async ({ data }: any) => {
        state.saleCreates.push(data);
        return { id: 'sale-1', ...data };
      }),
      findUnique: vi.fn(async () => ({
        id: 'sale-1',
        totalAmount: 105,
        discount: 10,
        saleItems: [],
      })),
    },
    saleItem: {
      create: vi.fn(async ({ data }: any) => {
        state.saleItemCreates.push(data);
        return data;
      }),
    },
    inventoryMovement: {
      create: vi.fn(async ({ data }: any) => {
        state.movementCreates.push(data);
        return data;
      }),
    },
  };

  return {
    default: {
      user: {
        findUnique: vi.fn(async () => ({
          id: 'user-1',
          name: 'Owner',
          email: 'owner@shop.com',
          active: true,
          memberships: [
            {
              shopId: 'shop-1',
              role: 'OWNER',
              active: true,
              shop: { id: 'shop-1', name: 'Shop', currency: 'ETB' },
            },
          ],
        })),
      },
      $transaction: vi.fn(async (cb: any) => cb(tx)),
      item: {
        count: vi.fn(async ({ where }: any) => {
          if (!where.status) return state.itemCounts.total ?? 0;
          return state.itemCounts[where.status] ?? 0;
        }),
      },
      sale: {
        findMany: vi.fn(async () => state.salesRows),
        aggregate: vi.fn(async () => ({ _sum: { totalAmount: 305 } })),
      },
      expense: {
        aggregate: vi.fn(async () => state.expenseAggregate),
      },
    },
  };
});

import { buildServer } from '../src/app.js';

let app: Awaited<ReturnType<typeof buildServer>>;
let token: string;

const baseItem = {
  id: 'item-1',
  shopId: 'shop-1',
  productId: 'prod-1',
  status: 'IN_STOCK',
  costPrice: 80,
  sellingPrice: 120,
};

const resetState = () => {
  state.saleItemCreates.length = 0;
  state.itemUpdates.length = 0;
  state.movementCreates.length = 0;
  state.saleCreates.length = 0;
  state.lockedItem = { ...baseItem };
  state.itemRow = { ...baseItem };
  state.productRow = { id: 'prod-1', defaultSellingPrice: 100 };
};

describe('Sales and profit calculations', () => {
  beforeAll(async () => {
    app = await buildServer();
    token = app.jwt.sign({ sub: 'user-1' });
  });

  afterAll(async () => {
    await app.close();
  });

  const postSale = (payload: any) =>
    app.inject({
      method: 'POST',
      url: '/api/sales',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload,
    });

  it('records costPrice, sellingPrice, discounts, and quantity on each SaleItem', async () => {
    resetState();
    const response = await postSale({
      shopId: 'shop-1',
      paymentMethod: 'CASH',
      discount: 10,
      items: [{ itemId: 'item-1', discount: 5 }],
    });

    expect(response.statusCode).toBe(201);
    expect(state.saleCreates).toHaveLength(1);
    // lineTotal = 120 - 5 = 115; grandTotal = 115 - 10 = 105
    expect(state.saleCreates[0].totalAmount).toBe(105);
    expect(state.saleCreates[0].discount).toBe(10);

    expect(state.saleItemCreates).toHaveLength(1);
    const line = state.saleItemCreates[0];
    expect(line.costPrice).toBe(80); // snapshot of item cost at sale time
    expect(line.sellingPrice).toBe(120); // resolved unit price
    expect(line.discount).toBe(5);
    expect(line.totalAmount).toBe(115);
    expect(line.quantity).toBe(1);

    expect(state.movementCreates).toHaveLength(1);
    expect(state.movementCreates[0].toStatus).toBe('SOLD');
  });

  it('falls back to product defaultSellingPrice when item has no sellingPrice', async () => {
    resetState();
    state.lockedItem.sellingPrice = null;
    state.itemRow.sellingPrice = null;

    const response = await postSale({
      shopId: 'shop-1',
      items: [{ itemId: 'item-1' }],
    });

    expect(response.statusCode).toBe(201);
    expect(state.saleItemCreates[0].sellingPrice).toBe(100);
    expect(state.saleItemCreates[0].totalAmount).toBe(100);
    expect(state.saleCreates[0].totalAmount).toBe(100);
  });

  it('rejects selling an already-sold item', async () => {
    resetState();
    state.lockedItem.status = 'SOLD';

    const response = await postSale({
      shopId: 'shop-1',
      items: [{ itemId: 'item-1' }],
    });

    expect(response.statusCode).toBe(500);
    expect(state.saleCreates).toHaveLength(0);
    expect(state.saleItemCreates).toHaveLength(0);
  });

  it('rejects selling an item from another shop', async () => {
    resetState();
    state.lockedItem.shopId = 'shop-other';

    const response = await postSale({
      shopId: 'shop-1',
      items: [{ itemId: 'item-1' }],
    });

    expect(response.statusCode).toBe(500);
    expect(state.saleCreates).toHaveLength(0);
  });

  it('rejects a discount that exceeds the item selling price with 400', async () => {
    resetState();
    const response = await postSale({
      shopId: 'shop-1',
      items: [{ itemId: 'item-1', discount: 999 }],
    });

    expect(response.statusCode).toBe(400);
    expect(state.saleCreates).toHaveLength(0);
    expect(state.saleItemCreates).toHaveLength(0);
  });

  it('allows a discount equal to the selling price (zero line total)', async () => {
    resetState();
    const response = await postSale({
      shopId: 'shop-1',
      items: [{ itemId: 'item-1', discount: 120 }],
    });

    expect(response.statusCode).toBe(201);
    expect(state.saleItemCreates[0].totalAmount).toBe(0);
    expect(state.saleCreates[0].totalAmount).toBe(0);
  });

  it('computes profit report with quantity-aware COGS', async () => {
    state.salesRows = [
      {
        id: 'sale-a',
        totalAmount: 105,
        saleItems: [{ costPrice: 80, quantity: 1, sellingPrice: 120 }],
      },
      {
        id: 'sale-b',
        totalAmount: 200,
        saleItems: [
          { costPrice: 50, quantity: 2, sellingPrice: 100 },
          { costPrice: 30, quantity: 1, sellingPrice: 60 },
        ],
      },
    ];
    state.expenseAggregate = { _sum: { amount: 40 } };

    const response = await app.inject({
      method: 'GET',
      url: '/api/reports/profit?shopId=shop-1',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    // revenue = 105 + 200 = 305
    // COGS = 80*1 + 50*2 + 30*1 = 210
    // grossProfit = 305 - 210 = 95; netProfit = 95 - 40 = 55
    expect(body.totalRevenue).toBe(305);
    expect(body.costOfGoodsSold).toBe(210);
    expect(body.grossProfit).toBe(95);
    expect(body.expenses).toBe(40);
    expect(body.netProfit).toBe(55);
  });
});
