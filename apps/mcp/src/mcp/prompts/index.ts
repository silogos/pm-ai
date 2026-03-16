import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerBreakdownPrompt } from './breakdownMarkdownPlan.js';
import { registerExecutePlanPrompt } from './executePlan.js';
import { registerAlwaysCheckPmAiPrompt } from './alwaysCheckPmAi.js';

export async function registerPrompts(server: McpServer): Promise<void> {
  await registerAlwaysCheckPmAiPrompt(server);
  console.error('Prompt registered: always_check_pm_ai_first');

  await registerBreakdownPrompt(server);
  console.error('Prompt registered: breakdown_markdown_plan');

  await registerExecutePlanPrompt(server);
  console.error('Prompt registered: execute_plan');
}
