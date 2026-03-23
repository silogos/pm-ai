# API Documentation

This document describes the REST API endpoints available in PM-AI.

## Base URL

```
http://localhost:8787/api
```

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Common Response Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Endpoints

### Workspaces

#### GET /workspaces

Get all workspaces.

**Response:**
```json
{
  "workspaces": [
    {
      "id": "uuid",
      "name": "Workspace Name",
      "path": "/path/to/workspace",
      "description": "Optional description",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /workspaces/:id

Get workspace details by ID.

**Parameters:**
- `id` (path) - Workspace UUID

**Response:**
```json
{
  "workspace": {
    "id": "uuid",
    "name": "Workspace Name",
    "path": "/path/to/workspace",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "features": []
  }
}
```

---

### Features

#### GET /features

Get all features, optionally filtered by workspace.

**Query Parameters:**
- `workspaceId` (optional) - Filter by workspace UUID

**Response:**
```json
{
  "features": [
    {
      "id": "uuid",
      "workspaceId": "uuid",
      "name": "Feature Name",
      "description": "Optional description",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "progress": {
        "total": 10,
        "planned": 5,
        "inReview": 2,
        "completed": 3,
        "percentage": 30
      }
    }
  ]
}
```

#### GET /features/:id

Get feature details by ID.

**Parameters:**
- `id` (path) - Feature UUID

**Response:**
```json
{
  "feature": {
    "id": "uuid",
    "workspaceId": "uuid",
    "name": "Feature Name",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "progress": { ... },
    "plans": [],
    "tasks": []
  }
}
```

#### POST /features

Create a new feature.

**Request Body:**
```json
{
  "name": "Feature Name",
  "workspaceId": "uuid (optional)",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "feature": {
    "id": "uuid",
    "name": "Feature Name",
    "workspaceId": "uuid",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE /features/:id

Delete a feature by ID.

**⚠️ Cascade Deletion Warning:**
- Deleting a feature will **permanently delete** all associated plans and tasks
- This action **cannot be undone**

**Parameters:**
- `id` (path) - Feature UUID

**Response:**
- `204 No Content` - Feature deleted successfully
- `404 Not Found` - Feature not found

**Example:**
```bash
curl -X DELETE http://localhost:8787/api/features/uuid
```

---

### Plans

#### POST /plans

Create a new plan.

**Request Body:**
```json
{
  "featureId": "uuid",
  "title": "Plan Title",
  "markdown": "# Plan Content"
}
```

**Response:**
```json
{
  "plan": {
    "id": "uuid",
    "featureId": "uuid",
    "title": "Plan Title",
    "markdown": "# Plan Content",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /plans/:id

Get plan details by ID.

**Parameters:**
- `id` (path) - Plan UUID

**Response:**
```json
{
  "plan": {
    "id": "uuid",
    "featureId": "uuid",
    "title": "Plan Title",
    "markdown": "# Plan Content",
    "created_at": "2024-01-01T00:00:00.000Z",
    "progress": { ... },
    "tasks": []
  }
}
```

#### DELETE /plans/:id

Delete a plan by ID.

**⚠️ Cascade Deletion Warning:**
- Deleting a plan will **permanently delete** all associated tasks
- This action **cannot be undone**

**Parameters:**
- `id` (path) - Plan UUID

**Response:**
- `204 No Content` - Plan deleted successfully
- `404 Not Found` - Plan not found

**Example:**
```bash
curl -X DELETE http://localhost:8787/api/plans/uuid
```

---

### Tasks

#### GET /features/:featureId/tasks

Get tasks for a feature, optionally filtered by status or priority.

**Parameters:**
- `featureId` (path) - Feature UUID
- `status` (query, optional) - Filter by status: `planned`, `review`, `done`
- `priority` (query, optional) - Filter by priority: `high`, `medium`, `low`

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "planId": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "flag": "flag",
      "priority": "high",
      "dependencies": ["uuid1", "uuid2"],
      "status": "planned"
    }
  ]
}
```

#### PATCH /tasks/:id

Update a task.

**Request Body:**
```json
{
  "title": "New Title (optional)",
  "description": "New description (optional)",
  "flag": "flag (optional)",
  "priority": "high (optional)",
  "status": "review (optional)",
  "dependencies": ["uuid1", "uuid2"] (optional)
}
```

**Response:**
```json
{
  "task": {
    "id": "uuid",
    "planId": "uuid",
    "title": "Task Title",
    "description": "Task description",
    "flag": "flag",
    "priority": "high",
    "dependencies": ["uuid1", "uuid2"],
    "status": "review"
  }
}
```

#### DELETE /tasks/:id

Delete a task by ID.

**Parameters:**
- `id` (path) - Task UUID

**Response:**
- `204 No Content` - Task deleted successfully

---

### Progress

#### GET /features/:id/progress

Get progress statistics for a feature.

**Parameters:**
- `id` (path) - Feature UUID

**Response:**
```json
{
  "progress": {
    "total": 10,
    "planned": 5,
    "inReview": 2,
    "completed": 3,
    "percentage": 30
  }
}
```

#### GET /plans/:id/progress

Get progress statistics for a plan.

**Parameters:**
- `id` (path) - Plan UUID

**Response:**
```json
{
  "progress": {
    "total": 5,
    "planned": 2,
    "inReview": 1,
    "completed": 2,
    "percentage": 40
  }
}
```

---

### Dependencies

#### GET /features/:id/critical-path

Get the critical path (longest dependency chain) for a feature.

**Parameters:**
- `id` (path) - Feature UUID

**Response:**
```json
{
  "critical_path": [
    {
      "id": "uuid",
      "title": "Task 1",
      "status": "done",
      "depth": 0
    },
    {
      "id": "uuid",
      "title": "Task 2",
      "status": "planned",
      "depth": 1
    }
  ]
}
```

#### GET /tasks/:id/dependencies

Get task dependencies.

**Parameters:**
- `id` (path) - Task UUID
- `type` (query, optional) - `upstream`, `downstream`, or `both` (default)

**Response:**
```json
{
  "dependencies": {
    "upstream": [],
    "downstream": []
  }
}
```

---

### Comments

#### POST /tasks/:id/comments

Add a comment to a task.

**Request Body:**
```json
{
  "content": "Comment content"
}
```

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "content": "Comment content",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /tasks/:id/comments

Get comments for a task.

**Parameters:**
- `id` (path) - Task UUID

**Response:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "content": "Comment content",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### DELETE /tasks/:taskId/comments/:commentId

Delete a comment.

**Parameters:**
- `taskId` (path) - Task UUID
- `commentId` (path) - Comment UUID

**Response:**
- `204 No Content` - Comment deleted successfully

---

## Error Handling

All endpoints may return error responses in the following format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  }
}
```

### Common Error Codes

- `FEATURE_NOT_FOUND` - Feature does not exist
- `PLAN_NOT_FOUND` - Plan does not exist
- `TASK_NOT_FOUND` - Task does not exist
- `WORKSPACE_NOT_FOUND` - Workspace does not exist
- `NO_WORKSPACE` - No workspace found in current directory
- `MISSING_WORKSPACE_ID` - Workspace ID parameter is required
- `INTERNAL_ERROR` - Server error

---

## Cascade Deletion Behavior

When deleting records, be aware of the cascade behavior:

1. **Deleting a Feature**
   - All associated plans are deleted
   - All tasks associated with those plans are deleted
   - All comments on those tasks are deleted

2. **Deleting a Plan**
   - All associated tasks are deleted
   - All comments on those tasks are deleted

3. **Deleting a Task**
   - All comments on that task are deleted

⚠️ **Warning:** Cascade deletions are permanent and cannot be undone. Always confirm before deleting records with child dependencies.

---

## Testing the API

### Using cURL

```bash
# Get all features
curl http://localhost:8787/api/features?workspaceId=uuid

# Create a feature
curl -X POST http://localhost:8787/api/features \
  -H "Content-Type: application/json" \
  -d '{"name": "New Feature", "workspaceId": "uuid"}'

# Delete a feature
curl -X DELETE http://localhost:8787/api/features/uuid
```

### Using the Web Dashboard

The web dashboard at `http://localhost:6363` provides a user-friendly interface for all API operations.
