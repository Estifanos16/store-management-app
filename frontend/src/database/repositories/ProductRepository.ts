import { getDatabase } from '../database';

export interface Product {
  id: string;
  shopId: string;
  categoryId?: string;
  name: string;
  description?: string;
  brand?: string;
  defaultSellingPrice: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
}

export class ProductRepository {
  async upsert(product: Product): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO products 
       (id, shop_id, category_id, name, description, brand, default_selling_price, archived, created_at, updated_at, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.shopId,
        product.categoryId || null,
        product.name,
        product.description || null,
        product.brand || null,
        product.defaultSellingPrice,
        product.archived ? 1 : 0,
        product.createdAt,
        product.updatedAt,
        product.syncedAt || new Date().toISOString(),
      ]
    );
  }

  async getById(id: string): Promise<Product | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return result ? this.mapFromDb(result) : null;
  }

  async getByShopId(shopId: string): Promise<Product[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM products WHERE shop_id = ? AND archived = 0 ORDER BY created_at DESC',
      [shopId]
    );
    return results.map(r => this.mapFromDb(r));
  }

  async search(query: string, shopId: string): Promise<Product[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<any>(
      `SELECT * FROM products 
       WHERE shop_id = ? AND archived = 0 
       AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)
       ORDER BY created_at DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return results.map(r => this.mapFromDb(r));
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  }

  async deleteByShopId(shopId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM products WHERE shop_id = ?', [shopId]);
  }

  private mapFromDb(row: any): Product {
    return {
      id: row.id,
      shopId: row.shop_id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      brand: row.brand,
      defaultSellingPrice: row.default_selling_price,
      archived: row.archived === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      syncedAt: row.synced_at,
    };
  }
}

export const productRepository = new ProductRepository();
