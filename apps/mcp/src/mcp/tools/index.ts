import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerInitProjectTool } from './initProject.js';
import { registerInitWorkspaceInCurrentFolderTool } from './initWorkspaceInCurrentFolder.js';
import { registerCreateFeatureTool } from './createFeature.js';
import { registerSavePlanTool } from './savePlan.js';
import { registerUpdateTaskTool } from './updateTask.js';
import { registerDeleteTaskTool } from './deleteTask.js';
import { registerAddTaskCommentTool } from './addTaskComment.js';
import { registerSearchTasksTool } from './searchTasks.js';
import { registerFilterTasksTool } from './filterTasks.js';
import { registerGetTaskDependenciesTool } from './getTaskDependencies.js';
import { registerGetCriticalPathTool } from './getCriticalPath.js';
import { registerInjectClaudeMdTool } from './injectClaudeMd.js';
import { registerGetTaskTool } from './getTask.js';
import { registerCreateTasksTool } from './createTasks.js';
import { registerGetCommentsTool } from './getComments.js';
import { registerDeleteCommentTool } from './deleteComment.js';
import { registerGetPlanTool } from './getPlan.js';
import { registerUpdatePlanTool } from './updatePlan.js';
import { registerGetFeatureTool } from './getFeature.js';
import { registerUpdateFeatureTool } from './updateFeature.js';
import { registerGetWorkspaceTool } from './getWorkspace.js';
import { registerListWorkspacesTool } from './listWorkspaces.js';
import { registerAutoExecutePlanTool } from './autoExecutePlan.js';
import { registerOpenDashboardTool } from './openDashboard.js';
import { registerScanWorkspaceTool, registerScanCurrentWorkspaceTool } from './scanWorkspace.js';

export async function registerTools(server: McpServer): Promise<void> {
  await registerInitProjectTool(server);
  console.error('Tool registered: init_project');

  await registerInitWorkspaceInCurrentFolderTool(server);
  console.error('Tool registered: init_workspace_in_current_folder');

  await registerCreateFeatureTool(server);
  console.error('Tool registered: create_feature');

  await registerScanWorkspaceTool(server);
  console.error('Tool registered: scan_workspace');

  await registerScanCurrentWorkspaceTool(server);
  console.error('Tool registered: show_workspace');

  await registerInjectClaudeMdTool(server);
  console.error('Tool registered: inject_claude_md');

  await registerSavePlanTool(server);
  console.error('Tool registered: save_plan');

  await registerUpdateTaskTool(server);
  console.error('Tool registered: update_task');

  await registerDeleteTaskTool(server);
  console.error('Tool registered: delete_task');

  await registerAddTaskCommentTool(server);
  console.error('Tool registered: add_task_comment');

  await registerSearchTasksTool(server);
  console.error('Tool registered: search_tasks');

  await registerFilterTasksTool(server);
  console.error('Tool registered: filter_tasks');

  await registerGetTaskDependenciesTool(server);
  console.error('Tool registered: get_task_dependencies');

  await registerGetCriticalPathTool(server);
  console.error('Tool registered: get_critical_path');

  await registerOpenDashboardTool(server);
  console.error('Tool registered: open_dashboard');

  await registerGetTaskTool(server);
  console.error('Tool registered: get_task');

  await registerCreateTasksTool(server);
  console.error('Tool registered: create_tasks');

  await registerGetCommentsTool(server);
  console.error('Tool registered: get_comments');

  await registerDeleteCommentTool(server);
  console.error('Tool registered: delete_comment');

  await registerGetPlanTool(server);
  console.error('Tool registered: get_plan');

  await registerUpdatePlanTool(server);
  console.error('Tool registered: update_plan');

  await registerGetFeatureTool(server);
  console.error('Tool registered: get_feature');

  await registerUpdateFeatureTool(server);
  console.error('Tool registered: update_feature');

  await registerGetWorkspaceTool(server);
  console.error('Tool registered: get_workspace');

  await registerListWorkspacesTool(server);
  console.error('Tool registered: list_workspaces');

  await registerAutoExecutePlanTool(server);
  console.error('Tool registered: auto_execute_plan');
}
