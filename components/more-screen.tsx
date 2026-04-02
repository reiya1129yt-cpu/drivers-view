"use client";

import { useState } from "react";

const NEWS = [
  { id: 1, title: "原油価格が2週間ぶりに下落、ガソリン価格にも影響か", source: "日経エネルギー", time: "2時間前", tag: "価格動向", tagColor: "#22c55e" },
  { id: 2, title: "環境省、EV補助金を来年度も継続へ。ガソリン車ユーザーへの影響は？", source: "エコ自動車ニュース", time: "5時間前", tag: "政策", tagColor: "#3b82f6" },
  { id: 3, title: "中東情勢の緊迫でWTI原油が上昇、来週のガソリン価格に注目", source: "石油情報センター", time: "昨日", tag: "原油", tagColor: "#f59e0b" },
  { id: 4, title: "セルフスタンドの割合が全国で70%超え、セルフ化加速の背景", source: "業界レポート", time: "2日前", tag: "業界", tagColor: "#a78bfa" },
];

const NOTIFICATIONS = [
  { id: 1, text: "近くのスタンドでレギュラー¥5値下がりしました", time: "10分前", read: false, color: "#22c55e" },
  { id: 2, text: "あなたの投稿に3件のいいねが付きました", time: "1時間前", read: false, color: "#f59e0b" },
  { id: 3, text: "今週のAI価格予測が更新されました", time: "昨日", read: true, color: "#3b82f6" },
  { id: 4, text: "新しいガソリン価格情報が投稿されました", time: "2日前", read: true, color: "#6b7280" },
];

const PREDICTION = [
  { label: "今週", price: 168, change: 0, color: "#3b82f6" },
  { label: "来週", price: 172, change: +4, color: "#f59e0b" },
  { label: "再来週", price: 169, change: -3, color: "#22c55e" },
  { label: "1ヶ月後", price: 164, change: -8, color: "#22c55e" },
];

type Section = "main" | "notifications";

export default function MoreScreen() {
  const [section, setSection] = useState<Section>("main");
  const [notifEnabled, setNotifEnabled] = useState(true);

  if (section === "notifications") {
    return (
      <div style={{ height: "100%", background: "#0f1117", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 16px 12px" }}>
          <button onClick={() => setSection("main")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 22, height: 22 }}><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", margin: 0 }}>通知</h2>
        </div>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 0 }}>
          {NOTIFICATIONS.map((n, i) => (
            <div key={n.id} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "14px 0",
              borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #2a2f42" : "none",
              opacity: n.read ? 0.6 : 1,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${n.color}22`, border: `1.5px solid ${n.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={n.color} strokeWidth="2" style={{ width: 16, height: 16 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#f0f2f5", lineHeight: 1.5 }}>{n.text}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
        <div style={{ height: 40 }} />
      </div>
    );
  }

  const maxPrice = Math.max(...PREDICTION.map(d => d.price));
  const minPrice = Math.min(...PREDICTION.map(d => d.price));

  return (
    <div style={{ height: "100%", background: "#0f1117", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f0f2f5", margin: 0 }}>その他</h1>
      </div>

      {/* Profile card */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          background: "#1a1d27", borderRadius: 20, padding: "18px 18px",
          border: "1px solid #2a2f42", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg,#22c55e,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>G</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f2f5" }}>ゲストユーザー</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>ログインしていません</div>
          </div>
          <button style={{
            padding: "8px 18px", borderRadius: 999,
            background: "#22c55e", color: "#0f1117",
            fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
          }}>ログイン</button>
        </div>
      </div>

      {/* AI Prediction */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>AIガソリン価格予測</div>
        <div style={{ background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", overflow: "hidden" }}>
          <div style={{
            padding: "12px 16px", background: "rgba(34,197,94,0.07)",
            borderBottom: "1px solid #2a2f42", display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(34,197,94,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f2f5" }}>レギュラーガソリン予測</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>AIによる価格トレンド分析（参考値）</div>
            </div>
          </div>
          <div style={{ padding: "16px 16px 12px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 90, marginBottom: 10 }}>
              {PREDICTION.map((d) => {
                const pct = 20 + ((d.price - minPrice) / Math.max(maxPrice - minPrice, 1)) * 75;
                return (
                  <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: d.color }}>¥{d.price}</div>
                    <div style={{
                      width: "100%", borderRadius: "5px 5px 0 0",
                      background: `${d.color}28`, border: `1px solid ${d.color}55`,
                      height: `${pct}%`,
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {PREDICTION.map((d) => (
                <div key={d.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{d.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: d.color, marginTop: 2 }}>
                    {d.change > 0 ? `+${d.change}` : d.change < 0 ? `${d.change}` : "±0"}円
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: "8px 16px 12px", borderTop: "1px solid #2a2f42" }}>
            <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
              ※ 予測は過去データと原油先物指標に基づく参考値です。実際の価格と異なる場合があります。
            </p>
          </div>
        </div>
      </div>

      {/* Notifications row */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>通知</div>
        <div style={{ background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", overflow: "hidden" }}>
          <button
            onClick={() => setSection("notifications")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #2a2f42" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#22263a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 15, color: "#f0f2f5", fontWeight: 500 }}>通知センター</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>未読 {NOTIFICATIONS.filter(n => !n.read).length}件</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0f1117" }}>
                {NOTIFICATIONS.filter(n => !n.read).length}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}><path d="M9 18l6-6-6-6" /></svg>
            </div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#22263a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <circle cx="18" cy="5" r="3" fill="#22c55e" stroke="none" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 15, color: "#f0f2f5", fontWeight: 500 }}>価格アラート</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>価格変動をお知らせ</div>
            </div>
            <button
              onClick={() => setNotifEnabled(!notifEnabled)}
              style={{
                width: 46, height: 26, borderRadius: 999,
                background: notifEnabled ? "#22c55e" : "#2a2f42",
                border: "none", cursor: "pointer", position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: notifEnabled ? 23 : 3,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s",
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* News */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>ガソリン関連ニュース</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {NEWS.map((n) => (
            <div key={n.id} style={{
              background: "#1a1d27", borderRadius: 14, padding: "14px 16px",
              border: "1px solid #2a2f42", cursor: "pointer",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: `${n.tagColor}22`, color: n.tagColor, fontWeight: 700 }}>
                    {n.tag}
                  </span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{n.source}</span>
                  <span style={{ fontSize: 11, color: "#4b5563" }}>·</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 14, color: "#f0f2f5", lineHeight: 1.55, fontWeight: 500 }}>{n.title}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}><path d="M9 18l6-6-6-6" /></svg>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>設定</div>
        <div style={{ background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", overflow: "hidden" }}>
          {[
            { label: "表示地域", sub: "関東エリア", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg> },
            { label: "アプリについて", sub: "バージョン 1.0.0", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> },
          ].map((item, i, arr) => (
            <button key={item.label} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
              borderBottom: i < arr.length - 1 ? "1px solid #2a2f42" : "none",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#22263a", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 15, color: "#f0f2f5", fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{item.sub}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}><path d="M9 18l6-6-6-6" /></svg>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}
