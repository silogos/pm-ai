import { drizzle } from 'drizzle-orm/libsql/driver';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { homedir } from 'os';
import { DEFAULT_DB_PATH } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

// Adjust __dirname to point to package root
// - When running from source (tsx): __dirname ends with /src/db → go up two levels
// - When running from dist: __dirname ends with /dist/db → go up two levels
// - When running tests: might already be at package root
if (__dirname.endsWith('/src/db') || __dirname.endsWith('\\src/db') ||
    __dirname.endsWith('/dist/db') || __dirname.endsWith('\\dist/db')) {
  __dirname = path.dirname(path.dirname(__dirname));
} else if (__dirname.endsWith('/src') || __dirname.endsWith('\\src') ||
           __dirname.endsWith('/dist') || __dirname.endsWith('\\dist')) {
  __dirname = path.dirname(__dirname);
}

/**
 * Get connection string from config
 * Handles path normalization, ~ expansion, and relative-to-absolute conversion
 */
function getConnection(config: DatabaseConfig): string {
  let dbPath = config.inMemory
    ? ':memory:'
    : config.path;

  // If no path provided, use DEFAULT_DB_PATH (from config/database.ts)
  if (!dbPath) {
    dbPath = DEFAULT_DB_PATH;
  }

  // Expand ~ to home directory
  if (dbPath.startsWith('~')) {
    dbPath = path.join(homedir(), dbPath.slice(1));
  }

  // Convert relative paths to absolute
  if (!path.isAbsolute(dbPath) && dbPath !== ':memory:') {
    dbPath = path.resolve(process.cwd(), dbPath);
  }

  // Convert to connection string
  return dbPath === ':memory:' ? ':memory:' : `file:${dbPath}`;
}

export interface DatabaseConfig {
  path?: string;  // Database file path
  inMemory?: boolean;  // Use in-memory database for testing
}

let dbInstance: ReturnType<typeof drizzle> | null = null;
let libsqlClient: ReturnType<typeof createClient> | null = null;

export async function init(config: DatabaseConfig = {}): Promise<ReturnType<typeof drizzle>> {
  const connectionString = getConnection(config);

  // Extract dbPath from connection string for logging and migrations
  const dbPath = connectionString === ':memory:' ? ':memory:' : connectionString.replace('file:', '');

  console.error('[DB] __dirname:', __dirname);
  console.error('[DB] Using database path:', dbPath);

  // Ensure the directory exists
  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);

    // create directory if not exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, {
        recursive: true,
        mode: 0o775
      });
    }

    // try to fix directory permissions (ignore errors)
    try {
      fs.chmodSync(dbDir, 0o775);
    } catch {
      // Ignore - directory might have restricted permissions
    }
  }

  libsqlClient = createClient({ url: connectionString });

  // Execute PRAGMA statements individually to avoid transaction conflicts
  await libsqlClient.execute("PRAGMA foreign_keys = ON");
  await libsqlClient.execute("PRAGMA busy_timeout = 5000");
  await libsqlClient.execute("PRAGMA journal_mode = WAL");
  await libsqlClient.execute("PRAGMA synchronous = NORMAL");
  

  dbInstance = drizzle({ client: libsqlClient, schema });

  return dbInstance;
}

/**
 * Copy template database (deprecated - using isProduction-based paths)
 *
 * @returns false (no-op)
 */
export async function copyTemplateDatabase(): Promise<boolean> {
  console.error('[DB] copyTemplateDatabase is deprecated - using isProduction-based paths');
  return false;
}

export function getDb(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call init() first.');
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (libsqlClient) {
    await libsqlClient.close();
    libsqlClient = null;
    dbInstance = null;
  }
}
