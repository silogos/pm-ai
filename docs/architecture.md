# Architecture

## Tech Stack

- **Runtime**: Node.js 18+
- **Package Manager**: pnpm 10+
- **Build Tool**: Turborepo 2+
- **Language**: TypeScript 5+
- **Database**: SQLite with libSQL client
- **ORM**: Drizzle ORM
- **API Server**: Hono 4+
- **CLI Framework**: CAC (Command And Conquer)
- **Web Framework**: React 19 + Vite 7+
- **MCP SDK**: Model Context Protocol SDK

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
│   ├── cli/               # Command-line interface (CAC)
│   │   └── src/
│   │       └── index.ts   # CLI entry point
│   ├── mcp/               # MCP server
│   │   └── src/
│   │       ├── mcp/
│   │       │   ├── tools/     # MCP tools (with index.ts)
│   │       │   ├── prompts/   # MCP prompts (with index.ts)
│   │       │   └── resources/ # MCP resources (with index.ts)
│   │       ├── config/    # Configuration management
│   │       └── index.ts   # MCP server entry
│   └── web/               # React web dashboard
│       └── src/
│           ├── components/ # React components
│           ├── services/   # API client
│           └── main.tsx
├── package.json           # Root package.json
├── turbo.json            # Turborepo config
└── tsconfig.base.json    # Base TypeScript config
```

## Core Components

### Packages/Core

Contains the domain logic and database layer:

- **Database Client**: SQLite with libSQL (no native dependencies)
- **Schema**: Drizzle ORM schema definitions
- **Domain Services**: Business logic for projects, plans, tasks, dependencies
- **Types**: TypeScript types shared across the monorepo

### Packages/Utils

Shared utilities used across apps:

- **Graph Algorithms**: Critical path analysis, circular dependency detection
- **Task Sorting**: Topological sort for dependency-ordered task lists

### Apps/API

REST API server built with Hono:

- Exposes HTTP endpoints for project management
- Serves the web dashboard
- Provides CORS for cross-origin requests

### Apps/MCP

Model Context Protocol server:

- **Tools**: Interactive operations (init_project, save_plan, update_task, etc.)
- **Resources**: Read-only data access (plans, tasks, progress)
- **Prompts**: Reusable AI prompts (breakdown_markdown_plan, execute_plan)
- **Modular Registration**: Each category (tools/prompts/resources) has its own index.ts for registration

### Apps/CLI

Command-line interface built with CAC:

- `pm-ai init` - Initialize PM-AI in current folder
- `pm-ai server` - Start the API server
- `pm-ai dashboard` - Open the web dashboard

### Apps/Web

React-based web dashboard:

- **Task Board**: Kanban-style task management
- **Plan Editor**: Markdown editor with live preview
- **Dependency Graph**: Interactive visualization of task dependencies
- **Progress Tracking**: Visual statistics and completion metrics

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

## Data Flow

### MCP Server Flow

1. Claude/AI Assistant invokes MCP tool
2. MCP server receives request
3. Core domain logic processes operation
4. Database query executed via Drizzle ORM
5. Result returned to Claude/AI

### Web Dashboard Flow

1. User interacts with web UI
2. React component calls API service
3. HTTP request sent to API server (Hono)
4. API server calls core domain logic
5. Database query executed
6. Response returned and UI updated

## Dependency Graph Algorithm

PM-AI uses graph algorithms to analyze task dependencies:

- **Critical Path**: Longest path through the dependency graph
- **Circular Dependency Detection**: Detects impossible dependency chains
- **Topological Sort**: Orders tasks by dependency relationships

## Environment Configuration

### Database Location

Default: `~/.config/pm-ai/db.sqlite`

Custom path via environment variable:
```bash
export PMAI_DB_PATH=/custom/path/to/database.db
```

### API Server Port

Default: `http://localhost:8787`

### Web Dashboard Port

Default: `http://localhost:6363`

### MCP Server Entry Point

`apps/mcp/dist/index.js` (after build)
