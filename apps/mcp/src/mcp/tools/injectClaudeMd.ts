import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const InjectClaudeMdSchema = z.object({
  project_path: z.string().optional().describe('Optional: Project path where CLAUDE.md will be created/updated. Defaults to current working directory.'),
  overwrite: z.boolean().optional().describe('Optional: If true, overwrites existing PM-AI section. If false (default), appends or skips if exists.')
});

const PM_AI_CLAUDE_MD_CONTENT = `# PM-AI Workflow for AI Agents

⚠️ **CRITICAL: This project uses PM-AI database as the SINGLE SOURCE OF TRUTH for all project management.**

## Mandatory Workflow

When working on this project, you MUST follow this workflow:

1. **Check for Existing Plans First**
   → Always ask: "What plans exist in PM-AI for this feature?"
   → Use \`show_workspace\` to see all features and their progress
   → Use \`filter_tasks\` to see tasks for a specific feature

2. **Before Starting Any Work**
   → Check if a plan already exists in PM-AI
   → If plan exists, work from those tasks - DO NOT create new plans
   → If no plan exists, use \`init_project\` or \`create_feature\` first

3. **When Creating New Plans**
   → Use \`save_plan\` tool to store in PM-AI database
   → NEVER write markdown files as the primary plan storage
   → Markdown files are only for reference, not tracking

4. **While Working**
   → Update task status in PM-AI: \`update_task\`
   → Check critical path: \`get_critical_path\`
   → Mark tasks as "done" immediately after completion

5. **After Completing Work**
   → ALWAYS update the corresponding task in PM-AI to "done"
   → Do not rely on markdown files for completion status

## Key MCP Tools (MUST USE)

- \`show_workspace\` - List all features before starting
- \`filter_tasks\` - See tasks for a feature (by status/priority)
- \`save_plan\` - Save plans to PM-AI database (NOT markdown)
- \`update_task\` - Mark tasks as done/planned/review
- \`get_critical_path\` - Find blocking tasks
- \`open_dashboard\` - Visual view at http://localhost:8787

## Examples

\`\`\`
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
\`\`\`

## CRITICAL RULES

1. **NEVER** use markdown files as the source of truth
2. **ALWAYS** check PM-AI database before creating new plans
3. **MUST** update task status in PM-AI after completing work
4. **NEVER** create duplicate plans if one already exists
5. **ALWAYS** use PM-AI tools for progress tracking

Database: ~/.config/pm-ai/pmai.db
Dashboard: http://localhost:8787
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
