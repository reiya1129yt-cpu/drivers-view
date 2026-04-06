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
    <div style={{ padding: "16px 16px 0" }}>
      {/* Premium card */}
      <div style={{
        borderRadius: 20,
        background: "linear-gradient(160deg, #0f0d00 0%, #1c1500 40%, #120f00 100%)",
        border: "1px solid rgba(184,134,11,0.6)",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(212,175,55,0.08)",
      }}>
        {/* Top banner */}
        <div style={{
          background: "linear-gradient(90deg, #b8860b 0%, #d4af37 40%, #f5d060 60%, #d4af37 80%, #b8860b 100%)",
          padding: "11px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="#0f0d00" stroke="none" style={{ width: 18, height: 18 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#0f0d00", letterSpacing: "0.04em" }}>プレミアム会員</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#0f0d00" }}>330円<span style={{ fontSize: 11, fontWeight: 600 }}>/月</span></span>
        </div>

        {/* Benefits grid */}
        <div style={{ padding: "16px 18px 6px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
            {BENEFITS.map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#d4af37", flexShrink: 0,
                }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e8d5a3", lineHeight: 1.3 }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: "#7a6540", lineHeight: 1.4, marginTop: 1 }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.3), transparent)", margin: "10px 0" }} />

        {/* CTA button */}
        <div style={{ padding: "4px 18px 18px" }}>
          <button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            onClick={onSubscribe}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              background: pressed
                ? "linear-gradient(90deg, #8a6500, #b8941a, #8a6500)"
                : "linear-gradient(90deg, #b8860b 0%, #d4af37 35%, #f5d060 60%, #d4af37 80%, #b8860b 100%)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "filter 0.15s",
              filter: pressed ? "brightness(0.85)" : "brightness(1)",
              boxShadow: "0 2px 16px rgba(212,175,55,0.25)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="#0f0d00" stroke="none" style={{ width: 17, height: 17 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#0f0d00", letterSpacing: "0.02em" }}>
              プレミアムに登録する
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3a2e00" }}>330円/月</span>
          </button>

          <div style={{ textAlign: "center", marginTop: 9, fontSize: 11, color: "#4a3e20" }}>
            いつでもキャンセル可能 · 自動更新
          </div>
        </div>
      </div>
    </div>
  );
}
