import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../src/app.js';

let app: Awaited<ReturnType<typeof buildServer>>;

describe('Store Management backend', () => {
  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a healthy API status from /health', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      status: 'healthy',
    });
  });

  it('requires authentication for protected shop routes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/shops',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: 'Unauthorized',
    });
  });
});
