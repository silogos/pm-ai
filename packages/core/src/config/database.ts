import { join } from 'path';
import { homedir } from 'os';

/**
 * Single source of truth for PM-AI database path
 * Using 'pmai.db' (without hyphen) for better filesystem compatibility
 *
 * For development: Uses project root if PMAI_DEV=1 is set
 * For production: Uses ~/.config/pm-ai/pmai.db
 */
const getDbPath = () => {
  if (process.env.PMAI_DEV === '1') {
    // Use project root for development
    return join(process.cwd(), 'pmai-dev.db');
  }
  return join(homedir(), '.config', 'pm-ai', 'pmai.db');
};

export const DEFAULT_DB_PATH = getDbPath();
