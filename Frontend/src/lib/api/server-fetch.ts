// Server Components fetch through here rather than calling fetch directly.
//
// Native fetch is used instead of the axios client because only fetch hooks
// into Next's request-deduping and next:{revalidate} caching — axios goes
// through Node's http module and bypasses that layer entirely.
//
// The deadline is the important part. A build machine reaching an API that
// isn't there does not necessarily get a connection refused: if the address
// routes nowhere, or a firewall drops the packets rather than rejecting them,
// the socket simply waits. Without a deadline that wait is unbounded, every
// page rendering the layout stalls, and the build dies on a timeout that names
// the page rather than the cause. An AbortSignal turns that silence into a
// prompt, catchable error.
const DEFAULT_TIMEOUT_MS = 8000;

export class ServerFetchError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = 'ServerFetchError';
  }
}

interface ServerFetchOptions {
  /** Seconds Next should serve this response from cache before refetching. */
  revalidate: number;
  timeoutMs?: number;
}

export async function serverFetch(
  path: string,
  { revalidate, timeoutMs = DEFAULT_TIMEOUT_MS }: ServerFetchOptions,
): Promise<Response> {
  // Straight to the API, not through the /api/backend rewrite the browser
  // uses: there is no cookie or CORS question server-side, and looping back
  // through this app's own origin would just add a hop.
  const baseUrl = process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL;

  // Explicit rather than letting the URL become the string "undefined/..." and
  // failing several frames away from the actual mistake.
  if (!baseUrl) {
    throw new ServerFetchError('Neither API_ORIGIN nor NEXT_PUBLIC_API_URL is set', null);
  }

  try {
    return await fetch(`${baseUrl}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    // TimeoutError is what AbortSignal.timeout throws; everything else here is
    // a genuine network failure. Both mean the same thing to a caller: no
    // answer, decide what to render without one.
    const reason = err instanceof Error && err.name === 'TimeoutError' ? `timed out after ${timeoutMs}ms` : 'unreachable';
    throw new ServerFetchError(`API ${reason}: ${path}`, null);
  }
}

/**
 * For data a page can render without. Returns `fallback` if the API is
 * unreachable, times out, or answers with an error status.
 *
 * Deliberately separate from serverFetch: swallowing a failure is right for a
 * nav menu or a currency symbol, and wrong for the product a page is about —
 * that should 404 or error rather than quietly render as if it doesn't exist.
 */
export async function serverFetchOptional<T>(
  path: string,
  options: ServerFetchOptions,
  fallback: T,
): Promise<T> {
  try {
    const res = await serverFetch(path, options);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}
