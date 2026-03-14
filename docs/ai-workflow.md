# AI Workflow Guide

Complete workflows for AI agents working with PM-AI.

## Workflow 0: First-Time Setup

**IMPORTANT:** PM-AI MCP server checks for CLAUDE.md with PM-AI workflow before starting. If not found, it will show a warning but still start.

Use this workflow when setting up PM-AI in a new or existing project.

### Step 1: Inject PM-AI workflow to CLAUDE.md

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

### What gets added to CLAUDE.md

- Core workflow (initialize → save plans → work → track)
- Key tools reference (quick lookup)
- Quick examples for common tasks
- Important notes about working with PM-AI

### Step 2: Verify the setup

```
User: "What do you know about PM-AI?"

Claude: [Reads from CLAUDE.md and explains]
I can help you manage projects using PM-AI. Here's what I understand:
- PM-AI is a project management system with task tracking
- I can initialize projects, save plans, and track progress
- Available tools include: init_project, save_plan, update_task...
```

### Benefits

- ✅ AI agents understand PM-AI workflow without explanation
- ✅ Server validates CLAUDE.md on startup (warns if missing)
- ✅ Concise workflow - focused on agent interaction
- ✅ Consistent across all AI sessions

### When to re-run

- First time setting up PM-AI in a project
- To refresh the workflow (use `overwrite: true`)

## Workflow 0.5: Folder-Based Project Management

Use this workflow for natural, folder-based project management.

### Step 1: Initialize PM-AI in current folder

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

### What happens

- Creates `.pm-ai` config file in current directory
- Uses folder name as project name
- Links folder to project in database

### Step 2: Create markdown plan files

```
User creates: /path/to/project/plan-authentication.md
Content:
# Authentication Feature

## Tasks
- Implement OAuth login
- Add JWT token support
- Create password reset
```

### Step 3: Sync plans from files

```
User: "sync plans from files"

Claude uses: sync_current_folder tool

Returns: {
  "imported": 1,
  "updated": 0,
  "message": "Synced 1 new plan"
}
```

### Step 4: View workspace

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

### Benefits

- ✅ Natural folder-based workflow
- ✅ Projects linked to actual code folders
- ✅ Version control for plan files (.md in git)
- ✅ Quick workspace overview
- ✅ Auto-detection of project context

## Workflow 1: Starting a New Project

Use this workflow when you want to start managing a new project or folder with PM-AI.

### Step 1: Initialize the project

```
User: "I want to start tracking my work on the 'packages/auth' folder"

Claude uses: init_project tool
{
  "name": "packages/auth",
  "description": "Authentication module with OAuth and JWT support"
}

Returns: project_id (e.g., "abc-123-def")
```

### Step 2: Create a project plan

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

### Step 3: Save tasks from the plan

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

## Workflow 2: Analyzing Project Progress

Use this workflow to check the status and progress of an existing project.

### Step 1: Get project overview

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

### Step 2: View all tasks

```
Claude uses: pmai://tasks/{project_id} resource

Returns: Array of all tasks with plan information
```

### Step 3: Check critical path

```
Claude uses: get_critical_path tool
{
  "project_id": "abc-123-def",
  "check_circular": true
}

Returns: Longest dependency chain showing bottlenecks
```

## Workflow 3: Managing Task Dependencies

Use this workflow when working with complex task dependencies.

### Step 1: Get task dependencies

```
User: "What tasks does 'Implement JWT tokens' depend on?"

Claude uses: get_task_dependencies tool
{
  "task_id": "task-123",
  "type": "upstream"
}

Returns: List of tasks that must be completed first
```

### Step 2: Check what's blocked

```
User: "What tasks are blocked by 'Implement JWT tokens'?"

Claude uses: get_task_dependencies tool
{
  "task_id": "task-123",
  "type": "downstream"
}

Returns: List of tasks that depend on this task
```

### Step 3: Update task status

```
User: "Mark 'Implement JWT tokens' as done"

Claude uses: update_task tool
{
  "task_id": "task-123",
  "status": "done"
}
```

## Workflow 4: Task Discovery and Filtering

Use this workflow to find specific tasks in your project.

### Search tasks

```
User: "Find all tasks related to 'testing'"

Claude uses: search_tasks tool
{
  "project_id": "abc-123-def",
  "query": "testing"
}

Returns: All tasks with 'testing' in title or description
```

### Filter by status

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

## Workflow 5: Collaborative Task Management

Use this workflow for team collaboration and documentation.

### Add comment to task

```
User: "Add a note to the OAuth task about the provider limitations"

Claude uses: add_task_comment tool
{
  "task_id": "task-123",
  "content": "Note: Google OAuth has rate limits. Consider implementing caching."
}

Returns: Comment saved successfully
```

### View all comments

```
Claude queries database for task comments and displays them
```

## Workflow 6: Complex Planning with Dependencies

Use this workflow for detailed project planning with task dependencies.

### Step 1: Create detailed plan

```
User: "I need to implement a payment system with these requirements:..."

Claude uses: breakdown_markdown_plan prompt
- Analyzes the markdown requirements
- Generates structured tasks
- Identifies dependencies automatically
```

### Step 2: Save plan with dependencies

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

### Step 3: Validate dependencies

```
Claude uses: get_critical_path tool to check for circular dependencies and identify the critical path
```

## Complete Example Conversation

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

## Best Practices

### 1. Always Check Existing Work

Before creating new plans or tasks:
```
"Show workspace to see all features"
"Filter tasks for feature XYZ with status planned"
```

### 2. Update Status Immediately

After completing work:
```
"Mark task 'Implement auth' as done"
"Update task 'Add tests' status to done"
```

### 3. Use Dependencies Wisely

- Only create dependencies when tasks truly depend on each other
- Check for circular dependencies using `get_critical_path`
- Use the critical path to identify bottlenecks

### 4. Leverage Comments

- Document decisions and trade-offs
- Note blocking issues or dependencies
- Add context for future work

### 5. Sync Regularly

If using folder-based workflow:
- Run `sync_plans_from_files` after updating markdown files
- Keep markdown and database in sync
- Use version control for markdown files
