export type UsagePeriod = "this-month" | "last-month" | "last-3-months";

export const USAGE_PERIOD_OPTIONS: { value: UsagePeriod; label: string }[] = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "last-3-months", label: "Last 3 months" },
];

// Matches the backend's own default (start of the current calendar month) —
// there's no billing-period concept yet, see docs/BILLING_USAGE.md in
// webapp-api.
export function usagePeriodSince(period: UsagePeriod): string {
  const now = new Date();

  switch (period) {
    case "last-month":
      return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    case "last-3-months":
      return new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    case "this-month":
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
}
