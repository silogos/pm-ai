import { drizzle } from 'drizzle-orm/libsql/driver';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import { migrate } from 'drizzle-orm/libsql/migrator';
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

export interface MigrationConfig {
  dbPath?: string;
  inMemory?: boolean;
}

/**
 * Get connection string from config
 */
function getConnection(config: MigrationConfig): string {
  let dbPath = config.inMemory
    ? ':memory:'
    : config.dbPath || DEFAULT_DB_PATH;

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

/**
 * Run database migrations using the official Drizzle migrator
 *
 * This uses the standard Drizzle migration system which:
 * 1. Reads migration files from the drizzle folder
 * 2. Tracks applied migrations in __drizzle_migrations table
 * 3. Only applies new migrations that haven't been run yet
 */
export async function runMigrations(config: MigrationConfig = {}): Promise<void> {
  const connectionString = getConnection(config);
  const dbPath = connectionString === ':memory:' ? ':memory:' : connectionString.replace('file:', '');

  console.error('[Migrations] Starting Drizzle migrations...');
  console.error('[Migrations] Database path:', dbPath);

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

  // Create libsql client and drizzle db instance
  const client = createClient({ url: connectionString });
  const db = drizzle({ client, schema });

  try {
    // Enable foreign keys
    await client.execute('PRAGMA foreign_keys = ON');

    // Path to migrations folder
    // The migrations folder is at packages/core/drizzle (sibling to package root)
    const migrationsFolder = path.join(__dirname, 'drizzle');

    console.error('[Migrations] Applying migrations from:', migrationsFolder);

    // Use official Drizzle migrator
    await migrate(db, { migrationsFolder });

    console.error('[Migrations] Completed successfully');
  } finally {
    await client.close();
  }
}
