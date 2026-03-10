# PM-AI

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

### Web Dashboard
- **Visual Project Management**: Beautiful web interface for managing projects through a browser
- **Task Board (Kanban)**: Drag-and-drop task board with Planned, In Review, and Done columns
- **Plan Editor**: Markdown editor with live preview for creating and editing project plans
- **Dependency Graph**: Interactive visual graph showing task dependencies with critical path highlighting
- **Real-time Updates**: All changes via web dashboard are reflected in the MCP server data

### Architecture
- **Monorepo Structure**: Built with Turborepo for efficient build management
- **TypeScript**: Full type safety across the entire codebase
- **libSQL**: SQLite database with pure JavaScript client (no native dependencies)
- **Hono**: Modern HTTP framework for API server
- **Vite + React**: Fast development experience for web dashboard

## Installation

1. Clone the repository:
```bash
git clone https://github.com/silogos/pm-ai.git
cd pm-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

## Quick Start

### Start Everything (API + Web)
```bash
./run-dev.sh
```

Or manually:
```bash
# Terminal 1: Start API server
pnpm dev:api

# Terminal 2: Start web dashboard
pnpm dev:web
```

The API will be available at `http://localhost:3000` and the web dashboard at `http://localhost:5173`.

### Start MCP Server Only
```bash
pnpm dev:mcp
```

## Database

The database is automatically created and migrated on first run at:
```
~/.config/pm-ai/db.sqlite
```

No manual migration steps needed!

## Project Structure

```
pm-ai/
├── packages/
│   ├── core/              # Core business logic & database
│   │   ├── src/
│   │   │   ├── db/        # Database client & schema (Drizzle + libSQL)
│   │   │   ├── domain/    # Domain services
│   │   │   ├── types/     # TypeScript types
│   │   │   └── index.ts
│   │   └── drizzle/       # Database migrations
│   └── utils/             # Shared utilities (graph algorithms)
├── apps/
│   ├── api/               # REST API server (Hono)
│   │   └── src/
│   │       └── server/
│   │           └── routes/ # API routes
│   ├── mcp/               # MCP server
│   │   └── src/
│   │       ├── mcp/
│   │       │   ├── tools/     # MCP tools
│   │       │   ├── prompts/   # MCP prompts
│   │       │   └── resources/ # MCP resources
│   │       ├── config/    # Configuration management
│   │       ├── cli/       # CLI commands
│   │       └── index.ts   # MCP server entry
│   └── web/               # React web dashboard
│       └── src/
│           ├── components/ # React components
│           ├── services/   # API client
│           └── main.tsx
├── package.json           # Root package.json
├── turbo.json            # Turborepo config
├── tsconfig.base.json    # Base TypeScript config
└── run-dev.sh            # Start all services
```

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all services
pnpm dev:api          # Start API server only
pnpm dev:web          # Start web dashboard only
pnpm dev:mcp          # Start MCP server only

# Building
pnpm build            # Build all packages
pnpm build:api        # Build API server
pnpm build:web        # Build web dashboard
pnpm build:mcp        # Build MCP server

# Database
pnpm db:generate      # Generate new migration
pnpm db:migrate       # Apply migrations (auto-applied on start)

# Cleanup
pnpm clean            # Remove build artifacts
```

## MCP Tools

### `save_plan`
Save a project plan with markdown content and optional structured tasks.

**Parameters:**
- `project_id` (string): The project ID
- `title` (string): Plan title
- `markdown` (string): Markdown content
- `tasks` (array, optional): Structured tasks

### `update_task`
Update a task's status, priority, title, description, or dependencies.

**Parameters:**
- `task_id` (string): The task ID
- `status` (string, optional): "planned" | "review" | "done"
- `priority` (string, optional): "high" | "medium" | "low"
- `title` (string, optional): New title
- `description` (string, optional): New description
- `dependencies` (array, optional): Task IDs this depends on

### `delete_task`
Delete a task permanently.

**Parameters:**
- `task_id` (string): The task ID

### `add_task_comment`
Add a comment to a task.

**Parameters:**
- `task_id` (string): The task ID
- `content` (string): Comment content

### `search_tasks`
Search tasks by keyword in title or description.

**Parameters:**
- `project_id` (string): The project ID
- `query` (string): Search query

### `filter_tasks`
Filter tasks by status, priority, or plan ID.

**Parameters:**
- `project_id` (string): The project ID
- `status` (array, optional): Task statuses to filter
- `priority` (array, optional): Priorities to filter
- `plan_id` (string, optional): Plan ID to filter

### `get_task_dependencies`
Get dependency information for a task.

**Parameters:**
- `task_id` (string): The task ID
- `type` (string, optional): "upstream" | "downstream" | "both"

### `get_critical_path`
Get the critical path (longest dependency chain) for a project.

**Parameters:**
- `project_id` (string): The project ID
- `check_circular` (boolean, optional): Check for circular dependencies

## MCP Resources

- `pmai://plans/{project_id}` - Get all plans for a project
- `pmai://tasks/{project_id}` - Get all tasks with plan information
- `pmai://progress/{project_id}` - Get progress statistics

## MCP Prompts

### `breakdown_markdown_plan`
Convert a markdown project plan into structured tasks.

**Parameters:**
- `markdown` (string): Markdown content
- `project_id` (string): The project ID

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
- `priority` (TEXT): "high" | "medium" | "low"
- `dependencies` (TEXT): JSON array of task IDs
- `status` (TEXT): "planned" | "review" | "done"

**task_comments**
- `id` (TEXT, PRIMARY KEY)
- `task_id` (TEXT, FOREIGN KEY → tasks)
- `content` (TEXT, NOT NULL)
- `created_at` (TEXT)

## Tech Stack

- **Runtime**: Node.js 18+
- **Package Manager**: pnpm
- **Build Tool**: Turborepo
- **Language**: TypeScript
- **Database**: SQLite with libSQL client
- **ORM**: Drizzle ORM
- **API Server**: Hono
- **Web Framework**: React + Vite
- **MCP SDK**: Model Context Protocol SDK

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
