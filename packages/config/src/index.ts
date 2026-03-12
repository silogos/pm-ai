import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, readFileSync, existsSync } from 'fs';
import { DEFAULT_DB_PATH } from '@pm-ai/core';

export interface Config {
  dbPath: string;
  apiUrl?: string;
}

const GLOBAL_CONFIG_PATH = join(homedir(), '.config', 'pm-ai', 'config.json');

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
    if (process.env.PMAI_API_URL) {
      config.apiUrl = process.env.PMAI_API_URL;
    }
    return config;
  }

  // Priority 2: Global config file
  const globalConfig = loadGlobalConfig();
  if (globalConfig.dbPath) {
    return {
      dbPath: globalConfig.dbPath,
      apiUrl: globalConfig.apiUrl
    };
  }

  // Priority 3: Default
  return {
    dbPath: DEFAULT_DB_PATH,
    apiUrl: 'http://localhost:8787'
  };
}

export function ensureDbDirectory(dbPath: string): void {
  const dbDir = join(dbPath, '..');
  try {
    mkdirSync(dbDir, { recursive: true });
  } catch (error) {
    // Directory might already exist or creation failed
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}
