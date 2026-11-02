import { describe, it, expect, beforeEach } from '@jest/globals';
import { ProductRepository } from '../database/repositories/ProductRepository';

describe('ProductRepository', () => {
  let repository: ProductRepository;

  beforeEach(() => {
    repository = new ProductRepository();
  });

  it('should create and retrieve a product', async () => {
    const product = {
      id: 'test-1',
      shopId: 'shop-1',
      name: 'Test Product',
      defaultSellingPrice: '100.00',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repository.upsert(product);
    const retrieved = await repository.getById('test-1');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Test Product');
  });

  it('should return null for non-existent product', async () => {
    const retrieved = await repository.getById('non-existent');
    expect(retrieved).toBeNull();
  });
});
