import { getDatabase } from '../database';

export interface PendingSale {
  id: string;
  shopId: string;
  saleNumber?: string;
  totalAmount: string;
  totalCost: string;
  profit: string;
  paymentMethod: 'CASH' | 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: string;
  items: PendingSaleItem[];
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  syncError?: string;
  retryCount: number;
}

export interface PendingSaleItem {
  id: string;
  pendingSaleId: string;
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  costPrice: string;
}

export class PendingSaleRepository {
  async create(sale: PendingSale): Promise<void> {
    const db = await getDatabase();
    
    await db.runAsync(
      `INSERT INTO pending_sales 
       (id, shop_id, sale_number, total_amount, total_cost, profit, payment_method, status, created_at, items_json, sync_status, sync_error, retry_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sale.id,
        sale.shopId,
        sale.saleNumber || null,
        sale.totalAmount,
        sale.totalCost,
        sale.profit,
        sale.paymentMethod,
        sale.status,
        sale.createdAt,
        JSON.stringify(sale.items),
        sale.syncStatus,
        sale.syncError || null,
        sale.retryCount,
      ]
    );

    // Insert sale items
    for (const item of sale.items) {
      await db.runAsync(
        `INSERT INTO pending_sale_items 
         (id, pending_sale_id, item_id, product_id, product_name, quantity, unit_price, total_price, cost_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          sale.id,
          item.itemId,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          item.costPrice,
        ]
      );
    }
  }

  async getById(id: string): Promise<PendingSale | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM pending_sales WHERE id = ?',
      [id]
    );
    
    if (!result) return null;
    
    const items = await db.getAllAsync<any>(
      'SELECT * FROM pending_sale_items WHERE pending_sale_id = ?',
      [id]
    );
    
    return this.mapFromDb(result, items);
  }

  async getPendingSync(): Promise<PendingSale[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM pending_sales WHERE sync_status = ? ORDER BY created_at ASC',
      ['PENDING']
    );
    
    const sales: PendingSale[] = [];
    for (const result of results) {
      const items = await db.getAllAsync<any>(
        'SELECT * FROM pending_sale_items WHERE pending_sale_id = ?',
        [result.id]
      );
      sales.push(this.mapFromDb(result, items));
    }
    
    return sales;
  }

  async updateSyncStatus(id: string, status: 'PENDING' | 'SYNCED' | 'FAILED', error?: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE pending_sales SET sync_status = ?, sync_error = ?, retry_count = retry_count + 1 WHERE id = ?',
      [status, error || null, id]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM pending_sales WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM pending_sale_items WHERE pending_sale_id = ?', [id]);
  }

  private mapFromDb(row: any, items: any[]): PendingSale {
    return {
      id: row.id,
      shopId: row.shop_id,
      saleNumber: row.sale_number,
      totalAmount: row.total_amount,
      totalCost: row.total_cost,
      profit: row.profit,
      paymentMethod: row.payment_method,
      status: row.status,
      createdAt: row.created_at,
      items: items.map(i => ({
        id: i.id,
        pendingSaleId: i.pending_sale_id,
        itemId: i.item_id,
        productId: i.product_id,
        productName: i.product_name,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        totalPrice: i.total_price,
        costPrice: i.cost_price,
      })),
      syncStatus: row.sync_status,
      syncError: row.sync_error,
      retryCount: row.retry_count,
    };
  }
}

export const pendingSaleRepository = new PendingSaleRepository();
