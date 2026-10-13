import { Octokit } from '@octokit/rest';

export function createGitHubClient(token = process.env.GITHUB_TOKEN): Octokit {
  if (!token) throw new Error('Falta GITHUB_TOKEN. Configura la variable de entorno antes de iniciar el servidor.');
  return new Octokit({ auth: token });
}