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

# PM-AI Workflow for AI Agents

⚠️ **CRITICAL: This project uses PM-AI database as the SINGLE SOURCE OF TRUTH for all project management.**

## Mandatory Workflow

When working on this project, you MUST follow this workflow:

1. **Check for Existing Plans First**
   → Always ask: "What plans exist in PM-AI for this feature?"
   → Use `show_workspace` to see all features and their progress
   → Use `filter_tasks` to see tasks for a specific feature

2. **Before Starting Any Work**
   → Check if a plan already exists in PM-AI
   → If plan exists, work from those tasks - DO NOT create new plans
   → If no plan exists, use `init_project` or `create_feature` first

3. **When Creating New Plans**
   → Use `save_plan` tool to store in PM-AI database
   → NEVER write markdown files as the primary plan storage
   → Markdown files are only for reference, not tracking

4. **While Working**
   → Update task status in PM-AI: `update_task`
   → Check critical path: `get_critical_path`
   → Mark tasks as "done" immediately after completion

5. **After Completing Work**
   → ALWAYS update the corresponding task in PM-AI to "done"
   → Do not rely on markdown files for completion status

## Key MCP Tools (MUST USE)

- `show_workspace` - List all features before starting
- `filter_tasks` - See tasks for a feature (by status/priority)
- `save_plan` - Save plans to PM-AI database (NOT markdown)
- `update_task` - Mark tasks as done/planned/review
- `get_critical_path` - Find blocking tasks
- `open_dashboard` - Visual view at http://localhost:8787

## Examples

```
# BEFORE starting work - check existing
"Show workspace to see all features"
"Filter tasks for feature XYZ with status planned"

# Start new work (only if no plan exists)
"Init PM-AI for new-feature"
"Save this plan with tasks: [list tasks]"

# AFTER completing work
"Mark task 'Implement auth' as done"
"Update task 'Add tests' status to done"

# Check progress
"What's the critical path for feature XYZ?"
"Show progress of this feature"
```

## CRITICAL RULES

1. **NEVER** use markdown files as the source of truth
2. **ALWAYS** check PM-AI database before creating new plans
3. **MUST** update task status in PM-AI after completing work
4. **NEVER** create duplicate plans if one already exists
5. **ALWAYS** use PM-AI tools for progress tracking

Database: ~/.config/pm-ai/pmai.db
Dashboard: http://localhost:8787

