import { describe, expect, it, vi } from 'vitest';
import { withRateLimitRetry } from '../src/utils/retry.js';

describe('reintentos por rate limit', () => {
  it('espera Retry-After y reintenta un rate limit recuperable', async () => {
    const wait = vi.fn().mockResolvedValue(undefined);
    const operation = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('rate limit'), { status: 429, response: { headers: { 'retry-after': '0.01' } } }))
      .mockResolvedValue('ok');

    await expect(withRateLimitRetry(operation, { wait })).resolves.toBe('ok');
    expect(wait).toHaveBeenCalledWith(10);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('no reintenta antes de un reset que supera la espera automática', async () => {
    const wait = vi.fn().mockResolvedValue(undefined);
    const operation = vi.fn().mockRejectedValue(Object.assign(new Error('rate limit'), {
      status: 403,
      response: { headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 600) } },
    }));

    await expect(withRateLimitRetry(operation, { wait })).rejects.toMatchObject({ status: 403 });
    expect(wait).not.toHaveBeenCalled();
    expect(operation).toHaveBeenCalledTimes(1);
  });
});