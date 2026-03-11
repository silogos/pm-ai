import * as path from 'path';
import { getWorkspaceByPath } from './index.js';

/**
 * Detect the workspace for the current working directory
 * by walking up parent directories until a matching workspace is found
 *
 * @returns The workspace ID if found, null otherwise
 */
export async function detectWorkspace(): Promise<string | null> {
  return await detectWorkspaceFromPath(process.cwd());
}

/**
 * Detect the workspace for a given path
 * by walking up parent directories until a matching workspace is found
 *
 * @param startPath - The path to start from
 * @returns The workspace ID if found, null otherwise
 */
export async function detectWorkspaceFromPath(startPath: string): Promise<string | null> {
  let currentPath = path.resolve(startPath);

  // Walk up the directory tree, max 20 levels to prevent infinite loops
  for (let i = 0; i < 20; i++) {
    // Check if a workspace exists at this path
    const workspace = await getWorkspaceByPath(currentPath);
    if (workspace) {
      return workspace.id;
    }

    // Move to parent directory
    const parentPath = path.dirname(currentPath);

    // If we've reached the root directory, stop
    if (parentPath === currentPath) {
      break;
    }

    currentPath = parentPath;
  }

  // No workspace found
  return null;
}

/**
 * Get the workspace for the current working directory
 * Throws an error if no workspace is found
 *
 * @returns The workspace ID
 * @throws Error if no workspace is found
 */
export async function requireWorkspace(): Promise<string> {
  const workspaceId = await detectWorkspace();

  if (!workspaceId) {
    throw new Error(
      'No workspace found. Please run "init pm-ai" in your repository first.\n' +
      'Current directory: ' + process.cwd()
    );
  }

  return workspaceId;
}
