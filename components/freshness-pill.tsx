"use client";

import { getFreshness, getFreshnessBadgeLabel, FRESHNESS_COLORS, FRESHNESS_BG } from "@/lib/freshness";

/**
 * Displays a freshness pill badge for a price report.
 * - fresh  (< 24h):  green  "最新"
 * - recent (< 7d):   amber  "3日前"
 * - old    (>= 7d):  grey   "1週間以上前"  + warning note
 */
export function FreshnessPill({ reportedAt }: { reportedAt: string }) {
  const freshness  = getFreshness(reportedAt);
  const freshLabel = getFreshnessBadgeLabel(reportedAt);
  const freshColor = FRESHNESS_COLORS[freshness];
  const freshBg    = FRESHNESS_BG[freshness];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: freshBg, color: freshColor,
        border: `1px solid ${freshColor}44`,
        borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "2px 9px",
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: "50%",
          background: freshColor, display: "inline-block", flexShrink: 0,
        }} />
        {freshLabel}
      </span>
      {freshness === "old" && (
        <span style={{ fontSize: 10, color: "#6b7280" }}>{"情報が古い可能性があります"}</span>
      )}
    </div>
  );
}

/** Returns the opacity to apply to a card based on freshness — old posts are slightly dimmed. */
export function freshnessOpacity(reportedAt: string): number {
  return getFreshness(reportedAt) === "old" ? 0.82 : 1;
}
