import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerBreakdownPrompt } from './breakdownMarkdownPlan.js';
import { registerExecutePlanPrompt } from './executePlan.js';
import { registerAlwaysCheckPmAiPrompt } from './alwaysCheckPmAi.js';
import { registerPrdGeneratePrompt } from './prdGenerate.js';
import { registerPlanGeneratePrompt } from './planGenerate.js';
import { registerTaskExecutePrompt } from './taskExecute.js';
import { registerTaskReviewPrompt } from './taskReview.js';

export async function registerPrompts(server: McpServer): Promise<void> {
  await registerAlwaysCheckPmAiPrompt(server);
  console.error('Prompt registered: always_check_pm_ai_first');

  await registerBreakdownPrompt(server);
  console.error('Prompt registered: breakdown_markdown_plan');

  await registerExecutePlanPrompt(server);
  console.error('Prompt registered: execute_plan');

  await registerPrdGeneratePrompt(server);
  console.error('Prompt registered: prd.generate');

  await registerPlanGeneratePrompt(server);
  console.error('Prompt registered: plan.generate');

  await registerTaskExecutePrompt(server);
  console.error('Prompt registered: task.execute');

  await registerTaskReviewPrompt(server);
  console.error('Prompt registered: task.review');
}
