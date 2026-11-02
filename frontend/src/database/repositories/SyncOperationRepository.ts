import { getDatabase } from '../database';

export interface SyncOperation {
  id: string;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'PRODUCT' | 'ITEM' | 'SALE' | 'EXPENSE' | 'RETURN';
  entityId: string;
  payload?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
}

export class SyncOperationRepository {
  async create(operation: SyncOperation): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO sync_operations 
       (id, operation_type, entity_type, entity_id, payload, status, created_at, error_message, retry_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operation.id,
        operation.operationType,
        operation.entityType,
        operation.entityId,
        operation.payload || null,
        operation.status,
        operation.createdAt,
        operation.errorMessage || null,
        operation.retryCount,
      ]
    );
  }

  async getPending(): Promise<SyncOperation[]> {
    const db = await getDatabase();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM sync_operations WHERE status = ? ORDER BY created_at ASC',
      ['PENDING']
    );
    return results.map(r => this.mapFromDb(r));
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'COMPLETED' | 'FAILED',
    error?: string
  ): Promise<void> {
    const db = await getDatabase();
    const completedAt = status === 'COMPLETED' ? new Date().toISOString() : null;
    
    await db.runAsync(
      `UPDATE sync_operations 
       SET status = ?, completed_at = ?, error_message = ?, retry_count = retry_count + 1 
       WHERE id = ?`,
      [status, completedAt, error || null, id]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM sync_operations WHERE id = ?', [id]);
  }

  async deleteCompleted(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM sync_operations WHERE status = 'COMPLETED'");
  }

  private mapFromDb(row: any): SyncOperation {
    return {
      id: row.id,
      operationType: row.operation_type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload,
      status: row.status,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      errorMessage: row.error_message,
      retryCount: row.retry_count,
    };
  }
}

export const syncOperationRepository = new SyncOperationRepository();
