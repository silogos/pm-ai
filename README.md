# PM-AI MCP Server

A comprehensive **Model Context Protocol (MCP)** server for intelligent project management. This server enables AI assistants like Claude to manage complete project lifecycles, from planning and task creation to dependency analysis and progress tracking.

## Features

### Core Capabilities
- **Project Planning**: Store Markdown project plans with structured tasks
- **Task Management**: Full CRUD operations for tasks with priorities, dependencies, and status tracking
- **Progress Tracking**: Visual progress statistics with completion percentages and priority breakdowns
- **Search & Filter**: Advanced task search by keyword and filter by status, priority, or plan
- **Dependency Analysis**: Build dependency graphs, detect circular dependencies, and identify critical paths
- **Comments**: Add comments to tasks for collaboration and documentation
- **Project Organization**: Group plans and tasks by project with proper foreign key relationships

### Advanced Features
- **Dependency Graph**: Analyze task dependencies and relationships
- **Critical Path Analysis**: Identify the longest dependency chain to spot bottlenecks
- **Circular Dependency Detection**: Automatically detect dependency cycles that could block progress
- **Topological Sorting**: Get optimal task execution order based on dependencies
- **Progress Dashboard**: Real-time project progress with status breakdowns and priority metrics

## Installation

1. Install dependencies:
```bash
npm install
```

2. Generate and run database migrations:
```bash
npm run db:generate
npm run db:migrate
```

3. Build the project:
```bash
npm run build
```

## Configuration

PM-AI supports three configuration methods for the database path, with the following priority order:

### 1. Environment Variable (Highest Priority)

Set the `PMAI_DB_PATH` environment variable. This is typically used in MCP client configuration.

**Example (Claude Desktop config):**
```json
{
  "mcpServers": {
    "pm-ai": {
      "command": ["npx", "-y", "pm-ai-mcp-server"],
      "environment": {
        "PMAI_DB_PATH": "/path/to/database.db"
      }
    }
  }
}
```

### 2. Global Config File (Fallback)

Create a config file at `~/.config/pm-ai/config.json`:

```json
{
  "dbPath": "/path/to/database.db"
}
```

### 3. Default Path (Final Fallback)

If no configuration is provided, the database will be stored at:
```
~/.config/pm-ai/pmai.db
```

### Development vs Production

- **Development**: Uses `./drizzle/pmai.db` (local project directory)
- **Production**: Uses `~/.config/pm-ai/pmai.db` (user config directory)

**Note**: All PM-AI production data (config and database) is stored in `~/.config/pm-ai/` by default.

### CLI Config Commands

PM-AI includes CLI commands to manage configuration:

```bash
# Set a configuration value
pm-ai config:set dbPath /custom/path/db.db

# Get all configuration values
pm-ai config:get

# Get a specific configuration value
pm-ai config:get dbPath

# Edit config file in your default editor
pm-ai config:edit
```

### Configuration Priority

The configuration system uses the following priority order (highest to lowest):

1. **Environment variable** (`PMAI_DB_PATH`) - Highest priority, typically set in MCP client config
2. **Global config file** (`~/.config/pm-ai/config.json`) - Fallback if no environment variable
3. **Default path** (`~/.config/pm-ai/pmai.db`) - Final fallback

### Data Location

All PM-AI data (configuration and database) is stored in `~/.config/pm-ai/` by default:
- **Config file**: `~/.config/pm-ai/config.json`
- **Database**: `~/.config/pm-ai/pmai.db`

### Directory Creation

The server automatically creates parent directories as needed. For example, if you specify `/custom/data/pmai.db`, the `/custom/data/` directory will be created automatically.

## Usage

### Development

Run the server in development mode:
```bash
npm run dev
```

### Production

Start the server:
```bash
npm start
```

### MCP Configuration

Add to your `.claude/mcp.json`:

```json
{
  "servers": {
    "pmai": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

## MCP Tools

### `save_plan`

Save a project plan with its markdown content and optional structured tasks.

**Parameters:**
- `project_id` (string): The ID of the project
- `title` (string): The title of the plan
- `markdown` (string): The markdown content of the plan
- `tasks` (array, optional): Array of tasks with the following structure:
  - `title` (string): Task title
  - `description` (string, optional): Task description
  - `priority` (string, optional): "high" | "medium" | "low"
  - `dependencies` (array, optional): Array of task IDs this depends on
  - `flag` (string, optional): Any flags (e.g., "blocking", "needs-review")
  - `status` (string, optional): "planned" | "review" | "done"

### `update_task`

Update a single field or multiple fields of an existing task.

**Parameters:**
- `task_id` (string): The ID of the task to update
- `status` (string, optional): New status: "planned" | "review" | "done"
- `priority` (string, optional): New priority: "high" | "medium" | "low"
- `title` (string, optional): New title for the task
- `description` (string, optional): New description for the task
- `flag` (string, optional): New flag for the task
- `dependencies` (array, optional): New dependencies (array of task IDs)

### `delete_task`

Delete a task permanently from the database.

**Parameters:**
- `task_id` (string): The ID of the task to delete

### `add_task_comment`

Add a comment to a task.

**Parameters:**
- `task_id` (string): The ID of the task to add a comment to
- `content` (string): The comment content to add

### `search_tasks`

Search for tasks by keyword in title or description.

**Parameters:**
- `project_id` (string): The ID of the project to search in
- `query` (string): Search query to match against task titles and descriptions

### `filter_tasks`

Filter tasks by status, priority, plan ID, or any combination of these criteria.

**Parameters:**
- `project_id` (string): The ID of the project to filter tasks in
- `status` (array, optional): Filter by task status (one or more): "planned" | "review" | "done"
- `priority` (array, optional): Filter by task priority (one or more): "high" | "medium" | "low"
- `plan_id` (string, optional): Filter by specific plan ID

### `get_task_dependencies`

Get dependency information for a task (upstream dependencies and/or downstream dependents).

**Parameters:**
- `task_id` (string): The ID of the task to get dependencies for
- `type` (string, optional): Type of dependencies to retrieve: "upstream" | "downstream" | "both" (default: "both")

### `get_critical_path`

Get the critical path (longest dependency chain) for a project to identify bottlenecks.

**Parameters:**
- `project_id` (string): The ID of the project to analyze
- `check_circular` (boolean, optional): Also check for circular dependencies (default: false)

## MCP Prompts

### `breakdown_markdown_plan`

Convert a markdown project plan into structured tasks.

**Parameters:**
- `markdown` (string): The markdown content to breakdown
- `project_id` (string): The project ID

## MCP Resources

- `pmai://plans/{project_id}` - Get all plans for a project
- `pmai://tasks/{project_id}` - Get all tasks for a project with plan information
- `pmai://progress/{project_id}` - Get progress statistics for a project including:
  - Total task count
  - Tasks by status (planned, in review, completed)
  - Completion percentage
  - Breakdown by priority with completion rates
  - Status distribution percentages

## Database Schema

### Tables

**projects**
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `created_at` (TEXT)

**plans**
- `id` (TEXT, PRIMARY KEY)
- `project_id` (TEXT, FOREIGN KEY → projects)
- `title` (TEXT, NOT NULL)
- `markdown` (TEXT, NOT NULL)
- `created_at` (TEXT)

**tasks**
- `id` (TEXT, PRIMARY KEY)
- `plan_id` (TEXT, FOREIGN KEY → plans)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `flag` (TEXT)
- `priority` (TEXT)
- `dependencies` (TEXT, JSON array of task IDs)
- `status` (TEXT): "planned" | "review" | "done"

**task_comments**
- `id` (TEXT, PRIMARY KEY)
- `task_id` (TEXT, FOREIGN KEY → tasks)
- `content` (TEXT, NOT NULL)
- `created_at` (TEXT)

## Example Workflow

1. User generates Markdown planning in Claude
2. User says: "Simpan plan ini ke PMAI MCP"
3. Claude uses `breakdown_markdown_plan` prompt
4. Claude generates structured tasks
5. Claude calls `save_plan` tool
6. Server saves plan + tasks to SQLite
7. Later: Claude retrieves via `pmai://plans/{id}` and `pmai://tasks/{id}`

## Project Structure

```
pm-ai/
├── src/
│   ├── index.ts                        # MCP server entry point
│   ├── db/
│   │   ├── client.ts                   # Drizzle SQLite client
│   │   └── schema.ts                   # Database schema definitions
│   ├── services/
│   │   ├── projectService.ts           # Project CRUD operations
│   │   ├── planService.ts              # Plan CRUD operations
│   │   ├── taskService.ts              # Task CRUD operations
│   │   ├── commentService.ts           # Task comment operations
│   │   ├── progressService.ts          # Progress tracking & statistics
│   │   ├── taskQueryService.ts         # Task search & filtering
│   │   └── dependencyGraphService.ts   # Dependency analysis
│   ├── utils/
│   │   └── graph.ts                    # Graph algorithms (topological sort, DFS, etc.)
│   ├── mcp/
│   │   ├── tools/
│   │   │   ├── savePlan.ts             # MCP tool: save_plan
│   │   │   ├── updateTask.ts           # MCP tool: update_task
│   │   │   ├── deleteTask.ts           # MCP tool: delete_task
│   │   │   ├── addTaskComment.ts       # MCP tool: add_task_comment
│   │   │   ├── searchTasks.ts          # MCP tool: search_tasks
│   │   │   ├── filterTasks.ts          # MCP tool: filter_tasks
│   │   │   ├── getTaskDependencies.ts  # MCP tool: get_task_dependencies
│   │   │   └── getCriticalPath.ts      # MCP tool: get_critical_path
│   │   ├── prompts/
│   │   │   └── breakdownMarkdownPlan.ts  # MCP prompt
│   │   └── resources/
│   │       ├── plans.ts                # Resource: pmai://plans/{id}
│   │       ├── tasks.ts                # Resource: pmai://tasks/{id}
│   │       └── progress.ts             # Resource: pmai://progress/{id}
│   └── scripts/
│       └── createProject.ts            # Script to create a new project
├── drizzle/
│   └── (migrations folder)
├── drizzle.config.ts                   # Drizzle Kit config
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
