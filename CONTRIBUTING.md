# Contributing to PM-AI

Thank you for your interest in contributing to PM-AI! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- Git

### Getting Started

1. Fork the repository on GitHub: https://github.com/silogos/pm-ai
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/pm-ai.git
cd pm-ai
```

3. Install dependencies:
```bash
pnpm install
```

4. Build the project:
```bash
pnpm build
```

## Development Workflow

### Running in Development Mode

```bash
# Start all services
pnpm dev

# Start specific services
pnpm dev:api          # Start API server only
pnpm dev:web          # Start web dashboard only
pnpm dev:mcp          # Start MCP server only
```

### Database Changes

If you modify the database schema (`packages/core/src/db/schema.ts`):

1. Generate new migrations:
```bash
pnpm db:generate
```

2. Apply migrations (auto-applied on start, or manually):
```bash
pnpm db:migrate
```

3. Test your changes before committing

### CLI Usage

```bash
# Show all CLI commands
pnpm pm-ai --help

# Start the API server
pnpm pm-ai server

# Initialize PM-AI in current folder
pnpm pm-ai init
```

## Code Style

### TypeScript

- Use TypeScript for all new files
- Enable strict type checking
- Provide proper type annotations
- Avoid `any` types when possible
- Use interfaces for object shapes

### Code Organization

**Monorepo Structure:**
- **packages/core**: Domain logic, database client, and schema
- **packages/utils**: Shared utilities (graph algorithms, helpers)
- **apps/api**: REST API server with Hono
- **apps/cli**: Command-line interface with CAC
- **apps/mcp**: MCP server for Claude/AI integration
- **apps/web**: React web dashboard

**MCP Server Organization:**
- **Tools**: `apps/mcp/src/mcp/tools/` - Interactive MCP operations
- **Resources**: `apps/mcp/src/mcp/resources/` - Read-only data access
- **Prompts**: `apps/mcp/src/mcp/prompts/` - Reusable AI prompts
- **Registration**: Each folder has an `index.ts` that exports `register*` function
- **Database**: Schema and client in `packages/core/src/db/`

### Naming Conventions

- Files: `camelCase.ts`
- Functions/Variables: `camelCase`
- Classes/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

## Commit Messages

We follow conventional commit messages:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add task filtering by priority
fix: resolve dependency graph cycle detection
docs: update README with new features
```

## Adding New Features

### Adding a New MCP Tool

1. Create the tool file in `apps/mcp/src/mcp/tools/yourTool.ts`
2. Follow the existing pattern from other tools
3. Use Zod for input validation
4. Register the tool in `apps/mcp/src/mcp/tools/index.ts`
5. Update the README with documentation

Example tool structure:
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const YourToolSchema = z.object({
  // Define your schema
});

export async function registerYourTool(server: McpServer): Promise<void> {
  server.tool(
    'your_tool_name',
    'Tool description',
    YourToolSchema.shape,
    async (input) => {
      // Implement your logic
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );
}
```

Then add to `apps/mcp/src/mcp/tools/index.ts`:
```typescript
await registerYourTool(server);
console.error('Tool registered: your_tool_name');
```

Example tool structure:
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

const YourToolSchema = z.object({
  // Define your schema
});

export async function registerYourTool(server: McpServer): Promise<void> {
  server.tool(
    'your_tool_name',
    'Tool description',
    YourToolSchema.shape,
    async (input) => {
      // Implement your logic
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );
}
```

### Adding a New MCP Resource

1. Create the resource file in `apps/mcp/src/mcp/resources/yourResource.ts`
2. Use `ResourceTemplate` for dynamic URIs
3. Register the resource in `apps/mcp/src/mcp/resources/index.ts`
4. Update the README with documentation

Example resource structure:
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export async function registerYourResource(server: McpServer): Promise<void> {
  server.resource(
    'your_resource',
    'pmai://your-resource/{param}',
    async (uri) => {
      // Implement your logic
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );
}
```

Then add to `apps/mcp/src/mcp/resources/index.ts`:
```typescript
await registerYourResource(server);
console.error('Resource registered: your_resource');
```

### Adding a New Service

1. Create the service file in `packages/core/src/services/yourService.ts`
2. Import the database client from `../db/client.js`
3. Export functions with clear names and return types
4. Handle errors appropriately
5. Update `packages/core/src/index.ts` to export new functions

## Testing

### Running Tests

```bash
npm test
```

### Writing Tests

- Place tests in the `tests/` directory
- Use a testing framework (add to package.json if needed)
- Test both success and error cases
- Mock database operations for unit tests

## Pull Request Process

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them with clear messages

3. Push to your fork:
```bash
git push origin feature/your-feature-name
```

4. Create a pull request on GitHub with:
   - Clear title and description
   - Reference any related issues
   - List of changes made
   - Screenshots if applicable

5. Wait for code review and address any feedback

## Questions?

Feel free to open an issue at https://github.com/silogos/pm-ai/issues for questions or discussion about potential contributions.

## License

By contributing to PM-AI, you agree that your contributions will be licensed under the MIT License.
