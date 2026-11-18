const MIB = 1024 * 1024;
const MEGABIT = 1_000_000;

export function formatDuration(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatBytes(bytes) {
  const mib = bytes / MIB;
  return `${mib.toFixed(2)} MiB (${bytes} байт)`;
}

export function formatSpeed(bitsPerSecond) {
  const mbps = bitsPerSecond / MEGABIT;
  return `${mbps.toFixed(2)} Мбит/с`;
}
