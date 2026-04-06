"use client";

import { useEffect, useState } from "react";

interface Props {
  onLogin: () => void;
  onDismiss: () => void;
}

const BENEFITS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: "コメント機能",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    label: "お気に入り登録",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    label: "価格アラート通知",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    label: "AI価格予測",
  },
];

const SESSION_KEY = "guest_promo_shown";

export default function GuestLoginPromo({ onLogin, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show once per session, with a short delay to not interrupt initial load
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  function handleDismiss() {
    setVisible(false);
    onDismiss();
  }

  function handleLogin() {
    setVisible(false);
    onLogin();
  }

  if (!visible) return null;

  return (
    /* Backdrop */
    <div
      onClick={handleDismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 0 0",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "#161922",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 36px",
          border: "1px solid #2a2f42",
          animation: "slideUp 0.25s ease",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          aria-label="閉じる"
          style={{
            position: "absolute", top: 16, right: 16,
            background: "#1e2235", border: "1px solid #2a2f42",
            borderRadius: "50%", width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6b7280",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ width: 14, height: 14 }}>
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{ width: 26, height: 26 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        {/* Heading */}
        <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f2f5", marginBottom: 6 }}>
          ログインすると使える機能
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>
          アカウントを作成して、より便利にドライバーズビューをお使いください。
        </div>

        {/* Benefits list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {BENEFITS.map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#22c55e",
              }}>
                {b.icon}
              </div>
              <span style={{ fontSize: 15, color: "#e5e7eb", fontWeight: 500 }}>{b.label}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15, marginLeft: "auto", flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "15px",
            borderRadius: 14, background: "#22c55e",
            color: "#0f1117", fontWeight: 800, fontSize: 16,
            border: "none", cursor: "pointer",
            marginBottom: 10,
          }}
        >
          ログイン / 登録する
        </button>
        <button
          onClick={handleDismiss}
          style={{
            width: "100%", padding: "13px",
            borderRadius: 14, background: "transparent",
            color: "#6b7280", fontWeight: 600, fontSize: 14,
            border: "none", cursor: "pointer",
          }}
        >
          今はしない
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
