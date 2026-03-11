import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dbPath = path.join(process.cwd(), 'test-pm-ai.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Generate IDs
const workspaceId = uuidv4();
const projectId = uuidv4();
const planId = uuidv4();

// Create workspace
db.prepare('INSERT INTO workspaces (id, name, path, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
  workspaceId,
  'test-workspace',
  process.cwd(),
  'Test workspace for React Flow migration',
  new Date().toISOString(),
  new Date().toISOString()
);

// Create project
db.prepare('INSERT INTO projects (id, workspace_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
  projectId,
  workspaceId,
  'Test React Flow Migration',
  'Test project for verifying React Flow dependency graph',
  new Date().toISOString(),
  new Date().toISOString()
);

// Create plan
db.prepare('INSERT INTO plans (id, project_id, title, markdown, created_at) VALUES (?, ?, ?, ?, ?)').run(
  planId,
  projectId,
  'React Flow Migration Plan',
  '# Test Plan for React Flow Migration\n\nThis is a test plan to verify the React Flow dependency graph works correctly.',
  new Date().toISOString()
);

// Create tasks with dependencies
const tasks = [
  { id: uuidv4(), title: 'Install dependencies', status: 'done', priority: 'high', dependencies: [] },
  { id: uuidv4(), title: 'Create TaskNode component', status: 'done', priority: 'high', dependencies: [] },
  { id: uuidv4(), title: 'Create TaskNode styles', status: 'done', priority: 'medium', dependencies: [] },
  { id: uuidv4(), title: 'Rewrite DependencyGraph', status: 'planned', priority: 'high', dependencies: [] },
  { id: uuidv4(), title: 'Test build and fix imports', status: 'planned', priority: 'high', dependencies: [] },
  { id: uuidv4(), title: 'Create test data', status: 'done', priority: 'medium', dependencies: [] },
  { id: uuidv4(), title: 'Verify visual rendering', status: 'review', priority: 'medium', dependencies: [] }
];

// Set up dependencies
tasks[3].dependencies = [tasks[0].id, tasks[1].id]; // Rewrite DependencyGraph depends on Install dependencies & Create TaskNode
tasks[4].dependencies = [tasks[3].id]; // Test build depends on Rewrite DependencyGraph
tasks[5].dependencies = [tasks[4].id]; // Create test data depends on Test build
tasks[6].dependencies = [tasks[5].id]; // Verify visual depends on Create test data

// Insert tasks
const insertTask = db.prepare('INSERT INTO tasks (id, plan_id, title, description, flag, priority, dependencies, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');

for (const task of tasks) {
  insertTask.run(
    task.id,
    planId,
    task.title,
    `Task: ${task.title}`,
    null,
    task.priority,
    JSON.stringify(task.dependencies),
    task.status
  );
}

console.log('✅ Created dummy data successfully!');
console.log('📊 Workspace ID:', workspaceId);
console.log('📁 Project ID:', projectId);
console.log('📋 Plan ID:', planId);
console.log('✨ Tasks created:', tasks.length);

db.close();
