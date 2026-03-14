# Web Dashboard Guide

Complete guide to the PM-AI web dashboard.

## Overview

The PM-AI web dashboard provides a beautiful, interactive interface for managing projects through your browser. It features real-time updates, drag-and-drop task management, and visual dependency graphs.

## Accessing the Dashboard

### Default URL

```
http://localhost:6363
```

### Opening from MCP

You can also open the dashboard directly from Claude/AI:

```
User: "Open the PM-AI dashboard"

Claude uses: open_dashboard tool

✓ Opening dashboard in your default browser...
```

## Features

### 1. Workspace Overview

See all your features at a glance:

- Feature names and descriptions
- Task counts and completion percentages
- Priority breakdowns
- Quick access to feature details

### 2. Task Board (Kanban)

Drag-and-drop task management with three columns:

- **Planned**: Tasks yet to be started
- **In Review**: Tasks under review or testing
- **Done**: Completed tasks

**Features:**
- Drag tasks between columns to update status
- Visual priority indicators (high/medium/low)
- Task counts per column
- Filter by priority

### 3. Plan Editor

Create and edit project plans with:

- **Markdown Editor**: Write plans in markdown
- **Live Preview**: See formatted output in real-time
- **Task Extraction**: Automatically extract tasks from markdown
- **Auto-save**: Changes are saved automatically

**How it works:**
1. Click "Edit Plan" on any plan
2. Write or modify markdown content
3. Preview updates automatically
4. Click "Save" to persist changes

### 4. Dependency Graph

Interactive visualization of task dependencies:

**Features:**
- Nodes represent tasks
- Arrows show dependency relationships
- Critical path highlighted in red
- Pan and zoom to explore
- Click tasks for details

**Understanding the graph:**
- **Circle nodes**: Individual tasks
- **Arrows**: Dependency relationships (A → B means A must be done before B)
- **Red nodes**: Tasks on the critical path
- **Blue nodes**: Tasks with slack (can be delayed)

### 5. Progress Tracking

Visual progress indicators:

- **Completion Percentage**: Overall project completion
- **Priority Breakdown**: Tasks by priority level
- **Status Breakdown**: Tasks by status (planned/review/done)
- **Task Counts**: Quick statistics

## Navigation

### Home Page

- Lists all features in the workspace
- Shows summary statistics for each feature
- Click any feature to view details

### Feature Page

- **Overview Tab**: Feature details and statistics
- **Tasks Tab**: Task board (Kanban view)
- **Plans Tab**: List of all plans with editor
- **Graph Tab**: Dependency visualization

### Task Details

Click any task to see:
- Title and description
- Priority and status
- Dependencies (upstream and downstream)
- Comments

## Real-time Updates

The dashboard auto-refreshes to show:

- New tasks created via MCP
- Status updates from AI agents
- Comments added by team members
- Plan modifications

**Note:** Changes are reflected immediately without manual refresh.

## Keyboard Shortcuts

- `Cmd/Ctrl + K`: Quick navigation
- `Cmd/Ctrl + N`: New task
- `Esc`: Close modals
- `Arrow Keys`: Navigate lists

## Customization

### Theme

The dashboard supports light and dark themes:

- Auto-detects system preference
- Manual toggle in settings

### Layout

- Responsive design works on all screen sizes
- Sidebar navigation for quick access
- Breadcrumb navigation for hierarchy

## Integration with MCP

### Two-Way Sync

All changes are synchronized:

**Dashboard → Database → MCP:**
- Dragging tasks updates status in database
- Editing plans updates markdown content
- Adding comments appears in MCP tools

**MCP → Database → Dashboard:**
- AI agents creating tasks appear on board
- Status updates from tools reflect in UI
- Comments added via MCP show in dashboard

### Best Practices

1. **Use Dashboard For:**
   - Visual project overview
   - Drag-and-drop task management
   - Dependency graph exploration
   - Plan editing with preview

2. **Use MCP For:**
   - Programmatic task creation
   - Bulk operations
   - AI-driven planning
   - Integration with workflows

## Troubleshooting

### Dashboard doesn't open

**Solutions:**
1. Check if another service is using port 6363
2. The API server logs will show the actual port if 6363 is busy
3. Access manually: `http://localhost:6363`

### Changes not reflected

**Solution:** The dashboard auto-refreshes, but you can manually refresh the page (`Cmd+R` or `F5`).

### Graph not loading

**Solutions:**
1. Check browser console for errors
2. Ensure tasks have dependencies to visualize
3. Try refreshing the page

### Slow performance

**Solutions:**
1. Large projects (>100 tasks) may take longer to load
2. Use filters to focus on specific tasks
3. Check network connection

## Browser Support

Tested and supported on:

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ Mobile browsers (limited support)

## API Endpoints

The dashboard communicates with the API server:

```
GET  /api/features              # List all features
GET  /api/features/:id          # Get feature details
GET  /api/features/:id/tasks    # Get feature tasks
GET  /api/features/:id/plans    # Get feature plans
GET  /api/features/:id/graph    # Get dependency graph
POST /api/tasks                 # Create task
PUT  /api/tasks/:id             # Update task
DELETE /api/tasks/:id           # Delete task
POST /api/tasks/:id/comments    # Add comment
```

## Development

### Local Development

Start the dashboard in development mode:

```bash
pnpm dev:web
```

This enables:
- Hot module replacement
- Fast refresh
- Source maps
- Error overlay

### Build for Production

```bash
pnpm build:web
```

Optimized build will be in `apps/web/dist/`.

### Customization

The dashboard is built with React + Vite. Customize:

- **Components**: `apps/web/src/components/`
- **Pages**: `apps/web/src/pages/`
- **Styles**: `apps/web/src/styles/`
- **API Client**: `apps/web/src/services/`

## Accessibility

The dashboard includes:

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Focus indicators
- Semantic HTML

## Performance

Optimizations include:

- Code splitting by route
- Lazy loading components
- Image optimization
- API response caching
- Debounced search inputs

## Future Enhancements

Planned features:

- [ ] Team collaboration (multiple users)
- [ ] Real-time websocket updates
- [ ] Custom fields on tasks
- [ ] Advanced filtering and search
- [ ] Export to markdown/PDF
- [ ] Calendar view
- [ ] Time tracking
- [ ] Burndown charts

## Feedback

Found an issue or have a suggestion? Please report it at:
- GitHub Issues: https://github.com/silogos/pm-ai/issues
