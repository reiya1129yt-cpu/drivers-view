"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GuestProfile {
  nickname: string;
  prefecture: string;
}

interface AuthModalProps {
  onClose: () => void;
  onGuestContinue: (profile: GuestProfile) => void;
  onAuthSuccess: () => void;
}

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

type Mode = "choose" | "login" | "signup" | "guest";

export default function AuthModal({ onClose, onGuestContinue, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usePhone, setUsePhone] = useState(false);

  const supabase = createClient();

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      onAuthSuccess();
    } catch (e: any) {
      setError(e.message ?? "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    setError("");
    if (!nickname.trim()) { setError("ニックネームを入力してください"); return; }
    if (!prefecture) { setError("都道府県を選択してください"); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname: nickname.trim(), prefecture } },
      });
      if (err) throw err;
      onAuthSuccess();
    } catch (e: any) {
      setError(e.message ?? "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handleGuestContinue() {
    setError("");
    if (!nickname.trim()) { setError("ニックネームを入力してください"); return; }
    if (!prefecture) { setError("都道府県を選択してください"); return; }
    onGuestContinue({ nickname: nickname.trim(), prefecture });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#22263a", border: "1.5px solid #2a2f42",
    borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#f0f2f5",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" };
  const btnPrimary: React.CSSProperties = {
    width: "100%", padding: "14px", borderRadius: 12, background: "#22c55e",
    color: "#0f1117", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer",
  };
  const btnSecondary: React.CSSProperties = {
    width: "100%", padding: "14px", borderRadius: 12, background: "#1e2235",
    color: "#9ca3af", fontWeight: 600, fontSize: 15, border: "1px solid #2a2f42", cursor: "pointer",
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      {/* Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, background: "#161924", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", boxSizing: "border-box" }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "#2a2f42", margin: "0 auto 20px" }} />

        {/* ── CHOOSE ── */}
        {mode === "choose" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5" }}>ようこそ</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
                ログインまたはゲストで続けてください
              </div>
            </div>
            <button onClick={() => setMode("login")} style={btnPrimary}>ログイン</button>
            <button onClick={() => setMode("signup")} style={{ ...btnSecondary, color: "#f0f2f5", borderColor: "#3b82f6", background: "rgba(59,130,246,0.08)" }}>
              新規登録
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "#2a2f42" }} />
              <span style={{ fontSize: 12, color: "#4b5563" }}>または</span>
              <div style={{ flex: 1, height: 1, background: "#2a2f42" }} />
            </div>
            <button onClick={() => setMode("guest")} style={btnSecondary}>ゲストで続ける</button>
          </div>
        )}

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button onClick={() => setMode("choose")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textAlign: "left", fontSize: 13, padding: 0, marginBottom: 4 }}>
              ← 戻る
            </button>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", marginBottom: 4 }}>ログイン</div>
            <div>
              <label style={labelStyle}>メールアドレス</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>パスワード</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div style={{ fontSize: 13, color: "#ef4444" }}>{error}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
              {loading ? "ログイン中..." : "ログイン"}
            </button>
            <button onClick={() => setMode("signup")} style={{ ...btnSecondary, fontSize: 13 }}>
              アカウントをお持ちでない方 → 新規登録
            </button>
          </div>
        )}

        {/* ── SIGNUP ── */}
        {mode === "signup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button onClick={() => setMode("choose")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textAlign: "left", fontSize: 13, padding: 0, marginBottom: 4 }}>
              ← 戻る
            </button>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", marginBottom: 4 }}>新規登録</div>
            <div>
              <label style={labelStyle}>ニックネーム</label>
              <input style={inputStyle} type="text" placeholder="ドライバー太郎" value={nickname} onChange={e => setNickname(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>都道府県</label>
              <select style={{ ...inputStyle }} value={prefecture} onChange={e => setPrefecture(e.target.value)}>
                <option value="">選択してください</option>
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>メールアドレス</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>パスワード（6文字以上）</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div style={{ fontSize: 13, color: "#ef4444" }}>{error}</div>}
            <button onClick={handleSignup} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
              {loading ? "登録中..." : "アカウント作成"}
            </button>
            <button onClick={() => setMode("login")} style={{ ...btnSecondary, fontSize: 13 }}>
              すでにアカウントをお持ちの方 → ログイン
            </button>
          </div>
        )}

        {/* ── GUEST ── */}
        {mode === "guest" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button onClick={() => setMode("choose")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", textAlign: "left", fontSize: 13, padding: 0, marginBottom: 4 }}>
              ← 戻る
            </button>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", marginBottom: 2 }}>ゲストで続ける</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>ガソリン価格の投稿のみ可能です</div>
            <div>
              <label style={labelStyle}>ニックネーム</label>
              <input style={inputStyle} type="text" placeholder="ドライバー太郎" value={nickname} onChange={e => setNickname(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>都道府県</label>
              <select style={{ ...inputStyle }} value={prefecture} onChange={e => setPrefecture(e.target.value)}>
                <option value="">選択してください</option>
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {error && <div style={{ fontSize: 13, color: "#ef4444" }}>{error}</div>}
            <button onClick={handleGuestContinue} style={btnPrimary}>続ける</button>
            <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, marginBottom: 4 }}>ゲストでできること</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7 }}>✓ ガソリン価格の投稿</div>
              <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.7 }}>✗ コメント・お気に入り・クルマ投稿</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
