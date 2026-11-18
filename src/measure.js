export const REQUEST_COUNT = 10;

async function downloadOnce(url) {
  const startedAt = performance.now();
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  let bytes = 0;
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
    }
  }

  return {
    bytes,
    durationMs: performance.now() - startedAt,
  };
}

function summarize(url, samples) {
  const totalBytes = samples.reduce((sum, sample) => sum + sample.bytes, 0);
  const totalMs = samples.reduce((sum, sample) => sum + sample.durationMs, 0);
  const bitsPerSecond = totalMs === 0 ? 0 : (totalBytes * 8) / (totalMs / 1000);

  return {
    url,
    count: samples.length,
    totalBytes,
    totalMs,
    averageMs: totalMs / samples.length,
    bitsPerSecond,
  };
}

export async function measureSequential(url, count = REQUEST_COUNT, hooks = {}) {
  const samples = [];

  for (let index = 1; index <= count; index += 1) {
    hooks.onStart?.(index, count);

    try {
      const sample = await downloadOnce(url);
      samples.push(sample);
      hooks.onSample?.(sample, index, count);
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      failure.requestNumber = index;
      throw failure;
    }
  }

  return summarize(url, samples);
}
