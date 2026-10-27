import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { env } from './env.js';

const openApiDocument = {
  openapi: '3.0.3' as const,
  info: {
    title: 'Store Management API',
    version: '1.0.0',
    description: 'REST API for the Store Management App with inventory, sales, reports, and offline sync support.',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health checks' },
    { name: 'Auth', description: 'Registration, login, and account endpoints' },
    { name: 'Shops', description: 'Shop membership and details' },
    { name: 'Products', description: 'Product catalog management' },
    { name: 'Items', description: 'Inventory item management' },
    { name: 'Sales', description: 'Sales and checkout' },
    { name: 'Returns', description: 'Returned inventory' },
    { name: 'Expenses', description: 'Shop expenses' },
    { name: 'Reports', description: 'Shop reporting' },
    { name: 'Sync', description: 'Offline synchronization' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http' as const,
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: openApiDocument,
  });

  await app.register(swaggerUi, {
    routePrefix: '/api-docs',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      persistAuthorization: true,
    },
  });
}
