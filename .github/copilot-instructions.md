# Project instructions

- This is a Node.js 18+ TypeScript MCP server using the official `@modelcontextprotocol/sdk` v1 API and stdio transport.
- Keep stdout exclusively for MCP protocol traffic; send diagnostics through `src/utils/logging.ts` to stderr.
- Keep GitHub API access in `src/github/operations.ts`, schemas in `src/schemas/`, and tool registration in `src/tools/`.
- Never log or commit GitHub tokens. Preserve deterministic tests by mocking Octokit; do not call live GitHub from tests.
- SDK reference: https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x
- MCP docs: https://modelcontextprotocol.io/docs