import { createProject } from '../services/projectService.js';
import { randomUUID } from 'node:crypto';

async function main() {
  const projectName = process.argv[2] || 'My First Project';
  const projectId = await createProject(projectName);
  console.log(`Project created successfully!`);
  console.log(`Project ID: ${projectId}`);
  console.log(`Project Name: ${projectName}`);
}

main().catch(console.error);
