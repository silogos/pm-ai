import express from 'express';
import cors from 'cors';
import getPort from 'get-port';
import path from 'path';
import { fileURLToPath } from 'url';
import { init } from '@pm-ai/core';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WebServerConfig {
  fixedPort?: number;
  autoOpen?: boolean;
  dbPath?: string;
}

export interface WebServerInfo {
  app: express.Application;
  port: number;
  url: string;
  close: () => Promise<void>;
}

export async function createWebServer(config: WebServerConfig = {}): Promise<WebServerInfo> {
  // Initialize database
  if (config.dbPath) {
    init({ path: config.dbPath });
  }

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', apiRoutes);

  // Serve static files from web/dist
  const distPath = path.join(__dirname, '../../web/dist');
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Skip API routes and health check
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Determine port
  const port = config.fixedPort || await getPort({ port: 3456 });

  // Start server
  const server = app.listen(port, 'localhost', () => {
    // Server started callback
  });

  return {
    app,
    port,
    url: `http://localhost:${port}`,
    close: () => new Promise((resolve) => {
      server.close(() => resolve());
    })
  };
}
