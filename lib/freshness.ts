/**
 * Price freshness utilities — used consistently across map markers,
 * station detail, list view, and post feed.
 *
 * Rules:
 *  - fresh:  reported within 24 hours
 *  - recent: reported within 7 days
 *  - old:    older than 7 days (only flagged if it is still the latest price)
 *
 * A price post is "superseded" when a newer post exists for the same
 * station (matched by station_name + fuel_type). Superseded posts older
 * than 7 days are hidden from the active price view.
 */

export type FreshnessState = "fresh" | "recent" | "old";

const MS_DAY  = 86_400_000;
const MS_WEEK = 7 * MS_DAY;

/** Return the freshness state for a given ISO date string. */
export function getFreshness(reportedAt: string): FreshnessState {
  const age = Date.now() - new Date(reportedAt).getTime();
  if (age < MS_DAY)  return "fresh";
  if (age < MS_WEEK) return "recent";
  return "old";
}

/** Human-readable Japanese label, e.g. "最新", "3日前", "1週間以上前" */
export function getFreshnessLabel(reportedAt: string): string {
  const age = Date.now() - new Date(reportedAt).getTime();
  if (age < 60_000)          return "たった今";
  if (age < 3_600_000)       return `${Math.floor(age / 60_000)}分前`;
  if (age < MS_DAY)          return `${Math.floor(age / 3_600_000)}時間前`;
  if (age < MS_WEEK)         return `${Math.floor(age / MS_DAY)}日前`;
  const weeks = Math.floor(age / MS_WEEK);
  return weeks === 1 ? "1週間以上前" : `${weeks}週間以上前`;
}

/** Short badge label: "最新" | "3日前" | "1週間以上前" */
export function getFreshnessBadgeLabel(reportedAt: string): string {
  const age = Date.now() - new Date(reportedAt).getTime();
  if (age < MS_DAY)          return "最新";
  if (age < MS_WEEK)         return `${Math.floor(age / MS_DAY)}日前`;
  return "1週間以上前";
}

/** Accent colour per state. */
export const FRESHNESS_COLORS: Record<FreshnessState, string> = {
  fresh:  "#22c55e",   // green
  recent: "#f59e0b",   // amber
  old:    "#6b7280",   // grey
};

/** Background (semi-transparent) per state. */
export const FRESHNESS_BG: Record<FreshnessState, string> = {
  fresh:  "rgba(34,197,94,0.15)",
  recent: "rgba(245,158,11,0.15)",
  old:    "rgba(107,114,128,0.12)",
};

export interface StationWithHistory<T> {
  /** The single active (latest) price record to display. */
  active: T;
  /** All historical records for this station (newest first). */
  history: T[];
  freshness: FreshnessState;
}

/**
 * Given a flat list of price records (each has station_name, fuel_type,
 * reported_at), group by (station_name, fuel_type) and return one active
 * record per station — the newest — plus its full history.
 *
 * Superseded posts older than 7 days are excluded from the active view
 * but kept in history.
 */
export function selectActivePrices<T extends {
  id: string;
  station_name: string;
  fuel_type: string;
  reported_at: string;
}>(records: T[]): StationWithHistory<T>[] {
  // Group by station key
  const groups = new Map<string, T[]>();
  for (const r of records) {
    const key = `${r.station_name}::${r.fuel_type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const result: StationWithHistory<T>[] = [];
  for (const group of groups.values()) {
    // Sort newest first
    const sorted = group.sort(
      (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime(),
    );
    const active = sorted[0];
    result.push({
      active,
      history: sorted,
      freshness: getFreshness(active.reported_at),
    });
  }

  return result;
}
