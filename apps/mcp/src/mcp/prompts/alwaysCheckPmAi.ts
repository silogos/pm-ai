import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Prompt that enforces PM-AI first workflow
 * This should be listed prominently in the server so Claude sees it early
 */
export async function registerAlwaysCheckPmAiPrompt(server: McpServer): Promise<void> {
  server.registerPrompt(
    'always_check_pm_ai_first',
    {
      description: '⚠️ CRITICAL: Always check PM-AI database before starting any work. This prompt enforces the PM-AI first workflow.'
    },
    () => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `⚠️ CRITICAL REMINDER: PM-AI DATABASE IS THE SINGLE SOURCE OF TRUTH

Before starting ANY work, you MUST:

1. CHECK PM-AI FIRST
   - Run: show_workspace
   - Run: filter_tasks for the relevant feature
   - If a plan exists, work from those tasks

2. NEVER USE MARKDOWN AS PRIMARY STORAGE
   - Markdown files are for reference only
   - All task tracking must be in PM-AI database

3. AFTER COMPLETING WORK
   - Immediately run: update_task to mark as done
   - Do not wait for user to ask

4. MANDATORY TOOLS
   - show_workspace - See all features
   - filter_tasks - See tasks for a feature
   - save_plan - Create new plans in database
   - update_task - Mark tasks as done

Database: ~/.config/pm-ai/pmai.db
Dashboard: http://localhost:8787`
            }
          }
        ]
      };
    }
  );
}
