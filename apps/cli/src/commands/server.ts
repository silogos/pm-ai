import { createWebServer } from '@pm-ai/api';

/**
 * Run the API server
 * Usage: pm-ai server [port]
 */
export async function serverCommand(args: string[]): Promise<void> {
  const port = parseInt(args[0] || process.env.PMAI_PORT || '8787', 10);

  console.log(`🚀 Starting PM-AI API server on port ${port}...`);
  console.log(`📊 Dashboard will be available at http://localhost:${port}`);
  console.log(`Press Ctrl+C to stop the server\n`);

  try {
    // Import and run the API server directly from @pm-ai/api package
    const server = await createWebServer({
      fixedPort: port,
      dbPath: process.env.PMAI_DB_PATH
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down server...');
      await server.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Keep the process alive
    await new Promise(() => {});
  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    console.error('\n💡 Make sure to install dependencies:');
    console.error('   pnpm install');
    process.exit(1);
  }
}
