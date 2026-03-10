import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
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

// Default database path is in the core package's drizzle directory
const defaultDbPath = path.join(__dirname, 'drizzle/pmai.db');

export interface DatabaseConfig {
  path?: string;  // Database file path
  inMemory?: boolean;  // Use in-memory database for testing
}

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function init(config: DatabaseConfig = {}): ReturnType<typeof drizzle> {
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

  const sqlite = new Database(dbPath);
  sqlite.pragma('foreign_keys = ON');

  dbInstance = drizzle({ client: sqlite, schema });
  return dbInstance;
}

export function getDb(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call init() first.');
  }
  return dbInstance;
}
