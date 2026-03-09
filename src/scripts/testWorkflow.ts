#!/usr/bin/env tsx

import * as projectService from '../services/projectService.js';
import * as planService from '../services/planService.js';
import * as taskService from '../services/taskService.js';

async function main() {
  console.log('🚀 PM-AI MCP Server - Workflow Test\n');

  // Step 1: Create a project
  console.log('📁 Creating project...');
  const projectId = await projectService.createProject('Test Project - E-commerce Platform');
  console.log(`✅ Project created: ${projectId}\n`);

  // Step 2: Create a plan with markdown
  console.log('📝 Creating plan with markdown...');
  const markdown = `# E-commerce Platform Development Plan

## Overview
Build a modern e-commerce platform with user authentication, product catalog, shopping cart, and payment processing.

## Features

### Phase 1: Core Infrastructure
- Set up project structure
- Configure development environment
- Set up database schema

### Phase 2: User Authentication
- Implement login/logout
- User registration
- Password reset functionality
- Session management

### Phase 3: Product Catalog
- Product listing page
- Product detail pages
- Search and filtering
- Category management

### Phase 4: Shopping Cart
- Add/remove items
- Cart persistence
- Quantity management

### Phase 5: Payment Processing
- Stripe integration
- Order management
- Payment confirmation
- Receipt generation
`;

  const planId = await planService.savePlan(
    projectId,
    'E-commerce Platform Development',
    markdown
  );
  console.log(`✅ Plan created: ${planId}\n`);

  // Step 3: Create tasks for the plan
  console.log('📋 Creating tasks...');
  const tasksInput = [
    {
      title: 'Set up project structure',
      description: 'Initialize the project with all necessary folders and configuration files',
      flag: 'infrastructure',
      priority: 'high' as const,
      dependencies: [],
      status: 'planned' as const
    },
    {
      title: 'Configure development environment',
      description: 'Set up local development environment with Docker and necessary services',
      flag: 'infrastructure',
      priority: 'high' as const,
      dependencies: ['1'],
      status: 'planned' as const
    },
    {
      title: 'Implement user authentication',
      description: 'Build login, logout, and registration functionality with JWT tokens',
      flag: 'feature',
      priority: 'high' as const,
      dependencies: ['1', '2'],
      status: 'planned' as const
    },
    {
      title: 'Build product catalog',
      description: 'Create product listing and detail pages with search and filtering',
      flag: 'feature',
      priority: 'medium' as const,
      dependencies: ['3'],
      status: 'planned' as const
    },
    {
      title: 'Implement shopping cart',
      description: 'Build shopping cart functionality with add/remove items and persistence',
      flag: 'feature',
      priority: 'medium' as const,
      dependencies: ['4'],
      status: 'planned' as const
    },
    {
      title: 'Integrate payment processing',
      description: 'Set up Stripe integration for payment processing',
      flag: 'feature',
      priority: 'high' as const,
      dependencies: ['5'],
      status: 'planned' as const
    }
  ];

  const savedTaskIds = await taskService.saveTasks(planId, tasksInput);
  console.log(`✅ Created ${savedTaskIds.length} tasks\n`);

  // Step 4: Retrieve and display the plan
  console.log('📖 Retrieving plan...');
  const retrievedPlan = await planService.getPlanById(planId);
  if (retrievedPlan) {
    console.log(`✅ Plan: ${retrievedPlan.title}`);
    console.log(`   Markdown preview: ${retrievedPlan.markdown.substring(0, 100)}...\n`);
  }

  // Step 5: Retrieve and display all tasks for the project
  console.log('📊 Retrieving all tasks for project...');
  const allTasks = await taskService.getTasks(projectId);
  console.log(`✅ Found ${allTasks.length} tasks:`);
  allTasks.forEach((task, index) => {
    const deps = taskService.parseDependencies(task.dependencies);
    console.log(`   ${index + 1}. [${task.priority || 'N/A'}] ${task.title}`);
    if (deps.length > 0) {
      console.log(`      Dependencies: ${deps.join(', ')}`);
    }
  });

  console.log('\n✅ Test completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Project ID: ${projectId}`);
  console.log(`   - Plan ID: ${planId}`);
  console.log(`   - Tasks: ${savedTaskIds.length} created`);
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
