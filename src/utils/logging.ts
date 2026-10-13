type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const priorities: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const configuredLevel = (process.env.LOG_LEVEL ?? 'info').toLowerCase() as LogLevel;
const threshold = priorities[configuredLevel] ?? priorities.info;

export function log(level: LogLevel, message: string, details?: Record<string, unknown>): void {
  if (priorities[level] < threshold) return;
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    for (const key of Object.keys(safeDetails)) {
      if (/token|authorization|secret/i.test(key)) safeDetails[key] = '[REDACTED]';
    }
  }
  const entry = { timestamp: new Date().toISOString(), level, message, ...(safeDetails ? { details: safeDetails } : {}) };
  process.stderr.write(`${JSON.stringify(entry)}\n`);
}