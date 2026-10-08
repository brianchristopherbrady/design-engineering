import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One value describes the request. Each variant carries only the data that makes sense
 * for it, so "loading with an error" or "success without data" cannot be represented.
 */
export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'pending'; requestId: number }
  | { status: 'success'; requestId: number; data: T }
  | { status: 'error'; requestId: number; message: string }
  | { status: 'cancelled'; requestId: number };

export type RequestFn<T, A> = (args: A, signal: AbortSignal) => Promise<T>;

/** Runs one request at a time: a new load cancels the previous one, and late responses are ignored. */
export function useRequest<T, A = void>(request: RequestFn<T, A>) {
  const [state, setState] = useState<RequestState<T>>({ status: 'idle' });
  const latestRequest = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(
    (args: A) => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      const requestId = ++latestRequest.current;
      setState({ status: 'pending', requestId });

      request(args, abort.signal).then(
        (data) => {
          // The id check ignores a response that arrives after a newer request started.
          if (requestId === latestRequest.current) setState({ status: 'success', requestId, data });
        },
        (error: unknown) => {
          if (requestId !== latestRequest.current || abort.signal.aborted) return;
          setState({ status: 'error', requestId, message: error instanceof Error ? error.message : String(error) });
        },
      );
    },
    [request],
  );

  const cancel = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setState((current) => (current.status === 'pending' ? { status: 'cancelled', requestId: current.requestId } : current));
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { state, load, cancel };
}
