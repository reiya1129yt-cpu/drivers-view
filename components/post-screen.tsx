"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import type { FuelType, GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

const CAR_CATEGORIES = [
  { id: "car_life",    label: "カーライフ",   color: "#a78bfa" },
  { id: "maintenance", label: "メンテナンス",  color: "#f59e0b" },
  { id: "driving",     label: "ドライブ",      color: "#22c55e" },
  { id: "question",    label: "質問",           color: "#3b82f6" },
  { id: "custom",      label: "カスタム",       color: "#f472b6" },
];

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return `${Math.floor(diff / 86400)}日前`;
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},55%,42%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {name.slice(0, 1)}
    </div>
  );
}

// ── Inline comment section ────────────────────────────────────────────────────

function CommentSection({ postId }: { postId: string }) {
  const [open, setOpen]     = useState(false);
  const [text, setText]     = useState("");
  const [comments, setComments] = useState<{ id: string; author: string; text: string; at: string }[]>([]);

  const handleAdd = () => {
    const t = text.trim();
    if (!t) return;
    setComments((prev) => [...prev, { id: Date.now().toString(), author: "あなた", text: t, at: new Date().toISOString() }]);
    setText("");
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "none", color: "#6b7280", fontSize: 12, fontWeight: 600,
        cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 5,
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        コメント{comments.length > 0 ? ` (${comments.length})` : ""}
      </button>

      {open && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Avatar name={c.author} size={28} />
              <div style={{ flex: 1, background: "#22263a", borderRadius: 10, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, color: "#9ca3af" }}>{c.author}</span>
                  {" · "}{timeAgo(c.at)}
                </div>
                <div style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.5 }}>{c.text}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="コメントを追加..."
              style={{
                flex: 1, background: "#22263a", border: "1px solid #2a2f42", borderRadius: 10,
                padding: "8px 12px", fontSize: 13, color: "#f0f2f5", outline: "none",
              }}
            />
            <button onClick={handleAdd} style={{
              background: "#22c55e", border: "none", borderRadius: 8,
              padding: "8px 12px", color: "#0f1117", fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Post cards ────────────────────────────────────────────────────────────────

function GasPricePostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const color = FUEL_TYPE_COLORS[post.fuel_type as FuelType] ?? "#22c55e";
  const bg    = FUEL_TYPE_BG[post.fuel_type as FuelType]     ?? "rgba(34,197,94,0.15)";
  const label = FUEL_TYPE_LABELS[post.fuel_type as FuelType] ?? "";

  return (
    <div style={{ background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Avatar name={post.author_name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f2f5" }}>{post.author_name}</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{timeAgo(post.created_at)}</span>
          </div>
          {post.station_name && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{post.station_name}</div>
          )}
        </div>
        {post.price && (
          <div style={{ background: bg, border: `1.5px solid ${color}`, borderRadius: 12, padding: "6px 12px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>¥{Number(post.price).toFixed(0)}</div>
            <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>{label} /L</div>
          </div>
        )}
      </div>

      <p style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{post.content}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 6, borderTop: "1px solid #1e2235" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
          価格情報
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setLiked(!liked)} style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
          cursor: "pointer", color: liked ? "#f87171" : "#6b7280", fontSize: 12, padding: "4px 6px",
        }}>
          <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes + (liked ? 1 : 0)}
        </button>
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
}

function CarPostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const cat = CAR_CATEGORIES.find((c) => c.id === post.car_category);
  const catColor = cat?.color ?? "#9ca3af";
  const catLabel = cat?.label ?? post.car_category;

  return (
    <div style={{ background: "#1a1d27", borderRadius: 16, border: "1px solid #2a2f42", padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Avatar name={post.author_name} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f2f5" }}>{post.author_name}</span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14, color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{post.content}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 6, borderTop: "1px solid #1e2235" }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${catColor}22`, color: catColor }}>
          {catLabel}
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setLiked(!liked)} style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
          cursor: "pointer", color: liked ? "#f87171" : "#6b7280", fontSize: 12, padding: "4px 6px",
        }}>
          <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes + (liked ? 1 : 0)}
        </button>
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
}

// ── Nearby station picker ─────────────────────────────────────────────────────

function StationPicker({
  stations,
  selected,
  onSelect,
}: {
  stations: GasStation[];
  selected: GasStation | null;
  onSelect: (s: GasStation | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          background: "#22263a", border: `1.5px solid ${selected ? "#22c55e55" : "#2a2f42"}`,
          borderRadius: 10, padding: "11px 14px", cursor: "pointer", textAlign: "left",
        }}
      >
        {selected ? (
          <>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: FUEL_TYPE_COLORS[selected.fuel_type], flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: 14, color: "#f0f2f5", fontWeight: 600 }}>{selected.station_name}</span>
            <span style={{ fontSize: 12, color: FUEL_TYPE_COLORS[selected.fuel_type] }}>
              ¥{selected.price}
            </span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(null); }} style={{
              background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
              <path d="M3 22V8l9-6 9 6v14" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ flex: 1, fontSize: 14, color: "#6b7280" }}>近くのスタンドを選択</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round"/>
            </svg>
          </>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
          background: "#22263a", border: "1px solid #2a2f42", borderRadius: 12,
          maxHeight: 220, overflowY: "auto",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {stations.length === 0 && (
            <div style={{ padding: "14px 16px", color: "#6b7280", fontSize: 13 }}>
              近くのスタンドが見つかりません
            </div>
          )}
          {stations.map((s) => {
            const color = FUEL_TYPE_COLORS[s.fuel_type];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onSelect(s); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "11px 14px", background: "none", border: "none",
                  borderBottom: "1px solid #2a2f42", cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: "#f0f2f5" }}>{s.station_name}</span>
                <span style={{ fontSize: 12, color, fontWeight: 700 }}>¥{s.price}</span>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{FUEL_TYPE_LABELS[s.fuel_type]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Gas price post modal ──────────────────────────────────────────────────────

const DUPE_KEY = "dv_last_post";

function GasPricePostModal({
  onClose,
  onSubmitted,
  nearbyStations,
}: {
  onClose: () => void;
  onSubmitted: () => void;
  nearbyStations: GasStation[];
}) {
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [fuelType, setFuelType]   = useState<FuelType>("regular");
  const [price, setPrice]         = useState("");
  const [content, setContent]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [dupeWarning, setDupeWarning] = useState("");

  const fuelTypes: FuelType[] = ["regular", "high_octane", "diesel", "ev_charging"];

  // Check 12h duplicate protection
  const checkDupe = useCallback((stationId: string) => {
    try {
      const raw = localStorage.getItem(DUPE_KEY);
      if (!raw) return false;
      const map: Record<string, number> = JSON.parse(raw);
      const last = map[stationId];
      if (!last) return false;
      return Date.now() - last < 12 * 60 * 60 * 1000;
    } catch { return false; }
  }, []);

  const recordPost = useCallback((stationId: string) => {
    try {
      const raw = localStorage.getItem(DUPE_KEY) ?? "{}";
      const map: Record<string, number> = JSON.parse(raw);
      map[stationId] = Date.now();
      localStorage.setItem(DUPE_KEY, JSON.stringify(map));
    } catch {}
  }, []);

  const handleStationSelect = (s: GasStation | null) => {
    setSelectedStation(s);
    setDupeWarning("");
    if (s) {
      setFuelType(s.fuel_type);
      setPrice(String(s.price));
      if (checkDupe(s.id)) {
        setDupeWarning("このガソリンスタンドは直近12時間以内に投稿があります");
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) { setError("投稿内容を入力してください"); return; }
    if (selectedStation && checkDupe(selectedStation.id)) {
      setError("このガソリンスタンドは直近12時間以内に投稿があります");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type: "gas_price",
          content: content.trim(),
          fuel_type: fuelType,
          price: price ? parseFloat(price) : null,
          station_name: selectedStation?.station_name ?? "",
          station_id: selectedStation?.id ?? null,
        }),
      });
      if (!res.ok) throw new Error("failed");
      if (selectedStation) recordPost(selectedStation.id);
      onSubmitted();
    } catch {
      setError("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f2f5", flex: 1 }}>価格情報を投稿</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Nearby station picker */}
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>スタンドを選択（近く）</div>
        <StationPicker stations={nearbyStations} selected={selectedStation} onSelect={handleStationSelect} />
        {dupeWarning && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
            </svg>
            {dupeWarning}
          </div>
        )}
      </div>

      {/* Fuel type selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {fuelTypes.map((ft) => {
          const active = fuelType === ft;
          const color  = FUEL_TYPE_COLORS[ft];
          return (
            <button key={ft} type="button" onClick={() => setFuelType(ft)} style={{
              flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer",
              border: `2px solid ${active ? color : "#2a2f42"}`,
              background: active ? `${color}22` : "#22263a",
              color: active ? color : "#6b7280",
            }}>{FUEL_TYPE_LABELS[ft]}</button>
          );
        })}
      </div>

      {/* Price */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: 700, fontSize: 16 }}>¥</span>
        <input
          type="number" inputMode="numeric"
          value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder="価格 /L"
          style={{ background: "#22263a", border: "1px solid #2a2f42", borderRadius: 10, padding: "11px 14px 11px 30px", fontSize: 14, color: "#f0f2f5", outline: "none", width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* Content */}
      <textarea
        value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="例：セルフで安い！カード払いOK"
        rows={3}
        style={{ background: "#22263a", border: "1px solid #2a2f42", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#f0f2f5", outline: "none", resize: "none", lineHeight: 1.6, width: "100%", boxSizing: "border-box" }}
      />

      {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={submitting} style={{
        padding: "14px", borderRadius: 12,
        background: submitting ? "#166534" : "#22c55e",
        color: submitting ? "#4ade80" : "#0f1117",
        fontWeight: 700, fontSize: 15, border: "none", cursor: submitting ? "not-allowed" : "pointer",
      }}>
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </div>
  );
}

// ── Car post modal ────────────────────────────────────────────────────────────

function CarPostModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [content, setContent]   = useState("");
  const [category, setCategory] = useState("car_life");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) { setError("投稿内容を入力してください"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_type: "car", content: content.trim(), car_category: category }),
      });
      if (!res.ok) throw new Error("failed");
      onSubmitted();
    } catch {
      setError("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f2f5", flex: 1 }}>車の話題を投稿</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {CAR_CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} style={{
              padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${active ? cat.color : "#2a2f42"}`,
              background: active ? `${cat.color}22` : "#22263a",
              color: active ? cat.color : "#6b7280",
            }}>{cat.label}</button>
          );
        })}
      </div>

      <textarea
        value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="クルマについて自由に投稿しよう"
        rows={5}
        style={{ background: "#22263a", border: "1px solid #2a2f42", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#f0f2f5", outline: "none", resize: "none", lineHeight: 1.6, width: "100%", boxSizing: "border-box" }}
      />

      {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={submitting} style={{
        padding: "14px", borderRadius: 12,
        background: submitting ? "#1e1b4b" : "#a78bfa",
        color: submitting ? "#a78bfa" : "#0f1117",
        fontWeight: 700, fontSize: 15, border: "none", cursor: submitting ? "not-allowed" : "pointer",
      }}>
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

type ModalType = "none" | "choose" | "gas" | "car";
type FeedFilter = "all" | "gas_price" | "car";
type SearchCategory = "station" | "author" | "pasa";

interface PostScreenProps {
  userLocation?: { lat: number; lng: number } | null;
  nearbyStations?: GasStation[];
}

export default function PostScreen({ userLocation: _userLocation, nearbyStations = [] }: PostScreenProps) {
  const [modal, setModal]         = useState<ModalType>("none");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<SearchCategory>("station");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR("/api/community-posts", fetcher, { refreshInterval: 30000 });
  const posts: any[] = data?.posts || [];
  const isLoggedIn: boolean = data?.isLoggedIn || false;

  const handleSubmitted = async () => { setModal("none"); await mutate(); };

  const FILTERS: { id: FeedFilter; label: string }[] = [
    { id: "all",       label: "すべて" },
    { id: "gas_price", label: "価格情報" },
    { id: "car",       label: "クルマ" },
  ];

  const SEARCH_CATS: { id: SearchCategory; label: string }[] = [
    { id: "station", label: "スタンド名" },
    { id: "author",  label: "投稿者名" },
    { id: "pasa",    label: "PA / SA" },
  ];

  const visiblePosts = useMemo(() => {
    let base = feedFilter === "all" ? posts : posts.filter((p: any) => p.post_type === feedFilter);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    if (searchCategory === "station") base = base.filter((p: any) => p.station_name?.toLowerCase().includes(q));
    if (searchCategory === "author")  base = base.filter((p: any) => p.author_name?.toLowerCase().includes(q));
    if (searchCategory === "pasa")    base = base.filter((p: any) => p.station_name?.toLowerCase().includes("pa") || p.station_name?.toLowerCase().includes("sa") || p.content?.toLowerCase().includes(q));
    return base;
  }, [posts, feedFilter, searchQuery, searchCategory]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0f1117", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 0", background: "#0f1117", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f0f2f5", margin: 0, flex: 1 }}>投稿</h1>
          <button onClick={() => { setSearchOpen(!searchOpen); }} style={{
            width: 36, height: 36, borderRadius: 9, background: "#1e2235",
            border: `1.5px solid ${searchOpen ? "#22c55e" : "#2a2f42"}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <svg width="15" height="15" fill="none" stroke={searchOpen ? "#22c55e" : "#9ca3af"} strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {SEARCH_CATS.map((c) => (
                <button key={c.id} onClick={() => setSearchCategory(c.id)} style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${searchCategory === c.id ? "#22c55e" : "#2a2f42"}`,
                  background: searchCategory === c.id ? "#22c55e22" : "#1a1d27",
                  color: searchCategory === c.id ? "#22c55e" : "#6b7280",
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#1e2235", border: "1.5px solid #2a2f42", borderRadius: 10, padding: "8px 12px" }}>
              <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${SEARCH_CATS.find(c => c.id === searchCategory)?.label}で検索...`}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f0f2f5", fontSize: 13, caretColor: "#22c55e" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0 }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feed filter tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #2a2f42" }}>
          {FILTERS.map((f) => {
            const active = feedFilter === f.id;
            return (
              <button key={f.id} onClick={() => setFeedFilter(f.id)} style={{
                flex: 1, padding: "10px 4px", background: "none", border: "none",
                borderBottom: `2px solid ${active ? "#22c55e" : "transparent"}`,
                color: active ? "#22c55e" : "#6b7280",
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
              }}>{f.label}</button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {visiblePosts.length === 0 && (
          <div style={{ textAlign: "center", color: "#6b7280", padding: "40px 0", fontSize: 14 }}>
            {searchQuery ? "検索結果なし" : "投稿がありません"}
          </div>
        )}

        {visiblePosts.map((post: any) =>
          post.post_type === "gas_price" ? (
            <GasPricePostCard key={post.id} post={post} />
          ) : (
            <CarPostCard key={post.id} post={post} />
          )
        )}

        {!isLoggedIn && feedFilter !== "gas_price" && (
          <div style={{ background: "#1a1d27", border: "1px dashed #2a2f42", borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" style={{ width: 40, height: 40, margin: "0 auto 8px" }}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f2f5", marginBottom: 6 }}>クルマコミュニティ</div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>
              車の話題はログイン後に閲覧できます
            </div>
            <button style={{ padding: "10px 24px", borderRadius: 999, background: "#a78bfa", color: "#0f1117", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
              ログイン / 登録する
            </button>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setModal("choose")}
        style={{
          position: "absolute", bottom: 20, right: 20,
          width: 56, height: 56, borderRadius: "50%",
          background: "#22c55e", border: "none",
          boxShadow: "0 4px 20px rgba(34,197,94,0.5)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
        }}
        aria-label="新規投稿"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#0f1117" strokeWidth="2.5" strokeLinecap="round" style={{ width: 24, height: 24 }}>
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      {/* Backdrop */}
      {modal !== "none" && (
        <div onClick={() => setModal("none")} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 20, backdropFilter: "blur(4px)" }} />
      )}

      {/* Choose type sheet */}
      {modal === "choose" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#1a1d27", borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", zIndex: 30, border: "1px solid #2a2f42" }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f2f5", marginBottom: 20, textAlign: "center" }}>投稿タイプを選択</div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setModal("gas")} style={{ flex: 1, padding: "20px 12px", borderRadius: 16, background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ width: 32, height: 32 }}>
                <path d="M3 22V8l9-6 9 6v14"/><path d="M9 22V12h6v10"/><path d="M21 10h2v4h-2"/><path d="M19 10v3a2 2 0 0 0 2 2"/>
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>価格情報</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>ガソリン価格を共有</div>
              </div>
            </button>
            <button
              onClick={() => isLoggedIn ? setModal("car") : null}
              style={{ flex: 1, padding: "20px 12px", borderRadius: 16, background: isLoggedIn ? "rgba(167,139,250,0.1)" : "#22263a", border: `2px solid ${isLoggedIn ? "rgba(167,139,250,0.4)" : "#2a2f42"}`, cursor: isLoggedIn ? "pointer" : "not-allowed", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: isLoggedIn ? 1 : 0.6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={isLoggedIn ? "#a78bfa" : "#6b7280"} strokeWidth="2" style={{ width: 32, height: 32 }}>
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <path d="M12 14h5"/><path d="M12 17h3"/>
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isLoggedIn ? "#a78bfa" : "#6b7280" }}>クルマ投稿</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{isLoggedIn ? "車の話題を共有" : "ログインが必要"}</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Gas price modal */}
      {modal === "gas" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#1a1d27", borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", zIndex: 30, border: "1px solid #2a2f42", maxHeight: "92%", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}>
          <GasPricePostModal onClose={() => setModal("none")} onSubmitted={handleSubmitted} nearbyStations={nearbyStations} />
        </div>
      )}

      {/* Car modal */}
      {modal === "car" && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#1a1d27", borderRadius: "20px 20px 0 0", padding: "20px 20px 40px", zIndex: 30, border: "1px solid #2a2f42", maxHeight: "90%", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}>
          <CarPostModal onClose={() => setModal("none")} onSubmitted={handleSubmitted} />
        </div>
      )}
    </div>
  );
}
