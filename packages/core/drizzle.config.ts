import { defineConfig } from 'drizzle-kit';
import { DEFAULT_DB_PATH } from './src/config/database.ts';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  dialect: 'sqlite',
  // Development: use ./src/db/pm-ai.db (DEV=1 or NODE_ENV=development)
  // Production: use ~/.config/pm-ai/pm-ai.db (default)
  dbCredentials: {
    url: process.env.DEV === '1' || process.env.NODE_ENV === 'development'
      ? 'file:./src/db/pm-ai.db'
      : 'file:' + DEFAULT_DB_PATH
  }
});
