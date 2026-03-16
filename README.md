# PM-AI

**PM-AI is the missing project management layer for AI coding agents.**

It allows AI assistants like Claude to plan, execute, and track software projects using a structured database instead of scattered markdown files.

## Why PM-AI?

Traditional project management tools don't integrate well with AI workflows. PM-AI bridges this gap by providing:

- **AI-Native Design**: Built from the ground up for AI agent interaction
- **Single Source of Truth**: Database-driven tracking eliminates stale markdown files
- **Dependency Awareness**: Critical path analysis and circular dependency detection
- **Folder-Based Workflow**: Natural project management linked to your codebase
- **Visual Dashboard**: Beautiful web interface for human oversight
- **Zero Config**: Works out of the box with Claude Desktop, VS Code, and other MCP clients

## Core Features

### 🎯 Project Planning
- Store Markdown plans with structured tasks
- Auto-extract tasks from markdown content
- Link plans to features and workspaces

### ✅ Task Management
- Full CRUD operations for tasks
- Priority levels (high/medium/low)
- Status tracking (planned/review/done)
- Task dependencies with validation

### 📊 Progress Tracking
- Visual progress statistics
- Completion percentages
- Priority breakdowns
- Status filtering

### 🔗 Dependency Analysis
- Build dependency graphs
- Detect circular dependencies
- Identify critical paths
- Visualize in dashboard

### 🎨 Web Dashboard
- Task board (Kanban style)
- Plan editor with live preview
- Interactive dependency graph
- Real-time updates

### 📁 Folder-Based Workflow
- Link projects to folders
- Import markdown files as plans
- Workspace overview
- Natural language initialization

## How It Works

```
AI Agent (Claude)
        ↓
     MCP Tools
        ↓
     PM-AI Server
        ↓
     SQLite DB
        ↓
  Plans + Tasks + Dependencies
```

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

```bash
git clone https://github.com/silogos/pm-ai.git
cd pm-ai
pnpm install
pnpm build
pnpm dev
```

**Services:**
- API: `http://localhost:8787`
- Web Dashboard: `http://localhost:6363`
- MCP Server: Available via built dist files

**Start specific services:**
```bash
pnpm dev:api          # Start API server only
pnpm dev:web          # Start web dashboard only
pnpm dev:mcp          # Start MCP server only
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

### MCP Configuration File (Alternative)

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
        "PMAI_DB_PATH": "~/.config/pm-ai/pmai.db"
      }
    }
  }
}
```

## AI Workflow Example

```bash
# User: Create authentication feature with OAuth and JWT

> Claude: ✓ Feature created (user-authentication)
> Claude: ✓ Plan saved (8 tasks)

# User: Start OAuth implementation

> Claude: ✓ Task completed
> Claude: ✓ Status updated

# User: Show progress

> Claude: 12.5% complete (1/8 tasks done)
> Claude: Critical path: OAuth → JWT → Sessions → Reset
```

**See [docs/ai-workflow.md](docs/ai-workflow.md) for detailed workflows.**

## Architecture Overview

PM-AI is built as a modern monorepo using Turborepo:

```
pm-ai/
├── packages/
│   ├── core/       # Domain logic & database
│   └── utils/      # Shared utilities
├── apps/
│   ├── api/        # REST API (Hono)
│   ├── cli/        # Command-line interface
│   ├── mcp/        # MCP Server
│   └── web/        # Web Dashboard (React + Vite)
└── turbo.json      # Turborepo configuration
```

**Key Technologies:**
- **Monorepo**: Turborepo for efficient builds
- **Database**: SQLite with libSQL (no native dependencies)
- **API**: Hono HTTP framework
- **Web**: React 19 + Vite for dashboard
- **MCP**: Model Context Protocol SDK
- **CLI**: CAC (Command And Conquer) framework

**Database Location:** `~/.config/pm-ai/pmai.db`

**CLI Usage:**
```bash
# Show all CLI commands
pnpm pm-ai --help

# Example: Start the API server
pnpm pm-ai server

# Example: Initialize PM-AI in current folder
pnpm pm-ai init
```

## Documentation

For detailed information, see the documentation:

- [**Architecture**](docs/architecture.md) - Project structure, tech stack, and components
- [**MCP Tools**](docs/mcp-tools.md) - Complete reference for all MCP tools
- [**AI Workflow**](docs/ai-workflow.md) - Detailed workflows and examples
- [**Database**](docs/database.md) - Schema, migrations, and operations
- [**Dashboard**](docs/dashboard.md) - Web dashboard guide and features

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
