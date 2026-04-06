"use client";

interface LoginGateProps {
  onLogin: () => void;
  message?: string;
  compact?: boolean;
}

export default function LoginGate({
  onLogin,
  message = "この機能はログインが必要です",
  compact = false,
}: LoginGateProps) {
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{ flex: 1, fontSize: 13, color: "#93c5fd" }}>{message}</span>
        <button
          onClick={onLogin}
          style={{ padding: "6px 14px", borderRadius: 999, background: "#3b82f6", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", flexShrink: 0 }}
        >
          ログイン
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "28px 20px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1.5px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" style={{ width: 26, height: 26 }}>
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f2f5", marginBottom: 6 }}>{message}</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>アカウントを作成して全機能をご利用ください</div>
      </div>
      <button
        onClick={onLogin}
        style={{ padding: "12px 28px", borderRadius: 12, background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
      >
        ログイン / 新規登録
      </button>
    </div>
  );
}
