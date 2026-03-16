/**
 * Run the PM-AI MCP Server
 * Usage: pm-ai mcp
 */
export async function mcpCommand(): Promise<void> {
  console.log('🔌 Starting PM-AI MCP Server...');
  console.log('📡 Connecting to Claude via Model Context Protocol...\n');

  try {
    // Import and run the MCP server from @pm-ai/mcp package
    const { main } = await import('@pm-ai/mcp');

    // Handle graceful shutdown
    const shutdown = async () => {
      console.error('\n🛑 Shutting down MCP server...');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Run the MCP server
    await main();
  } catch (error: any) {
    console.error('❌ Failed to start MCP server:', error);
    console.error('\n💡 Make sure to:');
    console.error('   1. Install dependencies: pnpm install');
    console.error('   2. Build the MCP server: pnpm build:mcp');
    process.exit(1);
  }
}
