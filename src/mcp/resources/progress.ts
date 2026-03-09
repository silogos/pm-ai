import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getProjectProgress } from '../../services/progressService.js';
import { getProjectById } from '../../services/projectService.js';

export async function registerProgressResource(server: McpServer): Promise<void> {
  // Create a resource template for progress
  const progressTemplate = new ResourceTemplate('pmai://progress/{project_id}', {
    list: async () => {
      // Return empty list as actual resources depend on project_id
      return {
        resources: []
      };
    }
  });

  // Register the resource template
  server.registerResource(
    'progress',
    progressTemplate,
    {
      description: 'Get progress statistics for a specific project'
    },
    async (uri, variables, _extra) => {
      try {
        const projectId = variables.project_id as string;

        // Verify project exists
        const project = await getProjectById(projectId);
        if (!project) {
          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: 'Project not found' }, null, 2)
            }]
          };
        }

        // Get progress stats
        const progress = await getProjectProgress(projectId);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              project_id: projectId,
              project_name: project.name,
              progress: {
                summary: {
                  total: progress.total,
                  planned: progress.planned,
                  in_review: progress.inReview,
                  completed: progress.completed,
                  completion_percentage: progress.percentage
                },
                by_priority: {
                  high: {
                    total: progress.byPriority.high.total,
                    completed: progress.byPriority.high.completed,
                    completion_rate: progress.byPriority.high.total > 0
                      ? Math.round((progress.byPriority.high.completed / progress.byPriority.high.total) * 100)
                      : 0
                  },
                  medium: {
                    total: progress.byPriority.medium.total,
                    completed: progress.byPriority.medium.completed,
                    completion_rate: progress.byPriority.medium.total > 0
                      ? Math.round((progress.byPriority.medium.completed / progress.byPriority.medium.total) * 100)
                      : 0
                  },
                  low: {
                    total: progress.byPriority.low.total,
                    completed: progress.byPriority.low.completed,
                    completion_rate: progress.byPriority.low.total > 0
                      ? Math.round((progress.byPriority.low.completed / progress.byPriority.low.total) * 100)
                      : 0
                  }
                },
                status_breakdown: {
                  planned_percentage: progress.total > 0 ? Math.round((progress.planned / progress.total) * 100) : 0,
                  in_review_percentage: progress.total > 0 ? Math.round((progress.inReview / progress.total) * 100) : 0,
                  completed_percentage: progress.percentage
                }
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              error: 'Failed to retrieve progress',
              details: error instanceof Error ? error.message : String(error)
            }, null, 2)
          }]
        };
      }
    }
  );
}
