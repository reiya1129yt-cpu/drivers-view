"use client";

// ── Mock ad data ──────────────────────────────────────────────────────────────

export interface MockAd {
  id: string;
  sponsor: string;
  headline: string;
  body: string;
  cta: string;
  accentColor: string;
  /** Inline SVG icon to show in the ad */
  icon: "fuel" | "car" | "map" | "card";
}

const ADS: MockAd[] = [
  {
    id: "ad-1",
    sponsor: "ENEOSカード",
    headline: "給油でポイント2倍！",
    body: "ENEOSカード会員は毎日の給油がお得。入会費・年会費無料。",
    cta: "詳しく見る",
    accentColor: "#f59e0b",
    icon: "card",
  },
  {
    id: "ad-2",
    sponsor: "カーリース比較",
    headline: "月々定額で新車に乗ろう",
    body: "保険・税金コミコミ。頭金ゼロで人気の国産車が選べます。",
    cta: "無料で比較",
    accentColor: "#3b82f6",
    icon: "car",
  },
  {
    id: "ad-3",
    sponsor: "ドライブナビ Pro",
    headline: "渋滞ゼロのルートを発見",
    body: "AIがリアルタイムで最短ルートを案内。無料トライアル実施中。",
    cta: "無料で試す",
    accentColor: "#22c55e",
    icon: "map",
  },
  {
    id: "ad-4",
    sponsor: "出光スーパーカード",
    headline: "ガソリン代が最大5円/L引き",
    body: "出光カードで給油するだけで自動割引。全国5,000店舗以上対応。",
    cta: "今すぐ申し込む",
    accentColor: "#ef4444",
    icon: "fuel",
  },
];

/** Returns a deterministic mock ad based on an index (rotates through pool) */
export function getAd(index: number): MockAd {
  return ADS[index % ADS.length];
}

// ── Icon components ───────────────────────────────────────────────────────────

function AdIcon({ type, color }: { type: MockAd["icon"]; color: string }) {
  const s = { width: 22, height: 22 };
  if (type === "fuel") return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <path d="M3 22V8l6-6h6l4 4v16H3z"/><path d="M3 14h12"/><path d="M15 8h2a2 2 0 012 2v4a2 2 0 01-2 2h-2"/>
    </svg>
  );
  if (type === "car") return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h13l4 4v4a2 2 0 01-2 2h-1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
    </svg>
  );
  if (type === "map") return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  );
  // card
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}>
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  );
}

// ── Feed ad card (inline between posts) ──────────────────────────────────────

interface FeedAdCardProps {
  adIndex?: number;
}

export function FeedAdCard({ adIndex = 0 }: FeedAdCardProps) {
  const ad = getAd(adIndex);
  return (
    <div
      role="presentation"
      aria-label="広告"
      style={{
        background: "#141720",
        borderRadius: 14,
        border: "1px solid #1e2235",
        borderLeft: `3px solid ${ad.accentColor}`,
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle tinted bg strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: `${ad.accentColor}06`,
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${ad.accentColor}16`,
        border: `1px solid ${ad.accentColor}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AdIcon type={ad.icon} color={ad.accentColor} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Sponsor + AD label */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            background: "#2a2f42", color: "#6b7280",
            borderRadius: 4, padding: "1px 5px",
          }}>PR</span>
          <span style={{ fontSize: 10, color: "#6b7280" }}>{ad.sponsor}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f2f5", lineHeight: 1.3, marginBottom: 3 }}>
          {ad.headline}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {ad.body}
        </div>
      </div>

      {/* CTA button */}
      <button
        style={{
          flexShrink: 0,
          padding: "7px 11px",
          borderRadius: 9,
          fontSize: 11, fontWeight: 700,
          background: `${ad.accentColor}20`,
          border: `1px solid ${ad.accentColor}50`,
          color: ad.accentColor,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {ad.cta}
      </button>
    </div>
  );
}

// ── Banner ad (map bottom overlay) ───────────────────────────────────────────

interface BannerAdProps {
  adIndex?: number;
  onClose?: () => void;
}

export function BannerAd({ adIndex = 0, onClose }: BannerAdProps) {
  const ad = getAd(adIndex);
  return (
    <div
      role="presentation"
      aria-label="広告バナー"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#141720",
        borderTop: `2px solid ${ad.accentColor}`,
        padding: "9px 14px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* tint strip */}
      <div style={{
        position: "absolute", inset: 0,
        background: `${ad.accentColor}07`,
        pointerEvents: "none",
      }} />

      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${ad.accentColor}18`,
        border: `1px solid ${ad.accentColor}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AdIcon type={ad.icon} color={ad.accentColor} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
            background: "#2a2f42", color: "#6b7280",
            borderRadius: 3, padding: "1px 4px",
          }}>PR</span>
          <span style={{ fontSize: 9, color: "#6b7280" }}>{ad.sponsor}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f0f2f5", lineHeight: 1.3 }}>
          {ad.headline}
        </div>
        <div style={{
          fontSize: 10, color: "#6b7280",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {ad.body}
        </div>
      </div>

      {/* CTA */}
      <button style={{
        flexShrink: 0,
        padding: "6px 10px",
        borderRadius: 8,
        fontSize: 11, fontWeight: 700,
        background: ad.accentColor,
        border: "none",
        color: "#0f1117",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}>
        {ad.cta}
      </button>

      {/* Close */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="広告を閉じる"
          style={{
            flexShrink: 0, background: "none", border: "none",
            color: "#4b5563", cursor: "pointer", padding: "2px 4px",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 14, height: 14 }}>
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Search result ad (slim row) ───────────────────────────────────────────────

interface SearchAdProps {
  adIndex?: number;
}

export function SearchAd({ adIndex = 0 }: SearchAdProps) {
  const ad = getAd(adIndex);
  return (
    <div
      role="presentation"
      aria-label="PR"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        background: `${ad.accentColor}08`,
        borderBottom: "1px solid #1e2235",
        position: "relative",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: `${ad.accentColor}18`,
        border: `1px solid ${ad.accentColor}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <AdIcon type={ad.icon} color={ad.accentColor} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.06em",
            background: "#2a2f42", color: "#6b7280",
            borderRadius: 3, padding: "1px 4px",
          }}>PR</span>
          <span style={{ fontSize: 10, color: "#6b7280" }}>{ad.sponsor}</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f5" }}>{ad.headline}</div>
      </div>

      {/* CTA */}
      <span style={{ fontSize: 10, fontWeight: 700, color: ad.accentColor, flexShrink: 0 }}>
        {ad.cta} →
      </span>
    </div>
  );
}
