# PM-AI Project

This is the PM-AI monorepo - a project management system with MCP server integration.

## Project Overview

PM-AI is a comprehensive project management system built with:
- **Monorepo structure** using Turborepo
- **MCP Server** for Claude/AI integration
- **libSQL** database (no native dependencies)
- **Hono** HTTP framework
- **React + Vite** web dashboard

## Architecture

```
pm-ai/
├── packages/
│   ├── core/       # Domain logic & database
│   └── utils/      # Shared utilities
├── apps/
│   ├── api/        # REST API (Hono)
│   ├── mcp/        # MCP Server
│   └── web/        # Web Dashboard
└── run-dev.sh      # Start all services
```

## PM-AI Workflow for AI Agents

This project uses PM-AI for project management. When working on this project, follow this workflow:

### Core Workflow

1. **Initialize Project First**
   → "Initialize PM-AI project for [feature/folder name]"
   → Returns project_id for tracking

2. **Breakdown & Save Plans**
   → After discussing requirements, ask to save plan
   → "Save this as a plan in PM-AI with these tasks..."
   → Auto-creates tasks with dependencies

3. **Work in Dependency Order**
   → Check critical path before starting: "What's the critical path?"
   → Work through tasks in order
   → Update status: "Mark [task] as done/in_review"

4. **Track Progress**
   → "Show project progress"
   → "Filter tasks by status: planned"
   → Use web dashboard for visual view

### Folder-Based Workflow

PM-AI now supports folder-based project management for a more natural workflow:

1. **Initialize PM-AI in Current Folder**
   → "init pm-ai" or "set up PM-AI here" or "initialize PM-AI project"
   → Creates `.pm-ai` config file in current directory
   → Uses folder name as project name

2. **Sync Markdown Plans**
   → "sync plans from files" or "import markdown files"
   → Scans folder for `.md` files
   → Each file becomes a plan (first heading = title)

3. **View Workspace**
   → "show workspace" or "list all PM-AI projects"
   → Shows all projects in workspace with statistics

4. **Create Plans Naturally**
   → After AI creates a plan, it asks: "Do you want to save this plan in PM-AI?"
   → Plans are automatically linked to the current folder's project

**Config File (.pm-ai):**
\`\`\`json
{
  "version": "1.0.0",
  "projectId": "uuid",
  "projectName": "my-project",
  "createdAt": "2026-03-11T00:00:00.000Z",
  "description": "Optional description"
}
\`\`\`

### Folder-Based Examples

\`\`\`
# Initialize in current folder
"init pm-ai"

# After creating plan markdown files
"sync plans from files"

# See all projects in workspace
"show workspace"

# Navigate to project folder and work
"show progress of this project"
\`\`\`

### Key Tools Reference

**Folder-Based Tools:**
- \`init_project_in_current_folder\` - Initialize PM-AI in current directory (creates .pm-ai config)
- \`scan_workspace\` / \`show_workspace\` - Show all PM-AI projects in workspace
- \`sync_plans_from_files\` / \`sync_current_folder\` - Import .md files as plans

**Core Tools:**
- \`init_project\` - Start tracking new work (with explicit name)
- \`save_plan\` - Save plans with tasks
- \`update_task\` - Change task status/details
- \`get_critical_path\` - Find blockers
- \`open_dashboard\` - Visual UI (http://localhost:3000)

### Quick Examples

\`\`\`
# Start new feature
"Init PM-AI for user-auth feature"

# After planning
"Save this plan with all the tasks we discussed"

# While working
"What's blocking the OAuth task?"
"Mark JWT task as done"

# Check status
"Show progress of user-auth project"
"What tasks are still planned?"
\`\`\`

### Important Notes

- Always initialize PM-AI project before creating plans
- Let Claude handle task IDs and dependencies
- Update task status regularly for accurate progress
- Database: ~/.config/pm-ai/db.sqlite

## Development

### Start All Services
\`\`\`
./run-dev.sh
\`\`\`

### Start Individual Services
\`\`\`
# API only
pnpm dev:api

# Web dashboard
pnpm dev:web

# MCP server
pnpm dev:mcp
\`\`\`

### Build
\`\`\`
pnpm build
\`\`\`

## Database

- **Location**: `~/.config/pm-ai/db.sqlite`
- **Auto-migration**: Applied on first run
- **ORM**: Drizzle with libSQL client

## MCP Server Setup

The MCP server is at: `apps/mcp/dist/index.js`

Configuration (for Claude Desktop/VS Code):
\`\`\`json
{
  "mcpServers": {
    "pmai": {
      "command": "node",
      "args": ["/absolute/path/to/pm-ai/apps/mcp/dist/index.js"]
    }
  }
}
\`\`\`

## Testing PM-AI MCP Integration

To test if PM-AI MCP is working:

1. **Check available tools:**
   ```
   "What MCP tools do you have?"
   ```
   Should list: init_project, save_plan, update_task, etc.

2. **Initialize test project:**
   ```
   "Init PM-AI project for test-feature"
   ```
   Should return project_id

3. **Open dashboard:**
   ```
   "Open PM-AI dashboard"
   ```
   Should open http://localhost:3000

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
