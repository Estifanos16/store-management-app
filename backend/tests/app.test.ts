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

  it('registers the Swagger UI and OpenAPI JSON endpoints', async () => {
    const uiResponse = await app.inject({
      method: 'GET',
      url: '/api-docs',
    });
    expect(uiResponse.statusCode).toBe(200);

    const docResponse = await app.inject({
      method: 'GET',
      url: '/api-docs/json',
    });

    expect(docResponse.statusCode).toBe(200);
    const payload = docResponse.json();
    expect(payload.info.title).toBe('Store Management API');
    expect(payload.openapi).toBe('3.0.3');
    expect(payload.paths['/health']).toBeDefined();
    expect(payload.paths['/health'].get.security).toEqual([]);

    const login = payload.paths['/api/auth/login'].post;
    expect(login.security).toEqual([]);
    expect(login.requestBody.required).toBe(true);
    expect(login.requestBody.content['application/json'].schema).toMatchObject({
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
      },
    });
    expect(login.requestBody.content['application/json'].example).toEqual({
      email: 'admin@example.com',
      password: 'your-password',
    });
    expect(payload.paths['/api/auth/refresh'].post.security).toEqual([]);

    const writeEndpoints = [
      ['/api/auth/register', 'post'],
      ['/api/auth/refresh', 'post'],
      ['/api/auth/logout', 'post'],
      ['/api/products', 'post'],
      ['/api/products/{productId}', 'patch'],
      ['/api/items', 'post'],
      ['/api/items/{itemId}/status', 'patch'],
      ['/api/sales', 'post'],
      ['/api/returns', 'post'],
      ['/api/expenses', 'post'],
      ['/api/sync/operations', 'post'],
    ] as const;

    for (const [path, method] of writeEndpoints) {
      expect(payload.paths[path][method].requestBody.content['application/json']).toBeDefined();
    }
  });

  it('validates required login fields before calling authentication logic', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toContain('email');
  });
});
