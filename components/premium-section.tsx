"use client";

import { useState } from "react";

interface PremiumSectionProps {
  isPremium?: boolean;
  onSubscribe?: () => void;
}

const BENEFITS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
    label: "広告なし",
    sub: "すべての広告を非表示",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    label: "お気に入り無制限",
    sub: "無制限のガソリンスタンド登録",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    label: "価格アラート通知",
    sub: "価格変動をリアルタイム通知",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    label: "AI予測強化",
    sub: "より精度の高い価格予測",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    label: "投稿優先表示",
    sub: "あなたの投稿をフィード上位に表示",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    label: "ポイントボーナス",
    sub: "投稿ごとに+2pt追加獲得",
  },
];

export default function PremiumSection({ isPremium = false, onSubscribe }: PremiumSectionProps) {
  const [pressed, setPressed] = useState(false);

  if (isPremium) {
    return (
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, #1a1500 0%, #2a1f00 50%, #1a1500 100%)",
          border: "1px solid #b8860b",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="#d4af37" stroke="none" style={{ width: 22, height: 22 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#d4af37" }}>プレミアム会員</div>
            <div style={{ fontSize: 12, color: "#a0886a", marginTop: 2 }}>すべての特典が有効です</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#d4af37", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999, padding: "4px 10px" }}>有効</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{
        borderRadius: 16,
        background: "#12100a",
        border: "1px solid rgba(184,134,11,0.3)",
        overflow: "hidden",
      }}>
        {/* Header row */}
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="#d4af37" stroke="none" style={{ width: 15, height: 15 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c" }}>DriverView プレミアム</div>
            <div style={{ fontSize: 11, color: "#6b5c3a", marginTop: 1 }}>月330円 · いつでもキャンセル可</div>
          </div>
        </div>

        {/* Compact benefits list */}
        <div style={{ padding: "0 16px 4px", display: "flex", flexDirection: "column", gap: 1 }}>
          {BENEFITS.map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
              <div style={{ color: "#8a6e2e", flexShrink: 0 }}>{b.icon}</div>
              <span style={{ fontSize: 12, color: "#c4a55a", fontWeight: 600 }}>{b.label}</span>
              <span style={{ fontSize: 11, color: "#4a3e20", marginLeft: 2 }}>— {b.sub}</span>
            </div>
          ))}
        </div>

        {/* Thin divider */}
        <div style={{ height: 1, background: "rgba(184,134,11,0.15)", margin: "6px 16px" }} />

        {/* CTA */}
        <div style={{ padding: "8px 16px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            onClick={onSubscribe}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              background: pressed ? "rgba(184,134,11,0.18)" : "rgba(184,134,11,0.12)",
              border: "1px solid rgba(184,134,11,0.35)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              color: "#c9a84c",
              transition: "background 0.15s",
              letterSpacing: "0.01em",
            }}
          >
            もっと便利に使う
          </button>
          <span style={{ fontSize: 11, color: "#4a3e20", flexShrink: 0 }}>330円/月</span>
        </div>
      </div>
    </div>
  );
}
