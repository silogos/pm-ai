# PM-AI Web Dashboard

Beautiful web interface for managing PM-AI projects through a browser.

## Features

- **Project List**: View all projects with progress overview
- **Task Board**: Kanban-style board with drag-and-drop task management
- **Plan Editor**: Create and edit project plans with markdown preview
- **Dependency Graph**: Visual representation of task dependencies
- **Real-time Sync**: Changes via web or MCP are immediately reflected

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Build

```bash
pnpm build
```

Built files will be in `dist/`

## Tech Stack

- React 18
- TypeScript
- Vite
- Axios (for API calls)
