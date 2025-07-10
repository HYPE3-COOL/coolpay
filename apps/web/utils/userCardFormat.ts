// Utility functions for formatting user card info

export function formatRequests(num?: number | null): string {
  if (typeof num !== 'number' || isNaN(num)) return '-';
  if (num >= 1000) {
    const k = Math.floor(num / 100) / 10;
    return `${k}k+`;
  }
  return num.toLocaleString();
}

export function formatCost(cost?: number | null): string {
  if (typeof cost !== 'number' || isNaN(cost)) return '$-';
  return `$${cost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
}

export function formatPercent(percent?: number | null): string {
  if (typeof percent !== 'number' || isNaN(percent)) return '-%';
  if (percent > 100) return '100%';
  return `${percent}%`;
}
