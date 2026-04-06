"use client";

import { useState } from "react";

// ── i18n strings (3 languages) ────────────────────────────────────────────────
const I18N = {
  ja: {
    title: "その他",
    guest: "ゲストユーザー",
    notLoggedIn: "ログインしていません",
    login: "ログイン",
    aiTitle: "AIガソリン価格予測",
    aiSub: "AIによる価格トレンド分析（参考値）",
    aiLabel: "レギュラーガソリン予測",
    aiDisclaimer: "※ 予測は過去データと原油先物指標に基づく参考値です。実際の価格と異なる場合があります。",
    notifications: "通知",
    notifCenter: "通知センター",
    unread: (n: number) => `未読 ${n}件`,
    priceAlert: "価格アラート",
    priceAlertSub: "価格変動をお知らせ",
    news: "ガソリン関連ニュース",
    settings: "設定",
    region: "表示地域",
    regionVal: "関東エリア",
    language: "言語 / Language",
    languageVal: "日本語",
    about: "アプリについて",
    aboutVal: "バージョン 1.0.0",
    back: "戻る",
    selectLanguage: "言語を選択",
    weeks: ["今週", "来週", "再来週", "1ヶ月後"],
  },
  en: {
    title: "More",
    guest: "Guest User",
    notLoggedIn: "Not logged in",
    login: "Log In",
    aiTitle: "AI Fuel Price Forecast",
    aiSub: "AI-based price trend analysis (reference only)",
    aiLabel: "Regular Gasoline Forecast",
    aiDisclaimer: "* Forecasts are reference values based on historical data and crude oil futures. Actual prices may differ.",
    notifications: "Notifications",
    notifCenter: "Notification Center",
    unread: (n: number) => `${n} unread`,
    priceAlert: "Price Alert",
    priceAlertSub: "Get notified on price changes",
    news: "Fuel News",
    settings: "Settings",
    region: "Display Region",
    regionVal: "Kanto Area",
    language: "Language / 言語",
    languageVal: "English",
    about: "About",
    aboutVal: "Version 1.0.0",
    back: "Back",
    selectLanguage: "Select Language",
    weeks: ["This week", "Next week", "Week after", "1 month"],
  },
  zh: {
    title: "更多",
    guest: "访客用户",
    notLoggedIn: "未登录",
    login: "登录",
    aiTitle: "AI油价预测",
    aiSub: "基于AI的价格趋势分析（仅供参考）",
    aiLabel: "普通汽油预测",
    aiDisclaimer: "※ 预测基于历史数据及原油期货指标，仅供参考，实际价格可能有所不同。",
    notifications: "通知",
    notifCenter: "通知中心",
    unread: (n: number) => `${n} 条未读`,
    priceAlert: "价格提醒",
    priceAlertSub: "价格变动时通知我",
    news: "燃油相关新闻",
    settings: "设置",
    region: "显示地区",
    regionVal: "关东地区",
    language: "语言 / Language",
    languageVal: "中文",
    about: "关于应用",
    aboutVal: "版本 1.0.0",
    back: "返回",
    selectLanguage: "选择语言",
    weeks: ["本周", "下周", "下下周", "1个月后"],
  },
} as const;

type Lang = keyof typeof I18N;

// ── Static data ───────────────────────────────────────────────────────────────
const NEWS = [
  { id: 1, title: "原油価格が2週間ぶりに下落、ガソリン価格にも影響か", titleEn: "Crude oil falls for first time in 2 weeks, may affect gas prices", titleZh: "原油价格两周来首次下跌，或影响汽油价格", source: "日経エネルギー", time: "2時間前", tag: "価格動向", tagColor: "#22c55e" },
  { id: 2, title: "環境省、EV補助金を来年度も継続へ", titleEn: "Ministry to extend EV subsidies into next fiscal year", titleZh: "环境省宣布明年继续推行EV补贴政策", source: "エコ自動車ニュース", time: "5時間前", tag: "政策", tagColor: "#3b82f6" },
  { id: 3, title: "中東情勢の緊迫でWTI原油が上昇", titleEn: "WTI crude rises on Middle East tensions", titleZh: "中东局势紧张致WTI原油上涨", source: "石油情報センター", time: "昨日", tag: "原油", tagColor: "#f59e0b" },
  { id: 4, title: "セルフスタンドの割合が全国で70%超え", titleEn: "Self-service stations now exceed 70% nationwide", titleZh: "全国自助加油站比例突破70%", source: "業界レポート", time: "2日前", tag: "業界", tagColor: "#a78bfa" },
];

const NOTIFICATIONS = [
  { id: 1, text: "近くのスタンドでレギュラー¥5値下がりしました", read: false, color: "#22c55e", time: "10分前" },
  { id: 2, text: "あなたの投稿に3件のいいねが付きました",       read: false, color: "#f59e0b", time: "1時間前" },
  { id: 3, text: "今週のAI価格予測が更新されました",           read: true,  color: "#3b82f6", time: "昨日" },
  { id: 4, text: "新しいガソリン価格情報が投稿されました",     read: true,  color: "#6b7280", time: "2日前" },
];

const PREDICTION = [
  { price: 168, change:  0 },
  { price: 172, change: +4 },
  { price: 169, change: -3 },
  { price: 164, change: -8 },
];

const LANG_OPTIONS: { code: Lang; nativeName: string; flag: string }[] = [
  { code: "ja", nativeName: "日本語",  flag: "🇯🇵" },
  { code: "en", nativeName: "English", flag: "🇺🇸" },
  { code: "zh", nativeName: "中文",    flag: "🇨🇳" },
];

// ── Points data ───────────────────────────────────────────────────────────────
const MOCK_POINTS = 120;

const POINT_HISTORY = [
  { id: 1, label: "投稿ボーナス",       delta: +5,  time: "今日 10:23",   icon: "post" },
  { id: 2, label: "いいね獲得",         delta: +1,  time: "今日 08:47",   icon: "like" },
  { id: 3, label: "投稿ボーナス",       delta: +5,  time: "昨日 19:04",   icon: "post" },
  { id: 4, label: "いいね獲得",         delta: +1,  time: "昨日 14:12",   icon: "like" },
  { id: 5, label: "いいね獲得",         delta: +1,  time: "2日前",         icon: "like" },
  { id: 6, label: "投稿ボーナス",       delta: +5,  time: "3日前",         icon: "post" },
];

const REWARD_CARDS = [
  {
    id: "gas",
    title: "ガソリン割引",
    desc: "次回給油時に使える割引クーポン",
    pts: 500,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/>
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M7 13l-1.4-7"/>
      </svg>
    ),
  },
  {
    id: "coupon",
    title: "クーポン",
    desc: "提携店舗で使えるお得なクーポン",
    pts: 300,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: "gift",
    title: "ギフトカード",
    desc: "各種ギフトカードに交換できます",
    pts: 1000,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.3)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        <path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/>
        <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
] as const;

type Section = "main" | "notifications" | "language" | "points";

// ── Row helper ────────────────────────────────────────────────────────────────
function SettingsRow({ icon, label, sub, onClick, right }: {
  icon: React.ReactNode; label: string; sub?: string;
  onClick?: () => void; right?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "13px 16px", background: "none", border: "none", cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e2235", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 15, color: "#f0f2f5", fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{sub}</div>}
      </div>
      {right ?? (onClick && (
        <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>
      ))}
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", padding: "20px 16px 8px", textTransform: "uppercase" }}>
      {label}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ margin: "0 16px", background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#2a2f42", margin: "0 16px" }} />;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MoreScreen() {
  const [section, setSection]         = useState<Section>("main");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [lang, setLang]               = useState<Lang>("ja");
  const t = I18N[lang];

  const maxPrice = Math.max(...PREDICTION.map(d => d.price));
  const minPrice = Math.min(...PREDICTION.map(d => d.price));
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  // ── Language sub-page ─────────────────────────────────────────────────────
  if (section === "language") {
    return (
      <div style={{ height: "100%", background: "#0f1117", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 16px 12px" }}>
          <button onClick={() => setSection("main")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 22, height: 22 }}><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", margin: 0 }}>{t.selectLanguage}</h2>
        </div>
        <Card>
          {LANG_OPTIONS.map((opt, i) => {
            const isSelected = lang === opt.code;
            return (
              <button key={opt.code}
                onClick={() => { setLang(opt.code); setSection("main"); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14,
                  padding: "15px 18px", background: isSelected ? "rgba(34,197,94,0.07)" : "none",
                  border: "none", cursor: "pointer",
                  borderBottom: i < LANG_OPTIONS.length - 1 ? "1px solid #2a2f42" : "none",
                }}
              >
                <span style={{ fontSize: 26 }}>{opt.flag}</span>
                <span style={{ flex: 1, fontSize: 16, color: isSelected ? "#22c55e" : "#f0f2f5", fontWeight: isSelected ? 700 : 500, textAlign: "left" }}>
                  {opt.nativeName}
                </span>
                {isSelected && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" style={{ width: 18, height: 18 }}>
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
            );
          })}
        </Card>
        <div style={{ height: 48 }} />
      </div>
    );
  }

  // ── Notifications sub-page ────────────────────────────────────────────────
  if (section === "notifications") {
    return (
      <div style={{ height: "100%", background: "#0f1117", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 16px 12px" }}>
          <button onClick={() => setSection("main")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 22, height: 22 }}><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", margin: 0 }}>{t.notifications}</h2>
        </div>
        <Card>
          {NOTIFICATIONS.map((n, i) => (
            <div key={n.id} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "14px 16px", opacity: n.read ? 0.55 : 1,
              borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #2a2f42" : "none",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${n.color}1a`, border: `1.5px solid ${n.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={n.color} strokeWidth="2" style={{ width: 16, height: 16 }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#f0f2f5", lineHeight: 1.5 }}>{n.text}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, marginTop: 5 }} />}
            </div>
          ))}
        </Card>
        <div style={{ height: 48 }} />
      </div>
    );
  }

  // ── Points sub-page ──────────────────────────────────────────────────────
  if (section === "points") {
    const progressPct = Math.min((MOCK_POINTS / 500) * 100, 100);
    return (
      <div style={{ height: "100%", background: "#0f1117", overflowY: "auto" }}>
        {/* Back header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 16px 12px" }}>
          <button onClick={() => setSection("main")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: 4 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 22, height: 22 }}><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", margin: 0 }}>ポイント交換（予定）</h2>
        </div>

        {/* Current points hero card */}
        <div style={{ margin: "0 16px 20px" }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1d27 0%, #1e2235 100%)",
            borderRadius: 20, padding: "24px 22px", border: "1px solid #2a2f42",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative ring */}
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }} />
            <div style={{ position: "absolute", top: -10, right: -10, width: 70, height: 70, borderRadius: "50%", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.18)" }} />

            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6 }}>保有ポイント</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 48, fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>{MOCK_POINTS}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#22c55e", marginBottom: 6 }}>pt</span>
            </div>

            {/* Progress to next reward */}
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>次の特典まで：{500 - MOCK_POINTS}pt</div>
            <div style={{ height: 6, borderRadius: 999, background: "#2a2f42", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: 999, transition: "width 0.4s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 10, color: "#4b5563" }}>0pt</span>
              <span style={{ fontSize: 10, color: "#4b5563" }}>500pt</span>
            </div>
          </div>
        </div>

        {/* Development notice banner */}
        <div style={{ margin: "0 16px 20px", background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.28)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 3 }}>現在ポイント交換機能は開発中です</div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
              今後、ガソリン割引・クーポン・ギフト交換などに対応予定です。
            </div>
          </div>
        </div>

        {/* Reward cards */}
        <div style={{ padding: "0 16px 4px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>交換できる特典（予定）</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {REWARD_CARDS.map((r) => {
              const canRedeem = MOCK_POINTS >= r.pts;
              return (
                <div key={r.id} style={{
                  background: r.bg, border: `1px solid ${r.border}`,
                  borderRadius: 16, padding: "16px 16px", display: "flex", alignItems: "center", gap: 14,
                  opacity: canRedeem ? 1 : 0.6,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: `${r.color}18`, border: `1.5px solid ${r.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: r.color,
                  }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f2f5", marginBottom: 3 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>{r.desc}</div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.pts.toLocaleString()}pt</span>
                      {canRedeem
                        ? <span style={{ fontSize: 10, color: r.color, background: `${r.color}18`, border: `1px solid ${r.border}`, borderRadius: 999, padding: "1px 7px", fontWeight: 600 }}>交換可能</span>
                        : <span style={{ fontSize: 10, color: "#4b5563" }}>あと{(r.pts - MOCK_POINTS).toLocaleString()}pt</span>
                      }
                    </div>
                  </div>
                  <button style={{
                    padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "none", cursor: "not-allowed",
                    background: canRedeem ? r.color : "#2a2f42",
                    color: canRedeem ? "#0f1117" : "#4b5563",
                    flexShrink: 0,
                  }}>
                    交換
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Point history */}
        <div style={{ padding: "20px 16px 4px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>ポイント履歴</div>
          <div style={{ background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", overflow: "hidden" }}>
            {POINT_HISTORY.map((h, i) => {
              const isPost = h.icon === "post";
              const accentColor = isPost ? "#22c55e" : "#f59e0b";
              return (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                  borderBottom: i < POINT_HISTORY.length - 1 ? "1px solid #2a2f42" : "none",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `${accentColor}18`, border: `1.5px solid ${accentColor}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: accentColor,
                  }}>
                    {isPost ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "#f0f2f5", fontWeight: 500 }}>{h.label}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{h.time}</div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: accentColor }}>+{h.delta}pt</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 48 }} />
      </div>
    );
  }

  // ── Main section ──────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100%", background: "#0f1117", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 0" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f0f2f5", margin: 0 }}>{t.title}</h1>
      </div>

      {/* Profile */}
      <div style={{ padding: "14px 16px 0" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0 }}>G</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f2f5" }}>{t.guest}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{t.notLoggedIn}</div>
            </div>
            <button style={{ padding: "8px 16px", borderRadius: 999, background: "#22c55e", color: "#0f1117", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>{t.login}</button>
          </div>
          {/* Points summary strip */}
          <div style={{ borderTop: "1px solid #2a2f42", margin: "0 16px" }} />
          <button onClick={() => setSection("points")} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "13px 18px", background: "none", border: "none", cursor: "pointer",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 14, color: "#f0f2f5", fontWeight: 600 }}>ポイント</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>ポイント交換・履歴を見る</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#22c55e" }}>{MOCK_POINTS}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", marginRight: 2 }}>pt</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </button>
        </Card>
      </div>

      {/* AI Prediction */}
      <SectionHeader label={t.aiTitle} />
      <Card>
        <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.06)", borderBottom: "1px solid #2a2f42", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f2f5" }}>{t.aiLabel}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{t.aiSub}</div>
          </div>
        </div>
        <div style={{ padding: "16px 16px 12px" }}>
          {/* Bar chart */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 80, marginBottom: 10 }}>
            {PREDICTION.map((d, i) => {
              const pct = 20 + ((d.price - minPrice) / Math.max(maxPrice - minPrice, 1)) * 72;
              const color = d.change > 0 ? "#ef4444" : d.change < 0 ? "#22c55e" : "#3b82f6";
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color }}>¥{d.price}</div>
                  <div style={{ width: "100%", borderRadius: "5px 5px 0 0", background: `${color}28`, border: `1px solid ${color}55`, height: `${pct}%` }} />
                </div>
              );
            })}
          </div>
          {/* Labels row */}
          <div style={{ display: "flex", gap: 10 }}>
            {PREDICTION.map((d, i) => {
              const color = d.change > 0 ? "#ef4444" : d.change < 0 ? "#22c55e" : "#3b82f6";
              return (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{t.weeks[i]}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>
                    {d.change > 0 ? `+${d.change}` : d.change < 0 ? `${d.change}` : "±0"}円
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "8px 16px 12px", borderTop: "1px solid #2a2f42" }}>
          <p style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{t.aiDisclaimer}</p>
        </div>
      </Card>

      {/* Notifications */}
      <SectionHeader label={t.notifications} />
      <Card>
        <SettingsRow
          onClick={() => setSection("notifications")}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
          label={t.notifCenter}
          sub={t.unread(unreadCount)}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0f1117" }}>{unreadCount}</div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}><path d="M9 18l6-6-6-6"/></svg>
            </div>
          }
        />
        <Divider />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e2235", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><circle cx="18" cy="5" r="3" fill="#22c55e" stroke="none"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: "#f0f2f5", fontWeight: 500 }}>{t.priceAlert}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{t.priceAlertSub}</div>
          </div>
          <button onClick={() => setNotifEnabled(!notifEnabled)} style={{ width: 46, height: 26, borderRadius: 999, background: notifEnabled ? "#22c55e" : "#2a2f42", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: notifEnabled ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </button>
        </div>
      </Card>

      {/* News */}
      <SectionHeader label={t.news} />
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {NEWS.map((n) => {
          const title = lang === "en" ? n.titleEn : lang === "zh" ? n.titleZh : n.title;
          return (
            <div key={n.id} style={{ background: "#1a1d27", borderRadius: 14, padding: "14px 16px", border: "1px solid #2a2f42", display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: `${n.tagColor}20`, color: n.tagColor, fontWeight: 700 }}>{n.tag}</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{n.source}</span>
                  <span style={{ fontSize: 11, color: "#4b5563" }}>·</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{n.time}</span>
                </div>
                <div style={{ fontSize: 14, color: "#f0f2f5", lineHeight: 1.55, fontWeight: 500 }}>{title}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}><path d="M9 18l6-6-6-6"/></svg>
            </div>
          );
        })}
      </div>

      {/* Settings */}
      <SectionHeader label={t.settings} />
      <Card>
        <SettingsRow
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>}
          label={t.region}
          sub={t.regionVal}
          onClick={() => {}}
        />
        <Divider />
        {/* Language row */}
        <SettingsRow
          onClick={() => setSection("language")}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
          label={t.language}
          sub={t.languageVal}
        />
        <Divider />
        <SettingsRow
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          label={t.about}
          sub={t.aboutVal}
          onClick={() => {}}
        />
      </Card>

      <div style={{ height: 56 }} />
    </div>
  );
}
