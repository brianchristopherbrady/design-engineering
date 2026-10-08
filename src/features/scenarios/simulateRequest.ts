import type { RequestOutcome } from './scenarios';

export interface SimulateOptions {
  outcome: RequestOutcome;
  signal: AbortSignal;
  delayMs?: number;
  failureMessage?: string;
}

export const defaultFailureMessage = 'The server responded with 503 Service Unavailable.';

function abortError() {
  return new DOMException('The request was cancelled.', 'AbortError');
}

/**
 * A pretend network request: nothing leaves the browser. Resolves with `produce()`,
 * rejects, or never settles, according to `outcome`. Honours AbortSignal like fetch.
 */
export function simulateRequest<T>(
  produce: () => T,
  { outcome, signal, delayMs = 700, failureMessage = defaultFailureMessage }: SimulateOptions,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const timer =
      outcome === 'hang'
        ? undefined
        : setTimeout(() => {
            if (outcome === 'fail') reject(new Error(failureMessage));
            else resolve(produce());
          }, delayMs);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(abortError());
      },
      { once: true },
    );
  });
}
