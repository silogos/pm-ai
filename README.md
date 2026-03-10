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

### `init_project`
Initialize a new project in PM-AI. Use this when starting work on a new project, folder, or package.

**Parameters:**
- `name` (string): The name of the project (can be a folder name, package name, or any project identifier)
- `description` (string, optional): Optional description or context for the project

**Returns:**
- `project_id`: The ID of the created project (use this for subsequent operations)
- If a project with the same name already exists, returns the existing project ID

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

## Workflows

### Workflow 1: Starting a New Project

Use this workflow when you want to start managing a new project or folder with PM-AI.

**Step 1: Initialize the project**
```
User: "I want to start tracking my work on the 'packages/auth' folder"

Claude uses: init_project tool
{
  "name": "packages/auth",
  "description": "Authentication module with OAuth and JWT support"
}

Returns: project_id (e.g., "abc-123-def")
```

**Step 2: Create a project plan**
```
User: "Here's my plan for the auth module: [paste markdown plan]"

Claude uses: save_plan tool
{
  "project_id": "abc-123-def",
  "title": "Authentication Implementation Plan",
  "markdown": "# Auth Module\n\n## Features\n- OAuth 2.0\n- JWT tokens\n- ..."
}

Returns: plan_id
```

**Step 3: Save tasks from the plan**
```
Claude uses: save_plan tool with tasks array
{
  "project_id": "abc-123-def",
  "title": "Authentication Implementation Plan",
  "tasks": [
    {
      "title": "Setup OAuth 2.0 providers",
      "priority": "high",
      "status": "planned"
    },
    {
      "title": "Implement JWT token generation",
      "priority": "high",
      "dependencies": ["[task_id_from_previous_task]"]
    }
  ]
}
```

### Workflow 2: Analyzing Project Progress

Use this workflow to check the status and progress of an existing project.

**Step 1: Get project overview**
```
User: "Show me the progress of 'packages/auth' project"

Claude uses: pmai://progress/{project_id} resource

Returns: {
  "total_tasks": 25,
  "completed": 10,
  "in_review": 5,
  "planned": 10,
  "completion_percentage": 40,
  "priority_breakdown": {...}
}
```

**Step 2: View all tasks**
```
Claude uses: pmai://tasks/{project_id} resource

Returns: Array of all tasks with plan information
```

**Step 3: Check critical path**
```
Claude uses: get_critical_path tool
{
  "project_id": "abc-123-def",
  "check_circular": true
}

Returns: Longest dependency chain showing bottlenecks
```

### Workflow 3: Managing Task Dependencies

Use this workflow when working with complex task dependencies.

**Step 1: Get task dependencies**
```
User: "What tasks does 'Implement JWT tokens' depend on?"

Claude uses: get_task_dependencies tool
{
  "task_id": "task-123",
  "type": "upstream"
}

Returns: List of tasks that must be completed first
```

**Step 2: Check what's blocked**
```
User: "What tasks are blocked by 'Implement JWT tokens'?"

Claude uses: get_task_dependencies tool
{
  "task_id": "task-123",
  "type": "downstream"
}

Returns: List of tasks that depend on this task
```

**Step 3: Update task status**
```
User: "Mark 'Implement JWT tokens' as done"

Claude uses: update_task tool
{
  "task_id": "task-123",
  "status": "done"
}
```

### Workflow 4: Task Discovery and Filtering

Use this workflow to find specific tasks in your project.

**Search tasks:**
```
User: "Find all tasks related to 'testing'"

Claude uses: search_tasks tool
{
  "project_id": "abc-123-def",
  "query": "testing"
}

Returns: All tasks with 'testing' in title or description
```

**Filter by status:**
```
User: "Show me all high-priority tasks that are still planned"

Claude uses: filter_tasks tool
{
  "project_id": "abc-123-def",
  "priority": ["high"],
  "status": ["planned"]
}

Returns: Filtered list of tasks
```

### Workflow 5: Collaborative Task Management

Use this workflow for team collaboration and documentation.

**Add comment to task:**
```
User: "Add a note to the OAuth task about the provider limitations"

Claude uses: add_task_comment tool
{
  "task_id": "task-123",
  "content": "Note: Google OAuth has rate limits. Consider implementing caching."
}

Returns: Comment saved successfully
```

**View all comments:**
```
Claude queries database for task comments and displays them
```

### Workflow 6: Complex Planning with Dependencies

Use this workflow for detailed project planning with task dependencies.

**Step 1: Create detailed plan**
```
User: "I need to implement a payment system with these requirements:..."

Claude uses: breakdown_markdown_plan prompt
- Analyzes the markdown requirements
- Generates structured tasks
- Identifies dependencies automatically
```

**Step 2: Save plan with dependencies**
```
Claude uses: save_plan tool
{
  "project_id": "abc-123-def",
  "title": "Payment System Implementation",
  "tasks": [
    {
      "title": "Setup Stripe API",
      "priority": "high",
      "status": "planned",
      "dependencies": []
    },
    {
      "title": "Implement payment flow",
      "priority": "high",
      "status": "planned",
      "dependencies": ["[stripe_task_id]"]
    },
    {
      "title": "Add webhook handler",
      "priority": "medium",
      "status": "planned",
      "dependencies": ["[payment_flow_task_id]"]
    }
  ]
}
```

**Step 3: Validate dependencies**
```
Claude uses: get_critical_path tool to check for circular dependencies and identify the critical path
```

### Complete Example Conversation

```
User: I'm working on a new feature for user authentication

Claude: I'll help you set up project tracking for this. Let me create a project for it.

[Uses init_project tool]
✓ Created project "user-authentication" (ID: proj-001)

Claude: Project created! Now, can you tell me about the authentication features you want to implement?

User: We need OAuth login with Google and GitHub, JWT tokens, and password reset functionality.

Claude: Let me create a structured plan for this.

[Uses breakdown_markdown_plan prompt]
[Analyzes requirements and creates task breakdown]

[Uses save_plan tool with tasks]
✓ Saved plan "Authentication Implementation" with 8 tasks
  - Setup OAuth providers (high priority)
  - Implement JWT token generation (high priority)
  - Create password reset flow (medium priority)
  - Add session management (medium priority)
  - ... (4 more tasks)

Claude: I've created your authentication project with 8 tasks. The critical path shows that OAuth providers must be set up first, then JWT tokens, followed by the other features.

Would you like me to show you the dependency graph or start working on the first task?
```

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
