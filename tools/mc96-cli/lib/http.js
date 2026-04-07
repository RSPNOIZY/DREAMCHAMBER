/**
 * Safe HTTP fetch with timeout and error handling.
 * Never throws — returns { ok, data, error, latency }.
 */
export async function safeFetch(url, options = {}) {
  const start = performance.now();
  const timeout = options.timeout || 5000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const latency = Math.round(performance.now() - start);
    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return { ok: res.ok, status: res.status, data, latency, error: null };
  } catch (err) {
    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);
    const message = err.name === 'AbortError'
      ? `Timeout after ${timeout}ms`
      : err.code === 'ECONNREFUSED'
        ? 'Connection refused — service offline'
        : err.message;
    return { ok: false, status: 0, data: null, latency, error: message };
  }
}
