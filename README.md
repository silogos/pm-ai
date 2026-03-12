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

### Folder-Based Workflow

- **Folder-Linked Projects**: Link projects to folders for automatic context
- **Markdown Plan Sync**: Import `.md` files as plans with auto-detection
- **Workspace Overview**: View all projects across your workspace
- **Config-Based Init**: Natural language initialization creates `.pm-ai` config files

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

## Setup with Claude

PM-AI works as an MCP (Model Context Protocol) server that connects to Claude Desktop, Claude for VS Code, or other MCP-compatible clients.

### Claude Desktop Setup

1. **Open Claude Desktop Settings**
   - Click the **Settings** icon (gear) in the left sidebar
   - Or use keyboard shortcut: `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)

2. **Navigate to MCP Server Configuration**
   - Click on **Developer** in the left sidebar
   - Find the **MCP Servers** section

3. **Add PM-AI MCP Server**
   - Click **"Add MCP Server"** or **"+"** button
   - Enter a name: `pm-ai`
   - Choose connection type: **Command**

4. **Configure the Command**
   ```
   Command: node
   Arguments: /path/to/pm-ai/apps/mcp/dist/index.js
   ```

   **Full path example:**
   ```json
   {
     "command": "node",
     "args": ["/Users/yourname/Documents/Projects/pm-ai/apps/mcp/dist/index.js"]
   }
   ```

5. **Save and Restart**
   - Click **Save**
   - Restart Claude Desktop

6. **Verify Connection**
   - Start a new chat in Claude Desktop
   - Type: "What MCP tools do you have available?"
   - Claude should list PM-AI tools like `init_project`, `save_plan`, `update_task`, etc.

### Claude for VS Code Setup

1. **Open VS Code Settings**
   - Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
   - Search for "MCP"

2. **Find Claude MCP Configuration**
   - Look for **Claude MCP** section in settings
   - Or open settings.json directly

3. **Add PM-AI Configuration**
   ```json
   {
     "claude.mcpServers": {
       "pm-ai": {
         "command": "node",
         "args": ["/Users/yourname/Documents/Projects/pm-ai/apps/mcp/dist/index.js"],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

4. **Reload VS Code**
   - Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux)
   - Type "Reload Window" and press Enter

### MCP Configuration File (Alternative Method)

You can also configure PM-AI by creating/editing the MCP configuration file directly:

**Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "pm-ai": {
      "command": "node",
      "args": [
        "/Users/yourname/Documents/Projects/pm-ai/apps/mcp/dist/index.js"
      ],
      "env": {
        "PMAI_DB_PATH": "~/.config/pm-ai/db.sqlite"
      }
    }
  }
}
```

### Custom Database Path (Optional)

If you want to use a custom database location, set the `PMAI_DB_PATH` environment variable:

```json
{
  "mcpServers": {
    "pm-ai": {
      "command": "node",
      "args": ["/Users/yourname/Documents/Projects/pm-ai/apps/mcp/dist/index.js"],
      "env": {
        "PMAI_DB_PATH": "/custom/path/to/database.db"
      }
    }
  }
}
```

### Testing the Connection

After setting up PM-AI with Claude, try these test conversations:

**Test 1: Check Available Tools**
```
User: What tools can you use?

Claude: I have access to the PM-AI tools, including:
- init_project: Create new projects
- save_plan: Save project plans with tasks
- update_task: Update task status and details
- delete_task: Remove tasks
- add_task_comment: Add comments to tasks
- search_tasks: Search for tasks
- filter_tasks: Filter tasks by status/priority
- get_task_dependencies: View task dependencies
- get_critical_path: Analyze critical path
- open_dashboard: Open web dashboard
```

**Test 2: Create Your First Project**
```
User: I want to start tracking my work on a new project called "my-app"

Claude: [Uses init_project tool]
✓ Created project "my-app" with ID: abc-123-def
Your project is ready! You can now add plans and tasks to it.
```

**Test 3: Open Web Dashboard**
```
User: Open the PM-AI dashboard

Claude: [Uses open_dashboard tool]
✓ Opening dashboard in your default browser...
```

### Troubleshooting

**Problem: Claude doesn't show PM-AI tools**

**Solutions:**
1. Check the MCP server is built:
   ```bash
   cd pm-ai
   pnpm build
   ls apps/mcp/dist/index.js  # Should exist
   ```

2. Verify the path in your configuration is absolute (not relative):
   ```json
   {
     "command": "node",
     "args": ["/absolute/path/to/pm-ai/apps/mcp/dist/index.js"]
   }
   ```

3. Check Claude Desktop logs for errors:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%/Claude/logs/`
   - Linux: `~/.config/Claude/logs/`

4. Make sure Node.js is installed and in your PATH:
   ```bash
   node --version  # Should show v18 or higher
   which node     # Should show node installation path
   ```

**Problem: "Database not initialized" error**

**Solution:** The database is auto-created on first run. If you see this error:
1. Check write permissions for `~/.config/pm-ai/`
2. Try manually creating the directory:
   ```bash
   mkdir -p ~/.config/pm-ai
   ```

**Problem: Web dashboard doesn't open**

**Solutions:**
1. Check if another service is using port 3000
2. The MCP server logs will show the actual port if 3000 is busy
3. Access manually: `http://localhost:8787`

**Problem: Changes not reflected in web dashboard**

**Solution:** The web dashboard auto-refreshes, but you can manually refresh the page (`Cmd+R` or `F5`).

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

The API will be available at `http://localhost:8787` and the web dashboard at `http://localhost:6363`.

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

### `inject_claude_md`
Inject PM-AI workflow guide into CLAUDE.md. MCP server checks for this on startup.

**Parameters:**
- `project_path` (string, optional): Path to CLAUDE.md. Defaults to current directory.
- `overwrite` (boolean, optional): Replace existing PM-AI section.

**What it adds:**
- Core workflow (initialize → save plans → work → track)
- Key tools reference (quick lookup)
- Quick examples for common tasks
- Important notes

**Note:** Content is concise - focused on agent workflow, not comprehensive docs.

**When to use:**
- First time setting up PM-AI in a project

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

### `init_project_in_current_folder`
Initialize PM-AI in the current working directory. Creates a `.pm-ai` config file and links the folder to a project.

**Parameters:**
- `description` (string, optional): Optional description for the project

**What it does:**
- Detects current working directory automatically
- Uses folder name as project name
- Creates `.pm-ai` config file with project metadata
- Links folder to existing or new project in database

**When to use:**
- User says "init pm-ai", "set up PM-AI here", or "initialize PM-AI project"
- Starting work in a new folder/project

### `show_workspace` / `scan_workspace`
Show all PM-AI projects in the workspace.

**Parameters (scan_workspace only):**
- `workspace_path` (string, optional): Path to scan (defaults to current directory)
- `max_depth` (number, optional): Maximum depth to scan (default: 3)

**Returns:**
- List of all projects with statistics
- Task counts and completion percentages
- Folder paths for folder-linked projects

**When to use:**
- User says "show workspace", "list all PM-AI projects"
- Getting overview of all projects in workspace

### `sync_plans_from_files` / `sync_current_folder`
Scan a folder for markdown (`.md`) files and import them as plans.

**Parameters (sync_plans_from_files only):**
- `project_id` (string, optional): Project ID (auto-detected from `.pm-ai` if not provided)
- `folder_path` (string, optional): Folder path to scan (defaults to current directory)

**What it does:**
- Recursively scans folder for `.md` files
- Uses first heading (`# Title`) as plan title
- Creates or updates plans in database
- Skips files in hidden directories and node_modules

**When to use:**
- User says "sync plans from files", "import markdown files"
- After creating plan markdown files manually

**Config File Format (.pm-ai):**
```json
{
  "version": "1.0.0",
  "projectId": "uuid",
  "projectName": "my-project",
  "createdAt": "2026-03-11T00:00:00.000Z",
  "description": "Optional description"
}
```

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

### Workflow 0: First-Time Setup (Inject PM-AI Workflow)

**IMPORTANT:** PM-AI MCP server checks for CLAUDE.md with PM-AI workflow before starting. If not found, it will show a warning but still start.

Use this workflow when setting up PM-AI in a new or existing project.

**Step 1: Inject PM-AI workflow to CLAUDE.md**
```
User: "Setup PM-AI for this project"

Claude uses: inject_claude_md tool
{
  // Optional: specify custom path
  "project_path": "/path/to/project"
}

Returns: {
  "success": true,
  "file": "/path/to/project/CLAUDE.md",
  "message": "PM-AI workflow added to CLAUDE.md"
}
```

**What gets added to CLAUDE.md:**
- Core workflow (initialize → save plans → work → track)
- Key tools reference (quick lookup)
- Quick examples for common tasks
- Important notes about working with PM-AI

**Step 2: Verify the setup**
```
User: "What do you know about PM-AI?"

Claude: [Reads from CLAUDE.md and explains]
I can help you manage projects using PM-AI. Here's what I understand:
- PM-AI is a project management system with task tracking
- I can initialize projects, save plans, and track progress
- Available tools include: init_project, save_plan, update_task...
```

**Benefits:**
- ✅ AI agents understand PM-AI workflow without explanation
- ✅ Server validates CLAUDE.md on startup (warns if missing)
- ✅ Concise workflow - focused on agent interaction
- ✅ Consistent across all AI sessions

**When to re-run:**
- First time setting up PM-AI in a project
- To refresh the workflow (use `overwrite: true`)

### Workflow 0.5: Folder-Based Project Management

Use this workflow for natural, folder-based project management.

**Step 1: Initialize PM-AI in current folder**
```
User: "init pm-ai"

Claude uses: init_project_in_current_folder tool
{
  // No parameters needed - auto-detects current directory
}

Returns: {
  "project_id": "abc-123-def",
  "project_name": "my-project",
  "folder_path": "/path/to/current/folder",
  "config_file": "/path/to/current/folder/.pm-ai"
}
```

**What happens:**
- Creates `.pm-ai` config file in current directory
- Uses folder name as project name
- Links folder to project in database

**Step 2: Create markdown plan files**
```
User creates: /path/to/project/plan-authentication.md
Content:
# Authentication Feature

## Tasks
- Implement OAuth login
- Add JWT token support
- Create password reset
```

**Step 3: Sync plans from files**
```
User: "sync plans from files"

Claude uses: sync_current_folder tool

Returns: {
  "imported": 1,
  "updated": 0,
  "message": "Synced 1 new plan"
}
```

**Step 4: View workspace**
```
User: "show workspace"

Claude uses: show_workspace tool

Returns: {
  "total_projects": 3,
  "projects": [
    {
      "id": "abc-123-def",
      "name": "my-project",
      "folder_path": "/path/to/current/folder",
      "statistics": { "totalTasks": 3, "completed": 0 }
    },
    // ... more projects
  ]
}
```

**Benefits:**
- ✅ Natural folder-based workflow
- ✅ Projects linked to actual code folders
- ✅ Version control for plan files (.md in git)
- ✅ Quick workspace overview
- ✅ Auto-detection of project context

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
