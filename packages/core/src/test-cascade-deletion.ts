/**
 * Cascade Deletion Test Script
 *
 * This script verifies that the cascade deletion behavior works correctly
 * by creating test data and then deleting features/plans to ensure
 * all related records are removed.
 *
 * Run with: pnpm exec tsx packages/core/src/test-cascade-deletion.ts
 */

import { init, getDb, closeDatabase } from './db/client.js';
import { workspaces, features, plans, tasks } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

async function countRecords(table: any) {
  const db = getDb();
  const result = await db.select().from(table);
  return result.length;
}

async function setupTestWorkspace() {
  const db = getDb();
  const workspaceId = randomUUID();
  await db.insert(workspaces).values({
    id: workspaceId,
    name: `Test Workspace ${Date.now()}`,
    path: '/tmp/test-workspace'
  });
  return workspaceId;
}

async function createTestData(workspaceId: string) {
  const db = getDb();

  // Create feature
  const featureId = randomUUID();
  await db.insert(features).values({
    id: featureId,
    workspaceId,
    name: 'Test Feature for Cascade Deletion'
  });

  // Create plan 1
  const plan1Id = randomUUID();
  await db.insert(plans).values({
    id: plan1Id,
    featureId,
    title: 'Test Plan 1',
    markdown: '# Test Plan 1'
  });

  // Create plan 2
  const plan2Id = randomUUID();
  await db.insert(plans).values({
    id: plan2Id,
    featureId,
    title: 'Test Plan 2',
    markdown: '# Test Plan 2'
  });

  // Create tasks for plan 1
  const task1Id = randomUUID();
  await db.insert(tasks).values({
    id: task1Id,
    planId: plan1Id,
    title: 'Task 1 for Plan 1',
    status: 'planned'
  });

  const task2Id = randomUUID();
  await db.insert(tasks).values({
    id: task2Id,
    planId: plan1Id,
    title: 'Task 2 for Plan 1',
    status: 'planned'
  });

  // Create tasks for plan 2
  const task3Id = randomUUID();
  await db.insert(tasks).values({
    id: task3Id,
    planId: plan2Id,
    title: 'Task 1 for Plan 2',
    status: 'planned'
  });

  return { featureId, plan1Id, plan2Id, task1Id, task2Id, task3Id };
}

async function verifyRecordExists(table: any, id: string): Promise<boolean> {
  const db = getDb();
  const result = await db.select().from(table).where(eq(table.id, id)).limit(1);
  return result.length > 0;
}

async function testCascadeDeletion() {
  console.log('🧪 Starting Cascade Deletion Tests...\n');

  // Initialize database
  await init();
  const db = getDb();

  try {
    // Setup: Create test workspace
    console.log('📝 Setting up test data...');
    const workspaceId = await setupTestWorkspace();

    // Test 1: Verify initial data creation
    console.log('\n✅ Test 1: Creating test data');
    const { featureId, plan1Id, plan2Id, task1Id, task2Id, task3Id } = await createTestData(workspaceId);
    console.log(`   Created feature: ${featureId}`);
    console.log(`   Created plans: ${plan1Id}, ${plan2Id}`);
    console.log(`   Created tasks: ${task1Id}, ${task2Id}, ${task3Id}`);

    // Verify all records exist
    const featureExists = await verifyRecordExists(features, featureId);
    const plan1Exists = await verifyRecordExists(plans, plan1Id);
    const plan2Exists = await verifyRecordExists(plans, plan2Id);
    const task1Exists = await verifyRecordExists(tasks, task1Id);
    const task2Exists = await verifyRecordExists(tasks, task2Id);
    const task3Exists = await verifyRecordExists(tasks, task3Id);

    if (!featureExists || !plan1Exists || !plan2Exists || !task1Exists || !task2Exists || !task3Exists) {
      console.error('❌ Test 1 failed: Not all records were created');
      return false;
    }
    console.log('   ✅ All test records created successfully');

    // Test 2: Delete a plan and verify its tasks are cascade deleted
    console.log('\n✅ Test 2: Delete plan and verify cascade deletion');
    await db.delete(plans).where(eq(plans.id, plan1Id));

    const plan1AfterDelete = await verifyRecordExists(plans, plan1Id);
    const task1AfterDelete = await verifyRecordExists(tasks, task1Id);
    const task2AfterDelete = await verifyRecordExists(tasks, task2Id);

    if (plan1AfterDelete) {
      console.error('❌ Test 2 failed: Plan was not deleted');
      return false;
    }
    if (task1AfterDelete || task2AfterDelete) {
      console.error('❌ Test 2 failed: Tasks were not cascade deleted');
      return false;
    }
    console.log('   ✅ Plan deletion cascaded to tasks correctly');

    // Verify other plan and tasks still exist
    const plan2StillExists = await verifyRecordExists(plans, plan2Id);
    const task3StillExists = await verifyRecordExists(tasks, task3Id);

    if (!plan2StillExists || !task3StillExists) {
      console.error('❌ Test 2 failed: Unrelated records were deleted');
      return false;
    }
    console.log('   ✅ Unrelated records preserved correctly');

    // Test 3: Delete feature and verify cascade deletion
    console.log('\n✅ Test 3: Delete feature and verify cascade deletion');
    await db.delete(features).where(eq(features.id, featureId));

    const featureAfterDelete = await verifyRecordExists(features, featureId);
    const plan2AfterFeatureDelete = await verifyRecordExists(plans, plan2Id);
    const task3AfterFeatureDelete = await verifyRecordExists(tasks, task3Id);

    if (featureAfterDelete) {
      console.error('❌ Test 3 failed: Feature was not deleted');
      return false;
    }
    if (plan2AfterFeatureDelete) {
      console.error('❌ Test 3 failed: Plan was not cascade deleted');
      return false;
    }
    if (task3AfterFeatureDelete) {
      console.error('❌ Test 3 failed: Task was not cascade deleted');
      return false;
    }
    console.log('   ✅ Feature deletion cascaded to plans and tasks correctly');

    // Test 4: Delete non-existent record (should not error)
    console.log('\n✅ Test 4: Delete non-existent record');
    const nonExistentId = randomUUID();
    try {
      await db.delete(features).where(eq(features.id, nonExistentId));
      console.log('   ✅ Deleting non-existent record handled gracefully');
    } catch (error) {
      console.error('❌ Test 4 failed: Error when deleting non-existent record');
      return false;
    }

    // Cleanup: Delete test workspace
    console.log('\n🧹 Cleaning up test data...');
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
    console.log('   ✅ Test workspace deleted');

    console.log('\n✅ All cascade deletion tests passed!\n');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    return false;
  } finally {
    await closeDatabase();
  }
}

// Run the tests
testCascadeDeletion()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
