import { join } from 'path';
import { homedir } from 'os';
import { isProduction } from '@pm-ai/utils';

/**
 * Single source of truth for PM-AI database path
 * Using 'pmai.db' (without hyphen) for better filesystem compatibility
 *
 * For development (!isProduction): Uses local ./src/db/pm-ai.db
 * For production (isProduction): Uses ~/.config/pm-ai/pmai.db
 */
const getDbPath = () => {
  if (!isProduction()) {
    // Use local database for development
    return join(process.cwd(), 'packages', 'core', 'src', 'db', 'pm-ai.db');
  }
  return join(homedir(), '.config', 'pm-ai', 'pmai.db');
};

export const DEFAULT_DB_PATH = getDbPath();
