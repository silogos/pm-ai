import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const InjectClaudeMdSchema = z.object({
  project_path: z.string().optional().describe('Optional: Project path where CLAUDE.md will be created/updated. Defaults to current working directory.'),
  overwrite: z.boolean().optional().describe('Optional: If true, overwrites existing PM-AI section. If false (default), appends or skips if exists.')
});

const PM_AI_CLAUDE_MD_CONTENT = `# PM-AI Integration Guide

This project uses **PM-AI** (Project Management AI) for intelligent task and project tracking. PM-AI helps manage project plans, tasks, dependencies, and progress through a Model Context Protocol (MCP) server.

## Quick Start with PM-AI

### 1. Initialize a New Project
When starting work on a new feature, folder, or component:

\`\`\`
"Initialize PM-AI project for [feature/folder name]"
\`\`\`

This creates a project tracker and returns a project_id for subsequent operations.

### 2. Create Project Plans
After breaking down requirements with Claude:

\`\`\`
"Save this as a plan in PM-AI with these tasks..."
\`\`\`

Claude will automatically:
- Create a structured plan with markdown content
- Save all identified tasks with priorities
- Set up task dependencies based on the breakdown

### 3. Track Task Progress
Update task status as you work:

\`\`\`
"Mark the [task name] as done"
"Update [task name] to in_review"
\`\`\`

### 4. View Project Status
Check overall progress anytime:

\`\`\`
"Show me the progress of this project"
"What's the critical path?"
"Are there any circular dependencies?"
\`\`\`

## Available PM-AI Tools

### Project Management
- **init_project**: Create new project tracker
- **save_plan**: Save plans with markdown and tasks
- **open_dashboard**: Open web dashboard (http://localhost:3000)

### Task Operations
- **update_task**: Change task status, priority, or details
- **delete_task**: Remove a task
- **add_task_comment**: Add notes or documentation to tasks

### Search & Discovery
- **search_tasks**: Find tasks by keyword
- **filter_tasks**: Filter by status, priority, or plan
- **get_task_dependencies**: View upstream/downstream dependencies

### Analysis
- **get_critical_path**: Identify bottlenecks and longest dependency chains

## Typical Workflow

1. **Planning Phase**
   - Use \`init_project\` to create project tracker
   - Break down requirements into tasks
   - Use \`save_plan\` to save plan with structured tasks
   - Claude auto-sets up dependencies

2. **Execution Phase**
   - Work through tasks in dependency order
   - Update task status as you complete them
   - Use \`get_critical_path\` to see what's blocking progress

3. **Review Phase**
   - Move tasks to "in_review" when ready
   - Use \`add_task_comment\` for review notes
   - Mark as "done" after approval

4. **Monitoring**
   - Check progress anytime: \`pmai://progress/{project_id}\`
   - View dependency graph in web dashboard
   - Use \`filter_tasks\` to find work by status

## Best Practices

✅ **Always initialize PM-AI project** when starting new work
✅ **Let Claude handle task breakdown** - use the \`breakdown_markdown_plan\` prompt
✅ **Update task status regularly** - keeps progress tracking accurate
✅ **Check critical path** before starting work - identify blockers early
✅ **Use task comments** - document decisions and context

❌ **Don't** manually manage task IDs - let Claude handle references
❌ **Don't** skip dependency tracking - critical for execution order
❌ **Don't** forget to update status - progress metrics depend on it

## Data Location

All PM-AI data is stored in: \`~/.config/pm-ai/db.sqlite\`

You can access the same project data from:
- MCP tools (Claude Desktop/VS Code)
- Web dashboard (http://localhost:3000)
- Direct database access

## Getting Help

If PM-AI tools aren't available:
1. Check MCP server is running
2. Verify configuration in Claude Desktop settings
3. Restart Claude Desktop

For issues or questions, refer to: https://github.com/silogos/pm-ai
`;

export async function registerInjectClaudeMdTool(server: McpServer): Promise<void> {
  server.tool(
    'inject_claude_md',
    'Inject PM-AI system guide into CLAUDE.md. This adds documentation about how to work with PM-AI so AI assistants understand the workflow and available tools.',
    InjectClaudeMdSchema.shape,
    async (input) => {
      try {
        // Determine project path
        let projectPath = input.project_path || process.cwd();

        // Resolve to absolute path
        if (!path.isAbsolute(projectPath)) {
          projectPath = path.resolve(process.cwd(), projectPath);
        }

        const claudeMdPath = path.join(projectPath, 'CLAUDE.md');

        // Check if CLAUDE.md exists
        let existingContent = '';
        let hasPmAiSection = false;

        if (fs.existsSync(claudeMdPath)) {
          existingContent = fs.readFileSync(claudeMdPath, 'utf-8');

          // Check if PM-AI section already exists
          const pmAiSectionStart = existingContent.indexOf('# PM-AI Integration Guide');
          if (pmAiSectionStart !== -1) {
            hasPmAiSection = true;

            if (!input.overwrite) {
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    already_exists: true,
                    file: claudeMdPath,
                    message: 'PM-AI section already exists in CLAUDE.md',
                    note: 'Use overwrite: true to replace the existing section'
                  }, null, 2)
                }]
              };
            }

            // Remove existing PM-AI section
            const beforePmAi = existingContent.substring(0, pmAiSectionStart).trim();
            existingContent = beforePmAi;
          }
        }

        // Prepare new content
        let newContent;
        if (existingContent.trim()) {
          // Append PM-AI section to existing content
          newContent = existingContent.trimEnd() + '\n\n' + PM_AI_CLAUDE_MD_CONTENT + '\n';
        } else {
          // Create new file with just PM-AI section
          newContent = PM_AI_CLAUDE_MD_CONTENT + '\n';
        }

        // Write to file
        fs.writeFileSync(claudeMdPath, newContent, 'utf-8');

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              file: claudeMdPath,
              action: input.overwrite && hasPmAiSection ? 'replaced' : 'created',
              message: `PM-AI system guide ${input.overwrite && hasPmAiSection ? 'updated in' : 'added to'} CLAUDE.md`,
              next_steps: [
                'AI assistants can now reference this guide when working on the project',
                'The guide explains PM-AI workflow, tools, and best practices',
                'Claude will understand how to use PM-AI for project management'
              ],
              note: 'You may want to customize the guide for your project-specific workflows'
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: 'Failed to inject PM-AI guide into CLAUDE.md',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
