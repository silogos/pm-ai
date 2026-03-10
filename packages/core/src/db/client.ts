import { drizzle } from 'drizzle-orm/libsql/driver';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

// When running from source (tsx), __dirname ends with /src
// When running from dist, __dirname ends with /dist
// We need to go up one more level if we're in src
if (__dirname.endsWith('/src') || __dirname.endsWith('\\src')) {
  __dirname = path.dirname(__dirname);
}

// Default database path is in the user's config directory
const defaultDbPath = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.config', 'pm-ai', 'pmai.db');

export interface DatabaseConfig {
  path?: string;  // Database file path
  inMemory?: boolean;  // Use in-memory database for testing
}

let dbInstance: ReturnType<typeof drizzle> | null = null;
let libsqlClient: ReturnType<typeof createClient> | null = null;

export async function init(config: DatabaseConfig = {}): Promise<ReturnType<typeof drizzle>> {
  const dbPath = config.inMemory
    ? ':memory:'
    : config.path || defaultDbPath;

  console.error('[DB] __dirname:', __dirname);
  console.error('[DB] Using database path:', dbPath);

  // Ensure the directory exists
  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  // Add file: prefix for local databases
  const connectionString = dbPath === ':memory:'
    ? ':memory:'
    : `file:${dbPath}`;

  libsqlClient = createClient({ url: connectionString });
  await libsqlClient.execute('PRAGMA foreign_keys = ON');

  dbInstance = drizzle({ client: libsqlClient, schema });

  // Apply migrations if database doesn't exist, is empty (0 bytes), or using in-memory
  const dbExists = fs.existsSync(dbPath);
  const dbIsEmpty = dbExists && fs.statSync(dbPath).size === 0;
  const needsMigration = config.inMemory || !dbExists || dbIsEmpty;

  if (needsMigration) {
    await applyMigrations();
  }

  return dbInstance;
}

async function applyMigrations(): Promise<void> {
  // Migration file is relative to package root (parent of dist/src)
  const migrationPath = path.join(__dirname, '../../drizzle/0000_brave_silhouette.sql');
  const resolvedPath = path.resolve(migrationPath);

  console.log('[DB] Looking for migration file at:', resolvedPath);

  if (!fs.existsSync(resolvedPath)) {
    console.warn('[DB] Migration file not found, skipping schema initialization');
    return;
  }

  const migrationSQL = fs.readFileSync(resolvedPath, 'utf-8');
  const statements = migrationSQL.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);

  console.log(`[DB] Applying ${statements.length} migration statements...`);

  for (const statement of statements) {
    await libsqlClient!.execute(statement);
  }

  console.log('[DB] Migrations applied successfully');
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
