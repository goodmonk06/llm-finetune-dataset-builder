import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { config } from 'dotenv';
import * as path from 'path';
import { errorHandler } from './plugins/error-handler';
import { datasetRoutes } from './routes/datasets';
import { exampleRoutes } from './routes/examples';
import { exportRoutes } from './routes/exports';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: 'info',
    },
  });

  // Register error handler first
  await fastify.register(errorHandler);

  // Register CORS
  await fastify.register(cors, {
    origin: true,
  });

  // Serve static files from public directory
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'public'),
    prefix: '/ui/',
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API info
  fastify.get('/', async () => {
    return {
      name: 'LLM Fine-tune Dataset Builder API',
      version: '1.0.0',
      endpoints: {
        datasets: '/datasets',
        examples: '/examples',
        exports: '/exports',
        health: '/health',
        ui: '/ui/',
      },
    };
  });

  // Register routes
  await fastify.register(datasetRoutes);
  await fastify.register(exampleRoutes);
  await fastify.register(exportRoutes);

  return fastify;
}

async function start() {
  try {
    const fastify = await buildServer();

    await fastify.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`Server listening on http://localhost:${PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { buildServer };
