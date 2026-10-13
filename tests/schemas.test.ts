import { describe, expect, it } from 'vitest';
import { schemas } from '../src/schemas/index.js';

describe('schemas de herramientas', () => {
  it('acepta nombre de repositorio válido', () => {
    expect(schemas.create_repository.safeParse({ name: 'agent-demo' }).success).toBe(true);
  });
  it('rechaza nombres cortos y caracteres no permitidos', () => {
    expect(schemas.create_repository.safeParse({ name: 'ab' }).success).toBe(false);
    expect(schemas.create_repository.safeParse({ name: 'bad name' }).success).toBe(false);
  });
  it('rechaza guion inicial o final y nombres demasiado largos', () => {
    expect(schemas.create_repository.safeParse({ name: '-repo' }).success).toBe(false);
    expect(schemas.create_repository.safeParse({ name: 'repo-' }).success).toBe(false);
    expect(schemas.create_repository.safeParse({ name: 'a'.repeat(101) }).success).toBe(false);
  });
  it('aplica valores predeterminados seguros para repositorio', () => {
    expect(schemas.create_repository.parse({ name: 'private-repo' })).toMatchObject({ private: true, description: '' });
  });
  it('rechaza issue sin título ni número positivo', () => {
    expect(schemas.create_issue.safeParse({ owner: 'octo', repo: 'demo', title: ' ' }).success).toBe(false);
    expect(schemas.close_issue.safeParse({ owner: 'octo', repo: 'demo', issueNumber: 0 }).success).toBe(false);
  });
  it('rechaza rutas de archivo fuera del repositorio', () => {
    expect(schemas.create_commit.safeParse({ owner: 'octo', repo: 'demo', path: '../secret', message: 'update', content: 'data' }).success).toBe(false);
  });
  it('limita paginación de issues', () => {
    expect(schemas.list_issues.safeParse({ owner: 'octo', repo: 'demo', perPage: 101 }).success).toBe(false);
  });
  it('rechaza nombres de rama incompatibles con Git', () => {
    expect(schemas.create_branch.safeParse({ owner: 'octo', repo: 'demo', branch: 'feature/../main' }).success).toBe(false);
  });
});