#!/usr/bin/env node
import { cac } from 'cac';
import { createFeatureCommand } from './commands/createFeature.js';
import { listTasksCommand } from './commands/listTasks.js';
import { updateStatusCommand } from './commands/updateStatus.js';
import { progressCommand } from './commands/progress.js';
import { configSetCommand, configGetCommand, configEditCommand } from './commands/config.js';
import { serverCommand } from './commands/server.js';
import { dbMigrateCommand } from './commands/dbMigrate.js';
import { mcpCommand } from './commands/mcp.js';

const cli = cac('pm-ai');

// Server command
cli
  .command('server [port]', 'Start API server (default port: 8787)')
  .action((port) => serverCommand([port || '8787']));

// Database commands
cli
  .command('db:migrate', 'Run database migrations')
  .action(() => dbMigrateCommand());

// MCP command
cli
  .command('mcp', 'Start PM-AI MCP Server for Claude integration')
  .action(() => mcpCommand());

// Feature commands
cli
  .command('create-feature <name>', 'Create a new feature')
  .option('-w, --workspace <workspaceId>', 'Workspace ID (defaults to current directory)')
  .action((name, options) => createFeatureCommand([name, options.workspace]));

cli
  .command('list-tasks <featureId>', 'List all tasks for a feature')
  .action((featureId) => listTasksCommand([featureId]));

cli
  .command('update-status <taskId> <status>', 'Update task status (planned|review|done)')
  .action((taskId, status) => updateStatusCommand([taskId, status]));

cli
  .command('progress <featureId>', 'Show feature progress statistics')
  .action((featureId) => progressCommand([featureId]));

// Config commands
cli
  .command('config:set <key> <value>', 'Set configuration value')
  .action((key, value) => configSetCommand([key, value]));

cli
  .command('config:get [key]', 'Get configuration value(s)')
  .action((key) => configGetCommand([key || '']));

cli
  .command('config:edit', 'Edit config file in default editor')
  .action(() => configEditCommand());

// Enable help
cli.help();

// Parse CLI arguments
cli.parse();

// Show help if no command was provided
if (!cli.matchedCommand) {
  cli.outputHelp();
  process.exit(0);
}
