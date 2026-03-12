import { getConfig } from '@pm-ai/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

export async function configSetCommand(args: string[]): Promise<void> {
  const [key, value] = args;
  if (!key || !value) {
    console.error('Usage: pm-ai config:set <key> <value>');
    process.exit(1);
  }

  const validKeys = ['dbPath'];
  if (!validKeys.includes(key)) {
    console.error(`Invalid key. Must be one of: ${validKeys.join(', ')}`);
    process.exit(1);
  }

  try {
    const configPath = join(homedir(), '.config', 'pm-ai', 'config.json');
    const configDir = join(configPath, '..');

    mkdirSync(configDir, { recursive: true });

    let config: Record<string, string> = {};
    if (existsSync(configPath)) {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    }

    config[key] = value;
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`✓ Config updated: ${key} = ${value}`);
    console.log(`  Config file: ${configPath}`);
  } catch (error) {
    console.error('Failed to set config:', error);
    process.exit(1);
  }
}

export async function configGetCommand(args: string[]): Promise<void> {
  const config = getConfig();
  const key = args[0];

  if (key) {
    if (key === 'dbPath') {
      console.log(config.dbPath);
    } else {
      console.error(`Unknown config key: ${key}`);
      console.error('Available keys: dbPath');
    }
  } else {
    console.log(JSON.stringify(config, null, 2));
  }
}

export async function configEditCommand(): Promise<void> {
  const configPath = join(homedir(), '.config', 'pm-ai', 'config.json');

  // Create default config if it doesn't exist
  if (!existsSync(configPath)) {
    mkdirSync(join(configPath, '..'), { recursive: true });
    writeFileSync(configPath, JSON.stringify({ dbPath: '' }, null, 2));
  }

  // Open in default editor
  const editor = process.env.EDITOR || 'nano';
  execSync(`${editor} "${configPath}"`, { stdio: 'inherit' });
}
