import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:' + (process.env.HOME || process.env.USERPROFILE || '.') + '/.config/pm-ai/db.sqlite'
  }
});
