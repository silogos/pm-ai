import { createFeature, createWorkspace, getWorkspaceByPath } from '@pm-ai/core';

export async function createFeatureCommand(args: string[]): Promise<void> {
  const name = args[0];
  if (!name) {
    console.error('Usage: pm-ai create-feature <feature-name> [workspace-id]');
    process.exit(1);
  }

  const workspaceId = args[1];

  try {
    let finalWorkspaceId = workspaceId;

    // If no workspaceId provided, try to find workspace by current directory
    if (!finalWorkspaceId) {
      const { cwd } = await import('process');
      const currentPath = cwd();
      const existingWorkspace = await getWorkspaceByPath(currentPath);

      if (existingWorkspace) {
        finalWorkspaceId = existingWorkspace.id;
      } else {
        // Create a new workspace for the current directory
        const { basename } = await import('path');
        const folderName = basename(currentPath);
        finalWorkspaceId = await createWorkspace(folderName, currentPath);
        console.log(`Created new workspace for current directory: ${finalWorkspaceId}`);
      }
    }

    const featureId = await createFeature(name, finalWorkspaceId);
    console.log(`Feature created successfully!`);
    console.log(`Feature ID: ${featureId}`);
    console.log(`Feature Name: ${name}`);
    console.log(`Workspace ID: ${finalWorkspaceId}`);
  } catch (error) {
    console.error('Failed to create feature:', error);
    process.exit(1);
  }
}
