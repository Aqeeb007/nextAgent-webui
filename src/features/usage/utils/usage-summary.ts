import type { UsageEventType, UsageSummaryRow } from "../types/usage.types";

// A type with no events in the period is simply absent from the response
// (see usage.types.ts), so every reader needs this default-to-0 lookup
// rather than indexing the array directly.
export function quantityFor(rows: UsageSummaryRow[] | undefined, type: UsageEventType): number {
  return rows?.find((row) => row.eventType === type)?.totalQuantity ?? 0;
}

const COMPACT_UNITS = [
  { value: 1e9, suffix: "b" },
  { value: 1e6, suffix: "m" },
  { value: 1e3, suffix: "k" },
] as const;

// 13730 -> "13.7k", 1200000 -> "1.2m". Below 1000 the exact number reads
// better than a compact form ("999" not "1k"), so it's returned as-is.
export function formatUsageQuantity(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  for (const unit of COMPACT_UNITS) {
    if (abs >= unit.value) {
      const scaled = (abs / unit.value).toFixed(1).replace(/\.0$/, "");
      return `${sign}${scaled}${unit.suffix}`;
    }
  }

  return `${sign}${abs}`;
}
