import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { init } from '@pm-ai/core'
import { apiRoutes } from './routes/index.js'

export interface WebServerConfig {
  fixedPort?: number;
  autoOpen?: boolean;
  dbPath?: string;
}

export interface WebServerInfo {
  app: Hono;
  port: number;
  url: string;
  close: () => Promise<void>;
}

export async function createWebServer(config: WebServerConfig = {}): Promise<WebServerInfo> {
  // Initialize database with default path (~/.config/pm-ai/db.sqlite)
  await init({});

  const app = new Hono();

  // Middleware
  app.use('*', cors());
  app.use('*', logger());

  // Health check endpoint
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.route('/api', apiRoutes);

  // Determine port - use PORT env var or fixedPort config or default to 3000
  const port = config.fixedPort || parseInt(process.env.PORT || '3000', 10);

  // Start server - use localhost to avoid permission issues
  const server = serve({
    fetch: app.fetch,
    port
  });

  console.log(`API server running on http://127.0.0.1:${port}`);

  return {
    app,
    port,
    url: `http://localhost:${port}`,
    close: async () => {
      // @ts-ignore - server has close method
      await server.close();
    }
  };
}

// Auto-start server if this file is run directly
createWebServer({}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
