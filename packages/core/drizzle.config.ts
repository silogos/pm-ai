import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    // @ts-ignore - process is available at runtime
    url: 'file:' + (process.env.HOME || process.env.USERPROFILE || '.') + '/.config/pm-ai/pmai.db'
  }
});
