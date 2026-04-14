"use client";

import { useState } from "react";

interface PremiumSectionProps {
  isPremium?: boolean;
  onSubscribe?: () => void;
}

const BENEFITS = [
  { label: "広告なし",        sub: "すべての広告を非表示" },
  { label: "お気に入り無制限", sub: "ガソリンスタンドを無制限登録" },
  { label: "価格アラート通知", sub: "価格変動をリアルタイム通知" },
  { label: "AI予測強化",      sub: "より精度の高い価格予測" },
  { label: "ポイントボーナス", sub: "投稿ごとに+2pt追加獲得" },
];

const FOR_WHO = [
  "毎日ガソリンを入れる人",
  "少しでも安く入れたい人",
  "広告なしで快適に使いたい人",
];

const STAR = (
  <svg viewBox="0 0 24 24" fill="#d4af37" stroke="none" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Detail modal ──────────────────────────────────────────────────────────────
function PremiumDetailModal({ onClose, onSubscribe }: { onClose: () => void; onSubscribe?: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.78)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "#0d0b07",
          border: "1px solid rgba(184,134,11,0.3)",
          borderRadius: "22px 22px 0 0",
          padding: "20px 20px 40px",
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(184,134,11,0.25)", margin: "0 auto 22px" }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 14, background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", marginBottom: 12 }}>
            <svg viewBox="0 0 24 24" fill="#d4af37" stroke="none" style={{ width: 22, height: 22 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#c9a84c", letterSpacing: "0.01em" }}>プレミアム会員</div>
          <div style={{ fontSize: 13, color: "#7a6540", marginTop: 4 }}>月330円</div>
        </div>

        {/* For who */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#5a4d30", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>こんな人におすすめ</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {FOR_WHO.map((w) => (
              <div key={w} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6b5c3a", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "#a08050" }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(184,134,11,0.12)", marginBottom: 16 }} />

        {/* Benefits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 24 }}>
          {BENEFITS.map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(184,134,11,0.04)", borderRadius: 10, border: "1px solid rgba(184,134,11,0.08)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#8a7040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#c4a55a" }}>{b.label}</span>
                <span style={{ fontSize: 11, color: "#5a4d30", marginLeft: 8 }}>{b.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          onClick={onSubscribe}
          style={{
            width: "100%", padding: "15px",
            borderRadius: 13,
            background: pressed
              ? "rgba(184,134,11,0.22)"
              : "rgba(184,134,11,0.16)",
            border: "1.5px solid rgba(184,134,11,0.5)",
            cursor: "pointer",
            fontSize: 15, fontWeight: 900,
            color: "#d4af37",
            letterSpacing: "0.02em",
            transition: "background 0.12s",
          }}
        >
          月330円で始める
        </button>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#3a3020" }}>
          いつでも解約可能
        </div>
      </div>
    </div>
  );
}

// ── Main compact card ─────────────────────────────────────────────────────────
export default function PremiumSection({ isPremium = false, onSubscribe }: PremiumSectionProps) {
  const [showDetail, setShowDetail] = useState(false);

  if (isPremium) {
    return (
      <div style={{ padding: "10px 16px 0" }}>
        <div style={{
          borderRadius: 12, background: "#12100a",
          border: "1px solid rgba(184,134,11,0.3)",
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          {STAR}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c", flex: 1 }}>プレミアム会員</span>
          <span style={{ fontSize: 11, color: "#d4af37", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 999, padding: "2px 9px", fontWeight: 600 }}>有効</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Compact card — one row */}
      <div style={{ padding: "10px 16px 0" }}>
        <button
          onClick={() => setShowDetail(true)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            background: "#12100a",
            border: "1px solid rgba(184,134,11,0.25)",
            borderRadius: 12, padding: "10px 14px",
            cursor: "pointer", textAlign: "left",
          }}
        >
          {STAR}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c" }}>プレミアム</span>
            <span style={{ fontSize: 11, color: "#5a4d30", marginLeft: 8 }}>広告なし · お気に入り無制限</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: "#5a4d30" }}>330円/月</span>
            <span style={{ fontSize: 10, color: "#7a6540" }}>他にも特典あり</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#5a4d30" strokeWidth="2" strokeLinecap="round" style={{ width: 13, height: 13 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <PremiumDetailModal
          onClose={() => setShowDetail(false)}
          onSubscribe={() => {
            setShowDetail(false);
            onSubscribe?.();
          }}
        />
      )}
    </>
  );
}
