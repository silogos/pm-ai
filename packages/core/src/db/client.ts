import { drizzle } from 'drizzle-orm/libsql/driver';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/libsql/migrator';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { homedir } from 'os';
import { DEFAULT_DB_PATH } from '../config/database.js';
import { copyFileSync, existsSync } from 'fs';

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
 * Also respects DEV environment variable for development mode
 */
function getConnection(config: DatabaseConfig): string {
  let dbPath = config.inMemory
    ? ':memory:'
    : config.path;

  // If no path provided, use environment-based default
  if (!dbPath) {
    if (process.env.DEV === '1' || process.env.NODE_ENV === 'development') {
      // Development: use local database in src/db
      // __dirname points to package root after adjustment
      dbPath = path.join(__dirname, 'src', 'db', 'pm-ai.db');
    } else {
      // Production: use user config directory
      dbPath = DEFAULT_DB_PATH;
    }
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
  skipMigrations?: boolean;  // Skip running migrations (useful for tests)
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
  await libsqlClient.execute('PRAGMA foreign_keys = ON');

  // Enable WAL mode for better concurrent access (multi-agent scenarios)
  await libsqlClient.execute('PRAGMA journal_mode=WAL');
  await libsqlClient.execute('PRAGMA synchronous=NORMAL');
  await libsqlClient.execute('PRAGMA busy_timeout=5000');

  dbInstance = drizzle({ client: libsqlClient, schema });

  // Run migrations if not skipped
  if (!config.skipMigrations) {
    await runMigrations();
  }

  return dbInstance;
}

async function runMigrations(): Promise<void> {
  // Path to migrations folder
  // The migrations folder is at packages/core/drizzle (sibling to package root)
  const migrationsFolder = path.join(__dirname, 'drizzle');

  console.error('[DB] Running migrations from:', migrationsFolder);

  try {
    // Use official Drizzle migrator
    await migrate(dbInstance!, { migrationsFolder });
    console.error('[DB] Migrations completed successfully');
  } catch (error) {
    console.error('[DB] Migration error:', error);
    throw error;
  }
}

/**
 * Copy template database from packages/core/src/db/pm-ai.db to user config directory
 * Only copies if the target database doesn't exist yet
 * Skips in development mode (DEV=1 or NODE_ENV=development)
 *
 * @returns true if copy was performed, false if skipped
 */
export async function copyTemplateDatabase(): Promise<boolean> {
  // Skip copy in development mode - use local database directly
  if (process.env.DEV === '1' || process.env.NODE_ENV === 'development') {
    console.error('[DB] Development mode: using local database at ./src/db/pm-ai.db');
    return false;
  }

  const targetPath = DEFAULT_DB_PATH;

  // Check if target already exists
  if (existsSync(targetPath)) {
    console.error('[DB] Database already exists at:', targetPath);
    return false;
  }

  // Template database path (packages/core/src/db/pm-ai.db)
  // Need to resolve this from the current file location
  let templatePath = path.join(__dirname, 'pm-ai.db');

  // Adjust path based on whether we're in src/db or dist/db
  if (__dirname.endsWith('/src/db') || __dirname.endsWith('\\src/db')) {
    // We're in src/db, template is right here
    templatePath = path.join(__dirname, 'pm-ai.db');
  } else if (__dirname.endsWith('/dist/db') || __dirname.endsWith('\\dist/db')) {
    // We're in dist/db, template is in src/db
    templatePath = path.join(path.dirname(path.dirname(__dirname)), 'src', 'db', 'pm-ai.db');
  } else if (__dirname.endsWith('/src') || __dirname.endsWith('\\src')) {
    templatePath = path.join(__dirname, 'db', 'pm-ai.db');
  } else if (__dirname.endsWith('/dist') || __dirname.endsWith('\\dist')) {
    templatePath = path.join(path.dirname(__dirname), 'src', 'db', 'pm-ai.db');
  }

  // Check if template exists
  if (!existsSync(templatePath)) {
    console.error('[DB] Template database not found at:', templatePath);
    console.error('[DB] Please run "pnpm run db:push:dev" to create template database');
    return false;
  }

  // Ensure target directory exists
  const targetDir = path.dirname(targetPath);
  if (!existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true, mode: 0o775 });
  }

  // Copy template to target
  try {
    copyFileSync(templatePath, targetPath);
    console.error('[DB] Template database copied from:', templatePath);
    console.error('[DB] Template database copied to:', targetPath);
    return true;
  } catch (error) {
    console.error('[DB] Failed to copy template database:', error);
    throw error;
  }
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
