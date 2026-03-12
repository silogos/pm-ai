#!/usr/bin/env node
import { createFeatureCommand } from './commands/createFeature.js';
import { listTasksCommand } from './commands/listTasks.js';
import { updateStatusCommand } from './commands/updateStatus.js';
import { progressCommand } from './commands/progress.js';
import { configSetCommand, configGetCommand, configEditCommand } from './commands/config.js';
import { helpCommand } from './commands/help.js';

const commands: Record<string, (args: string[]) => Promise<void>> = {
  'create-feature': createFeatureCommand,
  'list-tasks': listTasksCommand,
  'update-status': updateStatusCommand,
  'progress': progressCommand,
  'config:set': configSetCommand,
  'config:get': configGetCommand,
  'config:edit': configEditCommand,
  'help': helpCommand
};

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    await helpCommand();
    return;
  }

  const handler = commands[command];

  if (!handler) {
    console.error(`Unknown command: ${command}`);
    console.error('Run "pm-ai help" to see available commands');
    process.exit(1);
  }

  await handler(args);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
