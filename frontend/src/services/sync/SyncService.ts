import { syncOperationRepository } from '../../database/repositories/SyncOperationRepository';
import { pendingSaleRepository } from '../../database/repositories/PendingSaleRepository';
import { salesApi } from '../api/salesApi';
import { itemsApi } from '../api/itemsApi';
import { productsApi } from '../api/productsApi';

export class SyncService {
  private isSyncing = false;
  private syncInterval: any = null;

  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing) return;
    
    // Simple check - will be replaced with proper network status hook in component
    const isConnected = true; 
    if (!isConnected) {
      console.log('Network not available, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      // Sync pending sales
      await this.syncPendingSales();
      
      // Sync other operations
      await this.syncPendingOperations();
      
      // Clean up completed operations
      await syncOperationRepository.deleteCompleted();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncPendingSales(): Promise<void> {
    const pendingSales = await pendingSaleRepository.getPendingSync();
    
    for (const sale of pendingSales) {
      try {
        const saleData = {
          shopId: sale.shopId,
          paymentMethod: sale.paymentMethod,
          items: sale.items.map(item => ({
            itemId: item.itemId,
            unitPrice: parseFloat(item.unitPrice),
          })),
        };

        const result = await salesApi.createSale(saleData);
        
        // Mark as synced
        await pendingSaleRepository.updateSyncStatus(sale.id, 'SYNCED');
        
        // Create sync operation record
        await syncOperationRepository.create({
          id: `sync-sale-${sale.id}`,
          operationType: 'CREATE',
          entityType: 'SALE',
          entityId: result.sale.id,
          status: 'COMPLETED',
          createdAt: sale.createdAt,
          completedAt: new Date().toISOString(),
          retryCount: 0,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await pendingSaleRepository.updateSyncStatus(sale.id, 'FAILED', errorMessage);
        
        // Retry if error count is low
        if (sale.retryCount < 3) {
          await syncOperationRepository.create({
            id: `sync-sale-${sale.id}`,
            operationType: 'CREATE',
            entityType: 'SALE',
            entityId: sale.id,
            status: 'PENDING',
            createdAt: sale.createdAt,
            errorMessage,
            retryCount: sale.retryCount + 1,
          });
        }
      }
    }
  }

  private async syncPendingOperations(): Promise<void> {
    const operations = await syncOperationRepository.getPending();
    
    for (const operation of operations) {
      try {
        switch (operation.entityType) {
          case 'PRODUCT':
            await this.syncProduct(operation);
            break;
          case 'ITEM':
            await this.syncItem(operation);
            break;
          default:
            console.log(`Unsupported sync operation type: ${operation.entityType}`);
        }
        
        await syncOperationRepository.updateStatus(operation.id, 'COMPLETED');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await syncOperationRepository.updateStatus(operation.id, 'FAILED', errorMessage);
      }
    }
  }

  private async syncProduct(operation: any): Promise<void> {
    const payload = operation.payload ? JSON.parse(operation.payload) : null;
    
    if (operation.operationType === 'CREATE' || operation.operationType === 'UPDATE') {
      // Skip for now - product update logic needs proper typing
      console.log('Sync product:', operation.entityId);
    } else if (operation.operationType === 'DELETE') {
      // Products typically aren't deleted, just archived
      await productsApi.updateProduct(operation.entityId, { archived: true });
    }
  }

  private async syncItem(operation: any): Promise<void> {
    const payload = operation.payload ? JSON.parse(operation.payload) : null;
    
    if (operation.operationType === 'UPDATE') {
      await itemsApi.updateItemStatus(operation.entityId, payload);
    }
  }

  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.syncPendingOperations();
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const syncService = new SyncService();
