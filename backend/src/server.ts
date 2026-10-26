import buildServer from './app.js';
import { env } from './config/env.js';

const start = async () => {
  const app = await buildServer();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(`Store Management API started on http://localhost:${env.PORT}`);
};

start().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
