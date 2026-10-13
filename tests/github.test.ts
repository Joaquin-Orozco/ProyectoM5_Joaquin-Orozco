import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGitHubOperations } from '../src/github/operations.js';

const octokit = {
  repos: { createForAuthenticatedUser: vi.fn(), listForAuthenticatedUser: vi.fn(), getContent: vi.fn(), createOrUpdateFileContents: vi.fn(), get: vi.fn() },
  issues: { create: vi.fn(), listForRepo: vi.fn(), update: vi.fn(), createComment: vi.fn() },
  git: { getRef: vi.fn(), createRef: vi.fn() },
} as never;
const mocks = octokit as never as { repos: Record<string, ReturnType<typeof vi.fn>>; issues: Record<string, ReturnType<typeof vi.fn>>; git: Record<string, ReturnType<typeof vi.fn>> };

describe('operaciones GitHub con Octokit simulado', () => {
  const operations = createGitHubOperations(octokit);
  beforeEach(() => vi.clearAllMocks());

  it('crea un repositorio y devuelve campos útiles', async () => {
    mocks.repos.createForAuthenticatedUser.mockResolvedValue({ data: { full_name: 'octo/demo', html_url: 'https://github.com/octo/demo', private: true } });
    await expect(operations.createRepository({ name: 'demo', description: '', private: true })).resolves.toEqual({ fullName: 'octo/demo', url: 'https://github.com/octo/demo', private: true });
  });
  it('codifica contenido y actualiza archivos existentes con su SHA', async () => {
    mocks.repos.getContent.mockResolvedValue({ data: { sha: 'old-sha' } });
    mocks.repos.createOrUpdateFileContents.mockResolvedValue({ data: { commit: { sha: 'new-sha', html_url: 'https://github.com/octo/demo/commit/new' }, content: { path: 'README.md' } } });
    await operations.createCommit({ owner: 'octo', repo: 'demo', path: 'README.md', message: 'Update docs', content: 'hello' });
    expect(mocks.repos.createOrUpdateFileContents).toHaveBeenCalledWith(expect.objectContaining({ sha: 'old-sha', content: Buffer.from('hello').toString('base64') }));
  });
  it('crea un archivo nuevo cuando GitHub responde 404 al consultarlo', async () => {
    mocks.repos.getContent.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }));
    mocks.repos.createOrUpdateFileContents.mockResolvedValue({ data: { commit: { sha: 'new-sha', html_url: 'url' }, content: { path: 'new.txt' } } });
    await operations.createCommit({ owner: 'octo', repo: 'demo', path: 'new.txt', message: 'Add file', content: 'hello' });
    expect(mocks.repos.createOrUpdateFileContents).toHaveBeenCalledWith(expect.not.objectContaining({ sha: expect.anything() }));
  });
  it('excluye pull requests al listar issues', async () => {
    mocks.issues.listForRepo.mockResolvedValue({ data: [
      { number: 1, title: 'Bug', html_url: 'issue', labels: [{ name: 'bug' }] },
      { number: 2, title: 'PR', html_url: 'pr', labels: [], pull_request: { url: 'api' } },
    ] });
    await expect(operations.listIssues({ owner: 'octo', repo: 'demo', perPage: 30 })).resolves.toHaveLength(1);
  });
  it('convierte 404 de GitHub a error entendible', async () => {
    mocks.issues.create.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }));
    await expect(operations.createIssue({ owner: 'octo', repo: 'demo', title: 'Bug', body: '' })).rejects.toThrow('octo/demo');
  });
  it('reintenta una respuesta de rate limit una vez', async () => {
    mocks.issues.create.mockRejectedValueOnce(Object.assign(new Error('rate limit'), { status: 429, response: { headers: { 'retry-after': '0.001' } } }))
      .mockResolvedValue({ data: { number: 7, title: 'Bug', html_url: 'issue' } });
    await expect(operations.createIssue({ owner: 'octo', repo: 'demo', title: 'Bug', body: '' })).resolves.toMatchObject({ number: 7 });
    expect(mocks.issues.create).toHaveBeenCalledTimes(2);
  });
});