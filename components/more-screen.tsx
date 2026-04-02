"use client";

import { useState } from "react";

const mockNews = [
  { id: 1, title: "原油価格が2週間ぶりに下落、ガソリン価格にも影響か", source: "日経エネルギー", time: "2時間前", tag: "価格動向" },
  { id: 2, title: "環境省、EV補助金を来年度も継続へ。ガソリン車ユーザーへの影響は？", source: "エコ自動車ニュース", time: "5時間前", tag: "政策" },
  { id: 3, title: "中東情勢の緊迫でWTI原油が上昇、来週のガソリン価格に注目", source: "石油情報センター", time: "昨日", tag: "原油" },
  { id: 4, title: "セルフスタンドの割合が全国で70%超え、セルフ化加速の背景", source: "業界レポート", time: "2日前", tag: "業界" },
];

const PREDICTION_DATA = [
  { label: "今週", price: 168, change: 0, status: "stable" as const },
  { label: "来週", price: 171, change: +3, status: "up" as const },
  { label: "再来週", price: 169, change: -2, status: "down" as const },
  { label: "1ヶ月後", price: 165, change: -6, status: "down" as const },
];

const tagColors: Record<string, { bg: string; color: string }> = {
  "価格動向": { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  "政策": { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  "原油": { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
  "業界": { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
};

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ padding: "20px 20px 10px" }}>
      <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {title}
      </h2>
    </div>
  );
}

function SettingsRow({ icon, label, sublabel, danger }: { icon: React.ReactNode; label: string; sublabel?: string; danger?: boolean }) {
  return (
    <button
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 20px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        borderBottom: "1px solid #2a2f42",
      }}
    >
      <div style={{
        width: 36, height: 36,
        borderRadius: "10px",
        background: danger ? "rgba(239,68,68,0.15)" : "#22263a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: danger ? "#f87171" : "#9ca3af",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "15px", color: danger ? "#f87171" : "#f0f2f5", fontWeight: 500 }}>{label}</div>
        {sublabel && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "1px" }}>{sublabel}</div>}
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="#2a2f42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

export default function MoreScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const maxPrice = Math.max(...PREDICTION_DATA.map(d => d.price));
  const minPrice = Math.min(...PREDICTION_DATA.map(d => d.price));

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0f1117" }}>
      {/* Profile card */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{
          background: "#1a1d27",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #2a2f42",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "#fff",
          }}>G</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#f0f2f5" }}>ゲストユーザー</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>ログインしていません</div>
          </div>
          <button style={{
            padding: "8px 16px",
            borderRadius: "20px",
            background: "#22c55e",
            color: "#0f1117",
            fontSize: "13px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}>
            ログイン
          </button>
        </div>
      </div>

      {/* AI Prediction */}
      <SectionHeader title="AIガソリン価格予測" />
      <div style={{ padding: "0 20px 4px" }}>
        <div style={{
          background: "#1a1d27",
          borderRadius: "16px",
          border: "1px solid #2a2f42",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 16px",
            background: "rgba(34,197,94,0.08)",
            borderBottom: "1px solid #2a2f42",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: "8px",
              background: "rgba(34,197,94,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
                <path d="M22 2L16 8" />
                <path d="M17 2h5v5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#f0f2f5" }}>レギュラーガソリン予測</div>
              <div style={{ fontSize: "11px", color: "#6b7280" }}>AIによる価格トレンド分析（参考値）</div>
            </div>
          </div>

          {/* Chart bars */}
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "80px", marginBottom: "12px" }}>
              {PREDICTION_DATA.map((d) => {
                const heightPct = 30 + ((d.price - minPrice) / (maxPrice - minPrice + 1)) * 70;
                const color = d.status === "up" ? "#f59e0b" : d.status === "down" ? "#22c55e" : "#3b82f6";
                return (
                  <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color }}>¥{d.price}</div>
                    <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: `${color}33`, border: `1px solid ${color}66`, height: `${heightPct}%` }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {PREDICTION_DATA.map((d) => {
                const color = d.status === "up" ? "#f59e0b" : d.status === "down" ? "#22c55e" : "#3b82f6";
                const changeStr = d.change > 0 ? `+${d.change}` : d.change < 0 ? `${d.change}` : "±0";
                return (
                  <div key={d.label} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{d.label}</div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color, marginTop: "2px" }}>{changeStr}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: "10px 16px 14px", borderTop: "1px solid #2a2f42" }}>
            <p style={{ fontSize: "11px", color: "#6b7280", lineHeight: 1.5 }}>
              ※ 予測は過去データと原油先物指標に基づく参考値です。実際の価格と異なる場合があります。
            </p>
          </div>
        </div>
      </div>

      {/* News */}
      <SectionHeader title="ガソリン関連ニュース" />
      <div style={{ padding: "0 20px 4px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {mockNews.map((news) => {
          const tc = tagColors[news.tag] || { bg: "#22263a", color: "#9ca3af" };
          return (
            <div key={news.id} style={{
              background: "#1a1d27",
              borderRadius: "12px",
              padding: "14px 16px",
              border: "1px solid #2a2f42",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: tc.bg, color: tc.color, fontWeight: 600 }}>
                      {news.tag}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>{news.source}</span>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>{news.time}</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#f0f2f5", lineHeight: 1.5, fontWeight: 500 }}>
                    {news.title}
                  </div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2a2f42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: "2px" }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings */}
      <SectionHeader title="設定" />
      <div style={{ background: "#1a1d27", borderRadius: "16px", margin: "0 20px", border: "1px solid #2a2f42", overflow: "hidden" }}>
        <SettingsRow
          label="通知設定"
          sublabel={notificationsEnabled ? "価格更新をお知らせ" : "オフ"}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
        />
        <SettingsRow
          label="表示地域"
          sublabel="関東エリア"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>}
        />
        <SettingsRow
          label="アプリについて"
          sublabel="バージョン 1.0.0"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        />
      </div>

      <div style={{ height: "40px" }} />
    </div>
  );
}
