import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const InjectClaudeMdSchema = z.object({
  project_path: z.string().optional().describe('Optional: Project path where CLAUDE.md will be created/updated. Defaults to current working directory.'),
  overwrite: z.boolean().optional().describe('Optional: If true, overwrites existing PM-AI section. If false (default), appends or skips if exists.')
});

const PM_AI_START_MARKER = '<!-- PM-AI-START -->';
const PM_AI_END_MARKER = '<!-- PM-AI-END -->';

const PM_AI_CLAUDE_MD_CONTENT = `<!-- PM-AI-START -->
# PM-AI Workflow for AI Agents

⚠️ **CRITICAL: This project uses PM-AI database as the SINGLE SOURCE OF TRUTH for all project management.**

## STATE MUTATION RULE

Any action that changes project state MUST use a PM-AI tool.

This includes:
- Creating plans
- Updating plans
- Creating tasks
- Updating tasks
- Marking tasks complete

State changes must NEVER be done only in chat.
All state mutations require immediate database persistence via PM-AI tools.

## Plan Creation Rule

When creating a plan:
1. Generate the plan internally
2. Immediately call the \`save_plan\` tool
3. DO NOT output the plan markdown in chat
4. Only confirm after the plan is saved

Plans must never exist only in chat.
They must always be stored in PM-AI database.

## Standard Execution Pattern

When working on tasks:
1. Find the task in PM-AI
2. Mark task as "review"
3. Implement the work
4. Mark task as "done"

Never complete work without updating the task status.
Always use PM-AI tools for state transitions.

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

# Task execution pattern
"Mark task 'Implement auth' as review"
[...implement work...]
"Mark task 'Implement auth' as done"

# AFTER completing work
"Mark task 'Add tests' as done"
"Update task 'Refactor API' status to done"

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
6. **NEVER** output plan markdown in chat without calling \`save_plan\`
7. **MUST** mark tasks as "review" before starting work
8. **MUST** mark tasks as "done" after completing work

Database: ~/.config/pm-ai/pmai.db
Dashboard: http://localhost:8787
<!-- PM-AI-END -->`;

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

          // Try new detection method first (comment markers)
          let startMarkerIndex = existingContent.indexOf(PM_AI_START_MARKER);
          let endMarkerIndex = existingContent.indexOf(PM_AI_END_MARKER);

          // If no markers found, try old detection method (heading)
          if (startMarkerIndex === -1 || endMarkerIndex === -1) {
            const oldHeadingIndex = existingContent.indexOf('# PM-AI Workflow for AI Agents');
            if (oldHeadingIndex !== -1) {
              // Treat as existing section that will be replaced
              startMarkerIndex = oldHeadingIndex;
              // Find end by looking for next major heading or end of file
              const remainingContent = existingContent.substring(oldHeadingIndex);
              const nextHeadingMatch = remainingContent.match(/\n[^#]\n# /);
              endMarkerIndex = nextHeadingMatch
                ? oldHeadingIndex + nextHeadingMatch.index
                : existingContent.length;
              hasPmAiSection = true;
            }
          } else {
            // Both markers found
            hasPmAiSection = true;
          }

          // Handle partial markers (corrupted section)
          if ((startMarkerIndex === -1) !== (endMarkerIndex === -1)) {
            // Clean up corrupted section
            if (startMarkerIndex !== -1) {
              existingContent = existingContent.substring(0, startMarkerIndex).trim();
              hasPmAiSection = false;
            } else if (endMarkerIndex !== -1) {
              existingContent = existingContent.substring(endMarkerIndex + PM_AI_END_MARKER.length).trim();
              hasPmAiSection = false;
            }
          }

          if (hasPmAiSection) {
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
            const beforePmAi = existingContent.substring(0, startMarkerIndex).trim();
            const afterPmAi = endMarkerIndex < existingContent.length
              ? existingContent.substring(endMarkerIndex + (existingContent.includes(PM_AI_END_MARKER) ? PM_AI_END_MARKER.length : 0)).trim()
              : '';
            existingContent = beforePmAi + (afterPmAi ? '\n\n' + afterPmAi : '');
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

        // Validate that markers were written
        const writtenContent = fs.readFileSync(claudeMdPath, 'utf-8');
        if (!writtenContent.includes(PM_AI_START_MARKER) || !writtenContent.includes(PM_AI_END_MARKER)) {
          throw new Error('Validation failed: PM-AI markers not found in written file');
        }

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
