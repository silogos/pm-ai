import { runMigrations } from '@pm-ai/core';
import { getConfig } from '@pm-ai/config';

/**
 * Run database migrations
 * Usage: pm-ai db:migrate
 */
export async function dbMigrateCommand(): Promise<void> {
  console.log('🔄 Running database migrations...\n');

  try {
    const config = getConfig();

    await runMigrations({ dbPath: config.dbPath });

    console.log('\n✅ Migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}
