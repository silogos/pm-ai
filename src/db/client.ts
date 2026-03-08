import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const sqlite = new Database('./drizzle/pmai.db');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle({ client: sqlite, schema });
