export async function helpCommand(): Promise<void> {
  console.log(`
PM-AI CLI - Project Management AI

Commands:
  create-feature <name>       Create a new feature
  list-tasks <feature-id>     List all tasks for a feature
  update-status <task-id>     Update task status (planned|review|done)
  progress <feature-id>       Show feature progress statistics
  config:set <key> <value>    Set configuration value
  config:get [key]            Get configuration value(s)
  config:edit                 Edit config file in default editor
  help                        Show this help message

Examples:
  pm-ai create-feature "My Feature"
  pm-ai list-tasks abc123-def456-ghi789
  pm-ai update-status task-id-here done
  pm-ai progress abc123-def456-ghi789
  pm-ai config:set dbPath /custom/path/db.db
  pm-ai config:get
  pm-ai config:get dbPath
`);
}
