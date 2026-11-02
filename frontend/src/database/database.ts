import * as SQLite from 'expo-sqlite';

const DB_NAME = 'store_management.db';

export interface Database {
  db: SQLite.SQLiteDatabase;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  
  await initializeDatabase(dbInstance);
  
  return dbInstance;
}

async function initializeDatabase(db: SQLite.SQLiteDatabase) {
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Products table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      category_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      brand TEXT,
      default_selling_price TEXT NOT NULL,
      archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );
  `);

  // Items table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      public_identifier TEXT NOT NULL,
      unique_qr_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      cost_price TEXT NOT NULL,
      selling_price TEXT NOT NULL,
      registered_at TEXT NOT NULL,
      sold_at TEXT,
      created_by_user_id TEXT,
      synced_at TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);

  // Local sales queue (for offline sales)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pending_sales (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      sale_number TEXT,
      total_amount TEXT NOT NULL,
      total_cost TEXT NOT NULL,
      profit TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      items_json TEXT NOT NULL,
      sync_status TEXT DEFAULT 'PENDING',
      sync_error TEXT,
      retry_count INTEGER DEFAULT 0,
      FOREIGN KEY (shop_id) REFERENCES shops(id)
    );
  `);

  // Pending sale items
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pending_sale_items (
      id TEXT PRIMARY KEY,
      pending_sale_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price TEXT NOT NULL,
      total_price TEXT NOT NULL,
      cost_price TEXT NOT NULL,
      FOREIGN KEY (pending_sale_id) REFERENCES pending_sales(id) ON DELETE CASCADE
    );
  `);

  // Sync operations log
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_operations (
      id TEXT PRIMARY KEY,
      operation_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      payload TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      completed_at TEXT,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0
    );
  `);

  // Shops table (for caching)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      currency TEXT NOT NULL,
      synced_at TEXT
    );
  `);

  // Categories table (for caching)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      synced_at TEXT
    );
  `);

  // Create indexes for better performance
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_items_product_id ON items(product_id);
    CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
    CREATE INDEX IF NOT EXISTS idx_items_qr_code ON items(unique_qr_code);
    CREATE INDEX IF NOT EXISTS idx_pending_sales_sync_status ON pending_sales(sync_status);
    CREATE INDEX IF NOT EXISTS idx_sync_operations_status ON sync_operations(status);
  `);
}

export async function closeDatabase() {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}
