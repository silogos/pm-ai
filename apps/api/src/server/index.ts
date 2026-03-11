import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { init, DEFAULT_DB_PATH } from '@pm-ai/core'
import { apiRoutes } from './routes/index.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get config from environment or default
function getDbPath(): string {
  return process.env.PMAI_DB_PATH || DEFAULT_DB_PATH
}

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
  // Check if we should skip migrations
  const skipMigrations = process.env.PMAI_SKIP_MIGRATIONS === 'true';

  if (skipMigrations) {
    console.log('[Server] Skipping migrations (PMAI_SKIP_MIGRATIONS is set)');
  }

  // Initialize database (migrations run inside init unless skipMigrations is true)
  await init({ path: config.dbPath, skipMigrations });

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

  // Serve static files from web/dist
  // __dirname is apps/api/dist/server/, so we need ../../../web/dist to reach apps/web/dist
  const distPath = path.join(__dirname, '../../../web/dist')

  // SPA fallback - serve index.html for non-API routes
  app.get('*', async (c) => {
    // Skip API routes and health check
    if (c.req.path.startsWith('/api') || c.req.path === '/health') {
      return c.html('Not found', 404)
    }

    // Try to serve static file first
    const fs = await import('fs')
    const filePath = path.join(distPath, c.req.path)

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const file = fs.readFileSync(filePath)
      // Set content type based on extension
      const ext = path.extname(filePath)
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      }
      c.header('Content-Type', contentTypes[ext] || 'application/octet-stream')
      return c.body(file)
    }

    // Serve index.html for SPA routing (client-side routing)
    const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'))
    return c.html(indexHtml.toString())
  })

  // Determine port - use PORT env var or fixedPort config or default to 8080
  const port = config.fixedPort || parseInt(process.env.PORT || '8080', 10);

  // Start server - bind to all interfaces for better compatibility
  const server = serve({
    fetch: app.fetch,
    port
    // Don't set hostname - let OS decide
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use!`);
      console.error(`💡 Try: PORT=3000 pnpm dev:api`);
      process.exit(1);
    }
    throw err;
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

// Auto-start server when this file is executed directly
// Note: This file is spawned as a child process by the MCP server,
// or run directly via `pnpm dev:api` / `pnpm start`
createWebServer({
  dbPath: getDbPath()
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
