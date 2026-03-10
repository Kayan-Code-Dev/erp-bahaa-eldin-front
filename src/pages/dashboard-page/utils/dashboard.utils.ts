export function fmtNum(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return Number(value).toLocaleString("en-US");
}

export function fmtCur(value: number | undefined | null, suffix = "ج.م"): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${Number(value).toLocaleString("en-US")} ${suffix}`;
}

export function fmtPct(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(1)}%`;
}

export function fmtCompact(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "0";
  const n = Number(value);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("en-US");
}
