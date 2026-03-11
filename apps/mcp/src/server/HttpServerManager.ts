import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import getPort, { portNumbers } from 'get-port';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface HttpServerManager {
  spawn(): Promise<string>;  // Returns server URL
  isRunning(): boolean;
  getUrl(): string | null;
  kill(): Promise<void>;
}

export interface HttpServerManagerConfig {
  apiServerPath: string;
  preferredPort?: number;
  dbPath: string;
}

export class HttpServerManagerImpl implements HttpServerManager {
  private process: ChildProcess | null = null;
  private url: string | null = null;
  private config: HttpServerManagerConfig;

  constructor(config: HttpServerManagerConfig) {
    this.config = config;
  }

  async spawn(): Promise<string> {
    // Already running?
    if (this.process && this.url) {
      if (await this.healthCheck()) {
        return this.url;
      }
      // Server not healthy, kill and restart
      await this.kill();
    }

    // Get dynamic port
    const port = await getPort({
      port: this.config.preferredPort || portNumbers(8080, 9080)
    });

    // Spawn server
    this.process = spawn('node', [this.config.apiServerPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: port.toString() }
    });

    // Log output for debugging
    this.process.stdout?.on('data', (data) => {
      console.error(`[HTTP Server] ${data.toString().trim()}`);
    });
    this.process.stderr?.on('data', (data) => {
      console.error(`[HTTP Server Error] ${data.toString().trim()}`);
    });

    // Handle crash
    this.process.on('error', (error) => {
      console.error('❌ Failed to start HTTP server:', error.message);
      this.process = null;
      this.url = null;
    });

    this.process.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`HTTP server exited with code ${code}`);
      }
      this.process = null;
      this.url = null;
    });

    // Wait for health check
    this.url = `http://localhost:${port}`;
    await this.waitForHealthCheck();

    return this.url;
  }

  isRunning(): boolean {
    return this.process !== null;
  }

  getUrl(): string | null {
    return this.url;
  }

  async kill(): Promise<void> {
    if (this.process) {
      this.process.kill('SIGTERM');

      // Wait for graceful shutdown (max 5 seconds)
      const timeout = setTimeout(() => {
        if (this.process) {
          console.error('HTTP server did not shut down gracefully, forcing...');
          this.process.kill('SIGKILL');
        }
      }, 5000);

      await new Promise<void>((resolve) => {
        this.process!.once('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      this.process = null;
      this.url = null;
    }
  }

  private async healthCheck(): Promise<boolean> {
    if (!this.url) return false;

    try {
      const response = await fetch(`${this.url}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async waitForHealthCheck(maxWait = 10000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (await this.healthCheck()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error('HTTP server health check timed out');
  }
}
