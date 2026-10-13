import type { Octokit } from '@octokit/rest';
import { normalizeGitHubError } from '../errors/index.js';
import { withRateLimitRetry } from '../utils/retry.js';

export function createGitHubOperations(octokit: Octokit) {
  return {
    async createRepository(input: { name: string; description: string; private: boolean }) {
      try {
        const { data } = await withRateLimitRetry(() => octokit.repos.createForAuthenticatedUser(input));
        return { fullName: data.full_name, url: data.html_url, private: data.private };
      } catch (error) { throw normalizeGitHubError(error, input.name); }
    },
    async createIssue(input: { owner: string; repo: string; title: string; body: string }) {
      try {
        const { data } = await withRateLimitRetry(() => octokit.issues.create(input));
        return { number: data.number, title: data.title, url: data.html_url };
      } catch (error) { throw normalizeGitHubError(error, `${input.owner}/${input.repo}`); }
    },
    async listRepositories(input: { type: 'all' | 'owner' | 'public' | 'private' | 'member' }) {
      try {
        const { data } = await withRateLimitRetry(() => octokit.repos.listForAuthenticatedUser({ type: input.type, sort: 'updated', per_page: 100 }));
        return data.map((repo) => ({ name: repo.name, fullName: repo.full_name, description: repo.description, private: repo.private, url: repo.html_url }));
      } catch (error) { throw normalizeGitHubError(error); }
    },
    async createCommit(input: { owner: string; repo: string; path: string; message: string; content: string; branch?: string }) {
      const resource = `${input.owner}/${input.repo}`;
      try {
        let sha: string | undefined;
        try {
          const current = await withRateLimitRetry(() => octokit.repos.getContent({ owner: input.owner, repo: input.repo, path: input.path, ...(input.branch ? { ref: input.branch } : {}) }));
          if (!Array.isArray(current.data) && 'sha' in current.data) sha = current.data.sha;
        } catch (error) {
          if ((error as { status?: number }).status !== 404) throw error;
        }
        const { data } = await withRateLimitRetry(() => octokit.repos.createOrUpdateFileContents({
          owner: input.owner, repo: input.repo, path: input.path, message: input.message,
          content: Buffer.from(input.content, 'utf8').toString('base64'), ...(sha ? { sha } : {}),
          ...(input.branch ? { branch: input.branch } : {}),
        }));
        return { commitSha: data.commit.sha, url: data.commit.html_url, path: data.content?.path ?? input.path };
      } catch (error) { throw normalizeGitHubError(error, resource); }
    },
    async listIssues(input: { owner: string; repo: string; perPage: number }) {
      try {
        const { data } = await withRateLimitRetry(() => octokit.issues.listForRepo({ owner: input.owner, repo: input.repo, state: 'open', per_page: input.perPage }));
        return data.filter((issue) => !('pull_request' in issue)).map((issue) => ({ number: issue.number, title: issue.title, url: issue.html_url, labels: issue.labels.map((label) => typeof label === 'string' ? label : label.name ?? '') }));
      } catch (error) { throw normalizeGitHubError(error, `${input.owner}/${input.repo}`); }
    },
    async createBranch(input: { owner: string; repo: string; branch: string; fromBranch?: string }) {
      const resource = `${input.owner}/${input.repo}`;
      try {
        const repository = await withRateLimitRetry(() => octokit.repos.get({ owner: input.owner, repo: input.repo }));
        const base = input.fromBranch ?? repository.data.default_branch;
        const reference = await withRateLimitRetry(() => octokit.git.getRef({ owner: input.owner, repo: input.repo, ref: `heads/${base}` }));
        const created = await withRateLimitRetry(() => octokit.git.createRef({ owner: input.owner, repo: input.repo, ref: `refs/heads/${input.branch}`, sha: reference.data.object.sha }));
        return { branch: input.branch, url: created.data.url };
      } catch (error) { throw normalizeGitHubError(error, resource); }
    },
    async closeIssue(input: { owner: string; repo: string; issueNumber: number }) {
      try {
        const { data } = await withRateLimitRetry(() => octokit.issues.update({ owner: input.owner, repo: input.repo, issue_number: input.issueNumber, state: 'closed' }));
        return { number: data.number, title: data.title, state: data.state, url: data.html_url };
      } catch (error) { throw normalizeGitHubError(error, `${input.owner}/${input.repo}#${input.issueNumber}`); }
    },
    async addIssueComment(input: { owner: string; repo: string; issueNumber: number; body: string }) {
      try {
        const { data } = await withRateLimitRetry(() => octokit.issues.createComment({ owner: input.owner, repo: input.repo, issue_number: input.issueNumber, body: input.body }));
        return { id: data.id, url: data.html_url };
      } catch (error) { throw normalizeGitHubError(error, `${input.owner}/${input.repo}#${input.issueNumber}`); }
    },
  };
}

export type GitHubOperations = ReturnType<typeof createGitHubOperations>;