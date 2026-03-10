import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, readFileSync, existsSync } from 'fs';

export interface Config {
  dbPath: string;
  webPort?: number;
  webAutoOpen?: boolean;
}

const GLOBAL_CONFIG_PATH = join(homedir(), '.config', 'pm-ai', 'config.json');
const DEFAULT_DB_PATH = join(homedir(), '.config', 'pm-ai', 'pmai.db');

function loadGlobalConfig(): Partial<Config> {
  try {
    if (existsSync(GLOBAL_CONFIG_PATH)) {
      const config = JSON.parse(readFileSync(GLOBAL_CONFIG_PATH, 'utf-8'));
      return config;
    }
  } catch (error) {
    // Config file is invalid or unreadable, use defaults
  }
  return {};
}

export function getConfig(): Config {
  // Priority 1: Environment variable (from MCP client config)
  if (process.env.PMAI_DB_PATH) {
    const config: Config = { dbPath: process.env.PMAI_DB_PATH };
    if (process.env.PMAI_WEB_PORT) {
      config.webPort = parseInt(process.env.PMAI_WEB_PORT, 10);
    }
    if (process.env.PMAI_WEB_AUTO_OPEN) {
      config.webAutoOpen = process.env.PMAI_WEB_AUTO_OPEN === 'true';
    }
    return config;
  }

  // Priority 2: Global config file
  const globalConfig = loadGlobalConfig();
  if (globalConfig.dbPath) {
    return {
      dbPath: globalConfig.dbPath,
      webPort: globalConfig.webPort,
      webAutoOpen: globalConfig.webAutoOpen
    };
  }

  // Priority 3: Default
  return { dbPath: DEFAULT_DB_PATH };
}

// Helper to ensure DB directory exists
export function ensureDbDirectory(dbPath: string): void {
  mkdirSync(join(dbPath, '..'), { recursive: true });
}
