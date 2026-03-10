// MCP Tool Types
export interface McpToolContext {
  projectId?: string;
  userId?: string;
}

export interface McpToolResponse {
  content: Array<{
    type: 'text' | 'resource';
    text?: string;
    uri?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface McpResourceResponse {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
  }>;
}

export interface ToolDependencyInfo {
  taskId: string;
  upstream: string[];
  downstream: string[];
}
