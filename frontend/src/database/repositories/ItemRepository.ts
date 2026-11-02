import { getDatabase } from '../database';

export interface Item {
  id: string;
  shopId: string;
  productId: string;
  publicIdentifier: string;
  uniqueQrCode: string;
  status: 'IN_STOCK' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'LOST';
  costPrice: string;
  sellingPrice: string;
  registeredAt: string;
  soldAt?: string;
  createdByUserId?: string;
  syncedAt?: string;
}

export class ItemRepository {
  async upsert(item: Item): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO items 
       (id, shop_id, product_id, public_identifier, unique_qr_code, status, cost_price, selling_price, registered_at, sold_at, created_by_user_id, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.shopId,
        item.productId,
        item.publicIdentifier,
        item.uniqueQrCode,
        item.status,
        item.costPrice,
        item.sellingPrice,
        item.registeredAt,
        item.soldAt || null,
        item.createdByUserId || null,
        item.syncedAt || new Date().toISOString(),
      ]
    );
  }

  async getById(id: string): Promise<Item | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM items WHERE id = ?',
      [id]
    );
    return result ? this.mapFromDb(result) : null;
  }

  async getByQrCode(qrCode: string): Promise<Item | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM items WHERE unique_qr_code = ?',
      [qrCode]
    );
    return result ? this.mapFromDb(result) : null;
  }

  async getByShopId(shopId: string, status?: string): Promise<Item[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM items WHERE shop_id = ?';
    const params: any[] = [shopId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY registered_at DESC';
    
    const results = await db.getAllAsync<any>(query, params);
    return results.map(r => this.mapFromDb(r));
  }

  async getByProductId(productId: string): Promise<Item[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM items WHERE product_id = ? ORDER BY registered_at DESC',
      [productId]
    );
    return results.map(r => this.mapFromDb(r));
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
  }

  private mapFromDb(row: any): Item {
    return {
      id: row.id,
      shopId: row.shop_id,
      productId: row.product_id,
      publicIdentifier: row.public_identifier,
      uniqueQrCode: row.unique_qr_code,
      status: row.status,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
      registeredAt: row.registered_at,
      soldAt: row.sold_at,
      createdByUserId: row.created_by_user_id,
      syncedAt: row.synced_at,
    };
  }
}

export const itemRepository = new ItemRepository();
