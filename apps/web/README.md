# PM-AI Web Dashboard

Beautiful web interface for managing PM-AI projects through a browser.

## Features

- **Workspace Overview**: View all features and projects with progress overview
- **Task Board**: Kanban-style board with drag-and-drop task management using @dnd-kit
- **Plan Editor**: Create and edit project plans with markdown preview
- **Dependency Graph**: Visual representation of task dependencies with interactive graph
- **Real-time Sync**: Changes via web or MCP are immediately reflected
- **React Query**: Efficient data fetching and caching with @tanstack/react-query

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server
pnpm dev:web

# Or from apps/web directory
cd apps/web
pnpm dev
```

The app will be available at `http://localhost:6363`

## Build

```bash
# From root
pnpm build:web

# Or from apps/web directory
pnpm build
```

Built files will be in `apps/web/dist/`

## Tech Stack

- **React 19**: Latest React with improved performance and features
- **TypeScript 5+**: Type-safe development
- **Vite 7+**: Fast build tool and dev server
- **@tanstack/react-query**: Powerful data fetching and caching
- **@dnd-kit**: Modern drag and drop for task board
- **react-router-dom 7**: Client-side routing
- **react-markdown**: Markdown rendering for plan content
- **Axios**: HTTP client for API communication
