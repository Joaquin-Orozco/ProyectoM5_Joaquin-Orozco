import { ZodError } from 'zod';

export type AppErrorKind = 'ValidationError' | 'GitHubAPIError' | 'AuthenticationError' | 'NetworkError';

export class AppError extends Error {
  constructor(public readonly kind: AppErrorKind, message: string, public readonly status?: number) {
    super(message);
    this.name = kind;
  }
}

type GitHubLikeError = Error & {
  status?: number;
  response?: { headers?: Record<string, string | number | undefined> };
  code?: string;
};

export function toUserMessage(error: unknown, resource?: string): string {
  if (error instanceof ZodError) {
    return `Parámetros inválidos: ${error.issues.map((issue) => `${issue.path.join('.') || 'entrada'}: ${issue.message}`).join('; ')}`;
  }
  if (error instanceof AppError) return error.message;

  const githubError = error as GitHubLikeError;
  const status = githubError?.status;
  if (status === 401) return 'GitHub rechazó la autenticación. Verifica que GITHUB_TOKEN sea válido y no haya expirado.';
  if (status === 403) {
    const headers = githubError.response?.headers;
    if (String(headers?.['x-ratelimit-remaining'] ?? '') === '0' || /rate limit/i.test(githubError.message)) {
      return 'Se alcanzó el límite de solicitudes de GitHub. Espera el tiempo indicado por GitHub e inténtalo de nuevo.';
    }
    return 'GitHub denegó la operación. Verifica que el token tenga acceso y permisos suficientes para este recurso.';
  }
  if (status === 404) {
    return resource
      ? `El recurso "${resource}" no fue encontrado. Verifica el propietario y el nombre e intenta de nuevo.`
      : 'El recurso solicitado no fue encontrado. Verifica los datos e intenta de nuevo.';
  }
  if (status === 429) return 'Se alcanzó el límite de solicitudes de GitHub. Espera antes de volver a intentarlo.';
  if (typeof status === 'number') return `GitHub no pudo completar la operación (HTTP ${status}). Revisa los datos y permisos e inténtalo de nuevo.`;
  if (githubError?.code || /fetch failed|network|socket|timed out/i.test(githubError?.message ?? '')) {
    return 'No se pudo conectar con GitHub. Comprueba tu conexión e inténtalo de nuevo.';
  }
  return 'Ocurrió un error inesperado al procesar la solicitud. Revisa los parámetros e inténtalo de nuevo.';
}

export function normalizeGitHubError(error: unknown, resource?: string): AppError {
  const githubError = error as GitHubLikeError;
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return new AppError('ValidationError', toUserMessage(error));
  if (githubError?.status === 401 || githubError?.status === 403) {
    return new AppError('AuthenticationError', toUserMessage(error, resource), githubError.status);
  }
  if (githubError?.status) return new AppError('GitHubAPIError', toUserMessage(error, resource), githubError.status);
  return new AppError('NetworkError', toUserMessage(error, resource));
}