import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { normalizeGitHubError, toUserMessage } from '../src/errors/index.js';

describe('transformación de errores', () => {
  it('explica errores de validación en español', () => {
    const result = z.object({ name: z.string().min(3, 'Usa al menos 3 caracteres.') }).safeParse({ name: 'x' });
    if (result.success) throw new Error('Se esperaba un error de validación');
    expect(toUserMessage(result.error)).toContain('name: Usa al menos 3 caracteres.');
  });
  it('traduce 404 con el recurso solicitado', () => {
    expect(toUserMessage(Object.assign(new Error('Not Found'), { status: 404 }), 'octo/demo')).toContain('octo/demo');
  });
  it('traduce credenciales inválidas sin exponer detalles internos', () => {
    const message = toUserMessage(Object.assign(new Error('Bad credentials token=secret'), { status: 401 }));
    expect(message).toContain('GITHUB_TOKEN');
    expect(message).not.toContain('secret');
  });
  it('clasifica errores de autenticación', () => {
    expect(normalizeGitHubError(Object.assign(new Error('Forbidden'), { status: 403 })).kind).toBe('AuthenticationError');
  });
  it('identifica rate limit y errores de red', () => {
    expect(toUserMessage(Object.assign(new Error('API rate limit exceeded'), { status: 403 })).toLowerCase()).toContain('límite');
    expect(toUserMessage(Object.assign(new Error('fetch failed'), { code: 'ECONNRESET' })).toLowerCase()).toContain('conectar');
  });
});