# MCP Tools Reference

Complete reference for all PM-AI MCP tools.

## Project Management

### `init_project`

Initialize a new project in PM-AI. Use this when starting work on a new project, folder, or package.

**Parameters:**
- `name` (string): The name of the project (can be a folder name, package name, or any project identifier)
- `description` (string, optional): Optional description or context for the project

**Returns:**
- `project_id`: The ID of the created project (use this for subsequent operations)
- If a project with the same name already exists, returns the existing project ID

### `create_feature`

Create a new feature in the current workspace. Features represent domain areas or components within your repository.

**Parameters:**
- `name` (string): Name of the feature (e.g., "Authentication", "Checkout", "User Management")
- `description` (string, optional): Optional description for the feature

**Returns:**
- `feature_id`: The ID of the created feature

### `get_feature`

Get a single feature by ID with full details.

**Parameters:**
- `feature_id` (string): The ID of the feature to retrieve

### `update_feature`

Update feature description.

**Parameters:**
- `feature_id` (string): The ID of the feature to update
- `description` (string): New description for the feature

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

## Plan Management

### `save_plan`

Save a project plan with markdown content and optional structured tasks.

**Parameters:**
- `feature_id` (string, optional): The ID of the feature to save the plan to (auto-detects workspace if not provided)
- `feature_name` (string, optional): The name of the feature (will create feature if it doesn't exist)
- `title` (string): Plan title
- `markdown` (string): Markdown content
- `tasks` (array, optional): Structured tasks

**Task Object Structure:**
```typescript
{
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  status?: "planned" | "review" | "done";
  flag?: string;
  dependencies?: string[];  // Array of task IDs
}
```

### `get_plan`

Get a single plan by ID with full details.

**Parameters:**
- `plan_id` (string): The ID of the plan to retrieve

### `update_plan`

Update plan title and/or markdown content.

**Parameters:**
- `plan_id` (string): The ID of the plan to update
- `title` (string, optional): New title for the plan
- `markdown` (string, optional): New markdown content for the plan

## Task Management

### `create_tasks`

Create multiple tasks at once for a plan.

**Parameters:**
- `plan_id` (string): The ID of the plan to add tasks to
- `tasks` (array): Array of task objects to create

### `get_task`

Get a single task by ID with full details.

**Parameters:**
- `task_id` (string): The ID of the task to retrieve

### `update_task`

Update a single field or multiple fields of an existing task.

**Parameters:**
- `task_id` (string): The ID of the task to update
- `status` (string, optional): "planned" | "review" | "done"
- `priority` (string, optional): "high" | "medium" | "low"
- `title` (string, optional): New title for the task
- `description` (string, optional): New description for the task
- `flag` (string, optional): New flag for the task
- `dependencies` (array, optional): New dependencies (array of task IDs)

### `delete_task`

Delete a task permanently from the database.

**Parameters:**
- `task_id` (string): The ID of the task to delete

### `search_tasks`

Search for tasks by keyword in title or description.

**Parameters:**
- `feature_id` (string): The ID of the feature to search in
- `query` (string): Search query to match against task titles and descriptions

### `filter_tasks`

Filter tasks by status, priority, plan ID, or any combination of these criteria.

**Parameters:**
- `feature_id` (string): The ID of the feature to filter tasks in
- `status` (array, optional): Task statuses to filter ("planned", "review", "done")
- `priority` (array, optional): Task priorities to filter ("high", "medium", "low")
- `plan_id` (string, optional): Filter by specific plan ID

### `get_task_dependencies`

Get dependency information for a task (upstream dependencies and/or downstream dependents).

**Parameters:**
- `task_id` (string): The ID of the task to get dependencies for
- `type` (string, optional): "upstream" | "downstream" | "both" (default: "both")

### `get_critical_path`

Get the critical path (longest dependency chain) for a feature to identify bottlenecks.

**Parameters:**
- `feature_id` (string): The ID of the feature to analyze
- `check_circular` (boolean, optional): Also check for circular dependencies (default: false)

## Comments

### `add_task_comment`

Add a comment to a task.

**Parameters:**
- `task_id` (string): The ID of the task to add a comment to
- `content` (string): The comment content to add

### `get_comments`

Get all comments for a specific task.

**Parameters:**
- `task_id` (string): The ID of the task to get comments for

### `delete_comment`

Delete a comment by ID.

**Parameters:**
- `comment_id` (string): The ID of the comment to delete

## Workspace Management

### `init_workspace_in_current_folder`

Initialize PM-AI in the current working directory. Creates a workspace in the database.

**Parameters:**
- `description` (string, optional): Optional description for the workspace (repo)

### `list_workspaces`

List all workspaces in the database.

**Parameters:**
- `include_features` (boolean, optional): Whether to include features in the response (default: false)

### `get_workspace`

Get a single workspace by ID with full details including features.

**Parameters:**
- `workspace_id` (string): The ID of the workspace to retrieve

## Execution

### `auto_execute_plan`

Automatically execute all pending tasks in a plan. Returns tasks in execution order with full context for autonomous completion.

**Parameters:**
- `plan_id` (string): Plan ID to auto-execute
- `include_full_context` (boolean, optional): Include full context from completed tasks (default: false)

## Utilities

### `inject_claude_md`

Inject PM-AI workflow guide into CLAUDE.md. MCP server checks for this on startup.

**Parameters:**
- `project_path` (string, optional): Path to CLAUDE.md. Defaults to current directory.
- `overwrite` (boolean, optional): Replace existing PM-AI section. If false (default), appends or skips if exists.

**What it adds:**
- Core workflow (initialize → save plans → work → track)
- Key tools reference (quick lookup)
- Quick examples for common tasks
- Important notes

**Note:** Content is concise - focused on agent workflow, not comprehensive docs.

**When to use:**
- First time setting up PM-AI in a project
- To refresh the workflow (use `overwrite: true`)

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

### `open_dashboard`

Open the PM-AI web dashboard in your browser. Provides a visual interface for managing projects, viewing task boards, and analyzing dependencies.

**Parameters:**
- `project_id` (string, optional): Optional project ID to open a specific project directly

## MCP Resources

Read-only resources for accessing data:

- `pmai://plans/{project_id}` - Get all plans for a project
- `pmai://tasks/{project_id}` - Get all tasks with plan information
- `pmai://progress/{project_id}` - Get progress statistics

## MCP Prompts

Reusable AI prompts:

### `breakdown_markdown_plan`

Convert a markdown project plan into structured tasks.

**Parameters:**
- `markdown` (string): Markdown content
- `project_id` (string): The project ID
