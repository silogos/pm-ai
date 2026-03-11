import { defineConfig } from 'drizzle-kit';
import { DEFAULT_DB_PATH } from './src/config/database.js';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:' + DEFAULT_DB_PATH
  }
});
