# PM-AI MCP Server

A **Model Context Protocol (MCP)** server for storing and managing project plans and tasks. This server enables Claude to save Markdown project planning as structured data in SQLite, then retrieve it later via MCP resources.

## Features

- **Save Plans**: Store Markdown project plans with structured tasks
- **Manage Tasks**: Organize tasks with priorities, dependencies, and status tracking
- **Project Organization**: Group plans and tasks by project
- **MCP Resources**: Retrieve plans and tasks via resource URIs (`pmai://plans/{id}`, `pmai://tasks/{id}`)

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
  - `dependencies` (array, optional): Array of task titles this depends on
  - `flag` (string, optional): Any flags (e.g., "blocking", "needs-review")
  - `status` (string, optional): "planned" | "review" | "done"

## MCP Prompts

### `breakdown_markdown_plan`

Convert a markdown project plan into structured tasks.

**Parameters:**
- `markdown` (string): The markdown content to breakdown
- `project_id` (string): The project ID

## MCP Resources

- `pmai://plans/{project_id}` - Get all plans for a project
- `pmai://tasks/{project_id}` - Get all tasks for a project

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
- `dependencies` (TEXT, JSON)
- `status` (TEXT)

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
│   ├── index.ts                    # MCP server entry point
│   ├── db/
│   │   ├── client.ts               # Drizzle SQLite client
│   │   └── schema.ts               # Database schema definitions
│   ├── services/
│   │   ├── projectService.ts       # Project CRUD operations
│   │   ├── planService.ts          # Plan CRUD operations
│   │   └── taskService.ts          # Task CRUD operations
│   └── mcp/
│       ├── tools/
│       │   └── savePlan.ts         # MCP tool: save_plan
│       ├── prompts/
│       │   └── breakdownMarkdownPlan.ts  # MCP prompt
│       └── resources/
│           ├── plans.ts            # Resource: pmai://plans/{id}
│           └── tasks.ts            # Resource: pmai://tasks/{id}
├── drizzle/
│   └── (migrations folder)
├── drizzle.config.ts               # Drizzle Kit config
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
