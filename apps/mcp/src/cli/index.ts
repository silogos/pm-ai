#!/usr/bin/env node
import { createProject } from '@pm-ai/core';
import { getTasks, parseDependencies } from '@pm-ai/core';
import { updateTaskStatus } from '@pm-ai/core';
import { getProjectProgress } from '@pm-ai/core';

const commands = {
  'create-project': async (args: string[]) => {
    const name = args[0];
    if (!name) {
      console.error('Usage: pm-ai create-project <project-name>');
      process.exit(1);
    }

    try {
      const projectId = await createProject(name);
      console.log(`Project created successfully!`);
      console.log(`Project ID: ${projectId}`);
      console.log(`Project Name: ${name}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      process.exit(1);
    }
  },

  'list-tasks': async (args: string[]) => {
    const projectId = args[0];
    if (!projectId) {
      console.error('Usage: pm-ai list-tasks <project-id>');
      process.exit(1);
    }

    try {
      const tasks = await getTasks(projectId);
      console.log(`\nTasks for project ${projectId}:\n`);

      if (tasks.length === 0) {
        console.log('No tasks found.');
        return;
      }

      for (const task of tasks) {
        console.log(`[${task.status.toUpperCase()}] ${task.title}`);
        console.log(`  Plan: ${task.planTitle}`);
        if (task.description) {
          console.log(`  Description: ${task.description}`);
        }
        if (task.priority) {
          console.log(`  Priority: ${task.priority}`);
        }
        const deps = parseDependencies(task.dependencies);
        if (deps.length > 0) {
          console.log(`  Dependencies: ${deps.join(', ')}`);
        }
        console.log(`  Task ID: ${task.id}\n`);
      }
    } catch (error) {
      console.error('Failed to list tasks:', error);
      process.exit(1);
    }
  },

  'update-status': async (args: string[]) => {
    const [taskId, status] = args;
    if (!taskId || !status) {
      console.error('Usage: pm-ai update-status <task-id> <planned|review|done>');
      process.exit(1);
    }

    const validStatuses = ['planned', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      console.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      process.exit(1);
    }

    try {
      const updated = await updateTaskStatus(taskId, status as 'planned' | 'review' | 'done');
      if (updated) {
        console.log(`Task status updated successfully!`);
        console.log(`Task ID: ${updated.id}`);
        console.log(`Title: ${updated.title}`);
        console.log(`New Status: ${updated.status}`);
      } else {
        console.error('Task not found.');
        process.exit(1);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      process.exit(1);
    }
  },

  'progress': async (args: string[]) => {
    const projectId = args[0];
    if (!projectId) {
      console.error('Usage: pm-ai progress <project-id>');
      process.exit(1);
    }

    try {
      const progress = await getProjectProgress(projectId);
      console.log(`\nProgress for project ${projectId}:\n`);
      console.log(`Total Tasks: ${progress.total}`);
      console.log(`Planned: ${progress.planned} (${Math.round((progress.planned / progress.total) * 100)}%)`);
      console.log(`In Review: ${progress.inReview} (${Math.round((progress.inReview / progress.total) * 100)}%)`);
      console.log(`Completed: ${progress.completed} (${progress.percentage}%)`);
      console.log(`\nBy Priority:`);
      console.log(`  High: ${progress.byPriority.high.completed}/${progress.byPriority.high.total} completed`);
      console.log(`  Medium: ${progress.byPriority.medium.completed}/${progress.byPriority.medium.total} completed`);
      console.log(`  Low: ${progress.byPriority.low.completed}/${progress.byPriority.low.total} completed`);
    } catch (error) {
      console.error('Failed to get progress:', error);
      process.exit(1);
    }
  },

  'config:set': async (args: string[]) => {
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
      const { existsSync, mkdirSync, readFileSync, writeFileSync } = await import('fs');
      const { join } = await import('path');
      const { homedir } = await import('os');

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
  },

  'config:get': async (args: string[]) => {
    const { getConfig } = await import('../config/index.js');
    const key = args[0];
    const config = getConfig();

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
  },

  'config:edit': async () => {
    const { existsSync } = await import('fs');
    const { join } = await import('path');
    const { homedir } = await import('os');
    const { execSync } = await import('child_process');

    const configPath = join(homedir(), '.config', 'pm-ai', 'config.json');

    // Create default config if it doesn't exist
    if (!existsSync(configPath)) {
      const { mkdirSync, writeFileSync } = await import('fs');
      mkdirSync(join(configPath, '..'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({ dbPath: '' }, null, 2));
    }

    // Open in default editor
    const editor = process.env.EDITOR || 'nano';
    execSync(`${editor} "${configPath}"`, { stdio: 'inherit' });
  },

  'help': async () => {
    console.log(`
PM-AI CLI - Project Management AI

Commands:
  create-project <name>       Create a new project
  list-tasks <project-id>     List all tasks for a project
  update-status <task-id>     Update task status (planned|review|done)
  progress <project-id>       Show project progress statistics
  config:set <key> <value>    Set configuration value
  config:get [key]            Get configuration value(s)
  config:edit                 Edit config file in default editor
  help                        Show this help message

Examples:
  pm-ai create-project "My Project"
  pm-ai list-tasks abc123-def456-ghi789
  pm-ai update-status task-id-here done
  pm-ai progress abc123-def456-ghi789
  pm-ai config:set dbPath /custom/path/db.db
  pm-ai config:get
  pm-ai config:get dbPath
`);
  }
};

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    await commands['help']();
    return;
  }

  const handler = commands[command as keyof typeof commands];

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
