import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { schemas } from '../schemas/index.js';
import type { GitHubOperations } from '../github/operations.js';
import { toUserMessage } from '../errors/index.js';

function register(server: McpServer, name: string, description: string, schema: z.AnyZodObject, handler: (input: never) => Promise<unknown>): void {
  server.registerTool(name, { description, inputSchema: schema.shape }, async (rawInput: Record<string, unknown>) => {
    try {
      const result = await handler(schema.parse(rawInput) as never);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      return { isError: true, content: [{ type: 'text' as const, text: toUserMessage(error) }] };
    }
  });
}

export function registerGitHubTools(server: McpServer, operations: GitHubOperations): void {
  register(server, 'create_repository', 'Crea un repositorio en la cuenta GitHub autenticada. Úsalo cuando el usuario pida crear un repositorio; por seguridad es privado por defecto.', schemas.create_repository, operations.createRepository as (input: never) => Promise<unknown>);
  register(server, 'create_issue', 'Abre un issue nuevo en un repositorio existente. Requiere propietario, repositorio, título y descripción.', schemas.create_issue, operations.createIssue as (input: never) => Promise<unknown>);
  register(server, 'list_repositories', 'Lista repositorios de la cuenta GitHub autenticada, ordenados por actividad reciente; permite filtrar por tipo.', schemas.list_repositories, operations.listRepositories as (input: never) => Promise<unknown>);
  register(server, 'create_commit', 'Crea o actualiza un archivo en un repositorio y genera un commit. El contenido se reemplaza completo; especifica la ruta y rama opcional.', schemas.create_commit, operations.createCommit as (input: never) => Promise<unknown>);
  register(server, 'list_issues', 'Lista issues abiertos de un repositorio, excluyendo pull requests, con número, título, URL y etiquetas.', schemas.list_issues, operations.listIssues as (input: never) => Promise<unknown>);
  register(server, 'create_branch', 'Crea una rama en un repositorio a partir de otra rama; si no se indica base, usa la rama predeterminada.', schemas.create_branch, operations.createBranch as (input: never) => Promise<unknown>);
  register(server, 'close_issue', 'Cierra un issue abierto usando su número y el repositorio correspondiente.', schemas.close_issue, operations.closeIssue as (input: never) => Promise<unknown>);
  register(server, 'add_comment_to_issue', 'Añade un comentario Markdown a un issue o pull request existente.', schemas.add_comment_to_issue, operations.addIssueComment as (input: never) => Promise<unknown>);
}