// Converts a Unix ms timestamp to a human-readable relative string.
// "just now" · "2m ago" · "3h ago" · "yesterday" · "Jun 8"

export function useRelativeTime(timestamp: number): string {
  const now     = Date.now();
  const diffMs  = now - timestamp;
  const diffSec = Math.floor(diffMs  / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 10)  { return 'just now'; }
  if (diffSec < 60)  { return `${diffSec}s ago`; }
  if (diffMin < 60)  { return `${diffMin}m ago`; }
  if (diffHr  < 24)  { return `${diffHr}h ago`; }
  if (diffDay === 1) { return 'yesterday'; }
  if (diffDay < 7)   { return `${diffDay}d ago`; }

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
}
