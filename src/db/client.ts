import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { getConfig, ensureDbDirectory } from '../config/index.js';

const { dbPath } = getConfig();
ensureDbDirectory(dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle({ client: sqlite, schema });
