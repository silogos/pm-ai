import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const InjectClaudeMdSchema = z.object({
  project_path: z.string().optional().describe('Optional: Project path where CLAUDE.md will be created/updated. Defaults to current working directory.'),
  overwrite: z.boolean().optional().describe('Optional: If true, overwrites existing PM-AI section. If false (default), appends or skips if exists.')
});

const PM_AI_CLAUDE_MD_CONTENT = `# PM-AI Workflow for AI Agents

This project uses PM-AI for project management. When working on this project, follow this workflow:

## Core Workflow

1. **Initialize Project First**
   → "Initialize PM-AI project for [feature/folder name]"
   → Returns project_id for tracking

2. **Breakdown & Save Plans**
   → After discussing requirements, ask to save plan
   → "Save this as PM-AI plan with these tasks..."
   → Auto-creates tasks with dependencies

3. **Work in Dependency Order**
   → Check critical path before starting: "What's the critical path?"
   → Work through tasks in order
   → Update status: "Mark [task] as done/in_review"

4. **Track Progress**
   → "Show project progress"
   → "Filter tasks by status: planned"
   → Use web dashboard for visual view

## Key Tools Reference

- \`init_project\` - Start tracking new work
- \`save_plan\` - Save plans with tasks
- \`update_task\` - Change task status/details
- \`get_critical_path\` - Find blockers
- \`open_dashboard\` - Visual UI (http://localhost:3000)

## Quick Examples

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

## Important Notes

- Always initialize PM-AI project before creating plans
- Let Claude handle task IDs and dependencies
- Update task status regularly for accurate progress
- Database: ~/.config/pm-ai/db.sqlite
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
          const pmAiSectionStart = existingContent.indexOf('# PM-AI Workflow for AI Agents');
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
                    message: 'PM-AI workflow already exists in CLAUDE.md',
                    note: 'Use overwrite: true to replace'
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
              action: input.overwrite && hasPmAiSection ? 'updated' : 'added',
              message: `PM-AI workflow ${input.overwrite && hasPmAiSection ? 'updated in' : 'added to'} CLAUDE.md`,
              note: 'AI agents will now understand PM-AI workflow for this project'
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
