import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createGitHubClient } from './github/client.js';
import { createGitHubOperations } from './github/operations.js';
import { registerGitHubTools } from './tools/index.js';
import { log } from './utils/logging.js';

async function main(): Promise<void> {
  const octokit = createGitHubClient();
  const server = new McpServer({ name: 'automatehub-github-agent', version: '1.0.0' });
  registerGitHubTools(server, createGitHubOperations(octokit));
  await server.connect(new StdioServerTransport());
  log('info', 'Servidor MCP de GitHub iniciado por stdio.');
}

main().catch((error: unknown) => {
  log('error', 'No se pudo iniciar el servidor MCP.', { message: error instanceof Error ? error.message : 'Error desconocido' });
  process.exitCode = 1;
});