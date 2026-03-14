# Database Guide

Everything you need to know about the PM-AI database.

## Database Location

The database is automatically created and migrated on first run at:

```
~/.config/pm-ai/pmai.db
```

### Custom Database Path

You can customize the database location using the `PMAI_DB_PATH` environment variable:

```bash
export PMAI_DB_PATH=/custom/path/to/database.db
```

Or in your MCP configuration:

```json
{
  "mcpServers": {
    "pm-ai": {
      "command": "node",
      "args": ["/path/to/pm-ai/apps/mcp/dist/index.js"],
      "env": {
        "PMAI_DB_PATH": "/custom/path/to/database.db"
      }
    }
  }
}
```

## Database Technology

PM-AI uses **libSQL** - a pure JavaScript SQLite client. This means:

- ✅ No native dependencies
- ✅ Works on all platforms (Linux, macOS, Windows)
- ✅ Easy installation and setup
- ✅ Zero configuration required

## Database Schema

### Tables

#### workspaces

Workspaces represent the top-level container (usually a repository).

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Unique workspace identifier (UUID) |
| path | TEXT (NOT NULL) | Filesystem path to the workspace |
| description | TEXT | Optional description of the workspace |
| created_at | TEXT | ISO timestamp of creation |

#### features

Features represent domain areas or components within a workspace.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Unique feature identifier (UUID) |
| workspace_id | TEXT (FOREIGN KEY) | Reference to workspace |
| name | TEXT (NOT NULL) | Feature name |
| description | TEXT | Optional description |
| created_at | TEXT | ISO timestamp of creation |

#### plans

Plans contain markdown content and structured task information.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Unique plan identifier (UUID) |
| feature_id | TEXT (FOREIGN KEY) | Reference to feature |
| title | TEXT (NOT NULL) | Plan title |
| markdown | TEXT (NOT NULL) | Full markdown content |
| created_at | TEXT | ISO timestamp of creation |

#### tasks

Individual tasks with dependencies and status tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Unique task identifier (UUID) |
| plan_id | TEXT (FOREIGN KEY) | Reference to plan |
| title | TEXT (NOT NULL) | Task title |
| description | TEXT | Detailed task description |
| flag | TEXT | Optional flag/label |
| priority | TEXT | Task priority: "high" \| "medium" \| "low" |
| dependencies | TEXT | JSON array of task IDs this task depends on |
| status | TEXT | Task status: "planned" \| "review" \| "done" |

#### task_comments

Comments for collaboration and documentation.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Unique comment identifier (UUID) |
| task_id | TEXT (FOREIGN KEY) | Reference to task |
| content | TEXT (NOT NULL) | Comment content |
| created_at | TEXT | ISO timestamp of creation |

## Relationships

```
workspaces (1) ──< (N) features (1) ──< (N) plans (1) ──< (N) tasks
                                                              │
                                                              └──< (N) task_comments
```

## Migrations

Migrations are automatically applied on startup. No manual migration steps needed!

### Generate New Migration

If you need to modify the schema:

```bash
pnpm db:generate
```

This creates a new migration file in `packages/core/drizzle/`.

### Apply Migrations Manually

While migrations are auto-applied, you can manually apply them:

```bash
pnpm db:migrate
```

## Database Client

PM-AI uses Drizzle ORM for type-safe database operations.

### Example Usage

```typescript
import { db } from '@pmai/core';
import { tasks } from '@pmai/core/db/schema';

// Query tasks
const allTasks = await db.select().from(tasks);

// Query with conditions
const highPriorityTasks = await db.select()
  .from(tasks)
  .where(eq(tasks.priority, 'high'));

// Insert task
await db.insert(tasks).values({
  title: 'New task',
  status: 'planned',
  priority: 'medium',
  planId: 'plan-123',
});
```

## Database Operations

### Read Operations

- Use MCP resources for read-only access
- Available via `pmai://` protocol
- No side effects

### Write Operations

- Use MCP tools for modifications
- All write operations go through domain services
- Automatic validation and error handling

## Performance Considerations

### Indexes

The database includes indexes on:
- `features.workspace_id`
- `plans.feature_id`
- `tasks.plan_id`
- `task_comments.task_id`

### Query Optimization

- Use filters to limit result sets
- Leverage the `filter_tasks` tool for efficient querying
- Use specific queries instead of fetching all data

## Backup and Restore

### Backup

Simply copy the database file:

```bash
cp ~/.config/pm-ai/pmai.db ~/.config/pm-ai/pmai.db.backup
```

### Restore

Replace the database file:

```bash
cp ~/.config/pm-ai/pmai.db.backup ~/.config/pm-ai/pmai.db
```

### Automated Backup

Consider setting up automated backups:

```bash
# Daily backup via cron
0 0 * * * cp ~/.config/pm-ai/pmai.db ~/.config/pm-ai/backups/pmai-$(date +\%Y\%m\%d).db
```

## Troubleshooting

### "Database not initialized" Error

**Solution:** The database is auto-created on first run. If you see this error:
1. Check write permissions for `~/.config/pm-ai/`
2. Try manually creating the directory:
   ```bash
   mkdir -p ~/.config/pm-ai
   ```

### Database Lock Errors

**Symptoms:** "database is locked" errors

**Solutions:**
1. Ensure only one process is accessing the database
2. Check for hung MCP server processes
3. Restart the MCP server

### Corruption Recovery

If the database becomes corrupted:

1. Restore from backup
2. Delete and recreate (loses all data):
   ```bash
   rm ~/.config/pm-ai/pmai.db
   # Database will be recreated on next startup
   ```

## SQLite Tools

You can use any SQLite tool to inspect the database:

### Command Line

```bash
sqlite3 ~/.config/pm-ai/pmai.db

# List tables
.tables

# Query tasks
SELECT * FROM tasks LIMIT 10;

# Exit
.exit
```

### GUI Tools

- [DB Browser for SQLite](https://sqlitebrowser.org/) - Cross-platform GUI
- [TablePlus](https://tableplus.com/) - Modern database client
- [DBeaver](https://dbeaver.io/) - Universal database tool

## Data Persistence

- All data is persisted to disk immediately
- No in-memory caching of writes
- ACID guarantees for all transactions
- Safe to terminate at any time

## Schema Evolution

When evolving the schema:

1. Create a migration using `pnpm db:generate`
2. Test the migration
3. Migration is auto-applied on next startup
4. No manual intervention required

## Security Considerations

- Database file permissions should be restricted to the user
- Avoid storing sensitive data in task descriptions
- Consider encryption for sensitive projects
- Regular backups are recommended
