"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import useSWR from "swr";
import type { FuelType, GasStation } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS, FUEL_TYPE_BG } from "@/lib/types";
import { FeedAdCard } from "@/components/ad-card";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};

const CAR_CATEGORIES = [
  { id: "car_life",    label: "カーライフ",  color: "#a78bfa" },
  { id: "maintenance", label: "メンテ",      color: "#f59e0b" },
  { id: "driving",     label: "ドライブ",    color: "#22c55e" },
  { id: "question",    label: "質問",        color: "#3b82f6" },
  { id: "custom",      label: "カスタム",    color: "#f472b6" },
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

// ── Comment section — gated behind login ─────────────────────────────────────

function CommentSection({ postId, isLoggedIn }: { postId: string; isLoggedIn: boolean }) {
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

          {isLoggedIn ? (
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
              }}>送信</button>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#6b7280", padding: "6px 8px", background: "#12151f", borderRadius: 8, textAlign: "center" }}>
              コメントするにはログインが必要です
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Price display — member + regular ─────────────────────────────────────────

function PriceDisplay({ post, color }: { post: any; color: string }) {
  const hasMember  = post.price_member  != null;
  const hasRegular = post.price_regular != null;

  if (hasMember || hasRegular) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end", flexShrink: 0 }}>
        {hasMember && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>¥{Number(post.price_member).toFixed(0)}</span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>会員</span>
          </div>
        )}
        {hasRegular && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: hasMember ? 15 : 20, fontWeight: hasMember ? 600 : 800, color: hasMember ? "#9ca3af" : color, lineHeight: 1, textDecoration: hasMember ? "line-through" : "none" }}>
              ¥{Number(post.price_regular).toFixed(0)}
            </span>
            <span style={{ fontSize: 10, color: "#6b7280" }}>一般</span>
          </div>
        )}
      </div>
    );
  }

  if (!post.price) return null;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexShrink: 0 }}>
      <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>¥{Number(post.price).toFixed(0)}</span>
      <span style={{ fontSize: 11, color: "#9ca3af" }}>/L</span>
    </div>
  );
}

// ── Post cards ────────────────────────────────────────────────────────────────

function GasPricePostCard({ post, isLoggedIn }: { post: any; isLoggedIn: boolean }) {
  const [liked, setLiked] = useState(false);
  const color = FUEL_TYPE_COLORS[post.fuel_type as FuelType] ?? "#ef4444";
  const bg    = FUEL_TYPE_BG[post.fuel_type as FuelType]     ?? "rgba(239,68,68,0.12)";
  const label = FUEL_TYPE_LABELS[post.fuel_type as FuelType] ?? "";

  return (
    <div style={{
      background: "#141720",
      borderRadius: 16,
      border: "1px solid #1e2235",
      // Left accent bar in fuel-type color
      borderLeft: `4px solid ${color}`,
      padding: "14px 14px 12px 14px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Avatar name={post.author_name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f2f5" }}>{post.author_name}</span>
            <span style={{ fontSize: 11, color: "#4b5563" }}>{timeAgo(post.created_at)}</span>
          </div>
          {post.station_name && (
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
              {post.station_name}
            </div>
          )}
        </div>
        {/* Price badge */}
        <div style={{ background: bg, border: `1px solid ${color}55`, borderRadius: 12, padding: "8px 12px", textAlign: "right" }}>
          <PriceDisplay post={post} color={color} />
          <div style={{ fontSize: 9, color: "#6b7280", marginTop: 3 }}>{label}</div>
        </div>
      </div>

      {/* Facility row */}
      {(post.opening_hours || post.has_car_wash != null) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {post.opening_hours && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#9ca3af" }}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {post.opening_hours}
            </span>
          )}
          {post.has_car_wash === true && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, background: "#0ea5e922", color: "#38bdf8", border: "1px solid #0ea5e944", borderRadius: 999, padding: "2px 8px" }}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 12c0-4 8-8 8-8M4 12c0 4 8 8 8 8M20 12c0-4-8-8-8-8M20 12c0 4-8 8-8 8" strokeLinecap="round"/></svg>
              洗車機あり
            </span>
          )}
          {post.has_car_wash === false && (
            <span style={{ fontSize: 11, color: "#4b5563" }}>洗車機なし</span>
          )}
        </div>
      )}

      {/* Content */}
      {post.content && <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{post.content}</p>}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6, borderTop: "1px solid #1e2235" }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${color}18`, color }}>
          価格情報
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setLiked(!liked)} style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
          cursor: "pointer", color: liked ? "#f87171" : "#4b5563", fontSize: 12, padding: "4px 6px",
        }}>
          <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes + (liked ? 1 : 0)}
        </button>
      </div>

      <CommentSection postId={post.id} isLoggedIn={isLoggedIn} />
    </div>
  );
}

function CarPostCard({ post, isLoggedIn }: { post: any; isLoggedIn: boolean }) {
  const [liked, setLiked] = useState(false);
  const cat = CAR_CATEGORIES.find((c) => c.id === post.car_category);
  const catColor = cat?.color ?? "#9ca3af";
  const catLabel = cat?.label ?? post.car_category;

  return (
    <div style={{
      // Neutral dark slate — distinct from price cards
      background: "#111827",
      borderRadius: 16,
      border: "1px solid #1f2937",
      borderLeft: `4px solid ${catColor}`,
      padding: "14px 14px 12px 14px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Avatar name={post.author_name} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#f0f2f5" }}>{post.author_name}</span>
            <span style={{ fontSize: 11, color: "#4b5563" }}>{timeAgo(post.created_at)}</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
              {catLabel}
            </span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6, margin: 0 }}>{post.content}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6, borderTop: "1px solid #1f2937" }}>
        <div style={{ flex: 1 }} />
        <button onClick={() => setLiked(!liked)} style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
          cursor: "pointer", color: liked ? "#f87171" : "#4b5563", fontSize: 12, padding: "4px 6px",
        }}>
          <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes + (liked ? 1 : 0)}
        </button>
      </div>

      <CommentSection postId={post.id} isLoggedIn={isLoggedIn} />
    </div>
  );
}

// ── Nearby station picker ─────────────────────────────────────────────────────

function StationPicker({
  stations, selected, onSelect,
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
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: FUEL_TYPE_COLORS[selected.fuel_type], flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 14, color: "#f0f2f5", fontWeight: 600 }}>{selected.station_name}</span>
            <span style={{ fontSize: 12, color: FUEL_TYPE_COLORS[selected.fuel_type], fontWeight: 700 }}>¥{selected.price}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(null); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
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
          maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {stations.length === 0 && (
            <div style={{ padding: "14px 16px", color: "#6b7280", fontSize: 13 }}>近くのスタンドが見つかりません</div>
          )}
          {stations.map((s) => {
            const color = FUEL_TYPE_COLORS[s.fuel_type];
            return (
              <button
                key={s.id} type="button"
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
  onClose, onSubmitted, nearbyStations,
}: {
  onClose: () => void;
  onSubmitted: () => void;
  nearbyStations: GasStation[];
}) {
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [fuelType, setFuelType]         = useState<FuelType>("regular");
  const [priceMember, setPriceMember]   = useState("");
  const [priceRegular, setPriceRegular] = useState("");
  const [content, setContent]           = useState("");
  const [hasCarWash, setHasCarWash]     = useState<boolean | null>(null);
  const [openingHours, setOpeningHours] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState("");
  const [dupeWarning, setDupeWarning]   = useState("");

  const fuelTypes: FuelType[] = ["regular", "high_octane", "diesel", "ev_charging"];

  const checkDupe = useCallback((stationId: string) => {
    try {
      const map: Record<string, number> = JSON.parse(localStorage.getItem(DUPE_KEY) ?? "{}");
      const last = map[stationId];
      return !!last && Date.now() - last < 12 * 60 * 60 * 1000;
    } catch { return false; }
  }, []);

  const recordPost = useCallback((stationId: string) => {
    try {
      const map: Record<string, number> = JSON.parse(localStorage.getItem(DUPE_KEY) ?? "{}");
      map[stationId] = Date.now();
      localStorage.setItem(DUPE_KEY, JSON.stringify(map));
    } catch {}
  }, []);

  const handleStationSelect = (s: GasStation | null) => {
    setSelectedStation(s);
    setDupeWarning("");
    if (s) {
      setFuelType(s.fuel_type);
      setPriceRegular(String(s.price));
      if (s.has_car_wash != null) setHasCarWash(s.has_car_wash);
      if (s.opening_hours) setOpeningHours(s.opening_hours);
      if (checkDupe(s.id)) setDupeWarning("このスタンドは直近12時間以内に投稿があります");
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) { setError("投稿内容を入力してください"); return; }
    if (selectedStation && checkDupe(selectedStation.id)) {
      setError("このスタンドは直近12時間以内に投稿があります"); return;
    }
    setSubmitting(true); setError("");
    try {
      const priceVal = priceMember || priceRegular;
      const res = await fetch("/api/community-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type:     "gas_price",
          content:       content.trim(),
          fuel_type:     fuelType,
          price:         priceVal ? parseFloat(priceVal) : null,
          price_member:  priceMember  ? parseFloat(priceMember)  : null,
          price_regular: priceRegular ? parseFloat(priceRegular) : null,
          station_name:  selectedStation?.station_name ?? "",
          station_id:    selectedStation?.id ?? null,
          has_car_wash:  hasCarWash,
          opening_hours: openingHours.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("failed");
      if (selectedStation) recordPost(selectedStation.id);
      setSubmitted(true);
    } catch {
      setError("投稿に失敗しました。通信環境を確認してください。");
    } finally {
      setSubmitting(false);
    }
  };

  const color = FUEL_TYPE_COLORS[fuelType];

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "12px 0 8px", textAlign: "center" }}>
        {/* Checkmark ring */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", marginBottom: 6 }}>投稿完了！</div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
            情報を共有してくれてありがとう。<br />
            あなたの投稿が他のドライバーの役に立ちます。
          </div>
        </div>
        {/* Points awarded pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 999, padding: "8px 18px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>+5pt 獲得！</span>
        </div>
        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button
            onClick={onClose}
            style={{ padding: "14px", borderRadius: 12, background: "#22c55e", color: "#0f1117", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}
          >
            マップで見る
          </button>
          <button
            onClick={() => { setSubmitted(false); setContent(""); setPriceMember(""); setPriceRegular(""); setSelectedStation(null); setOpeningHours(""); setHasCarWash(null); setError(""); }}
            style={{ padding: "14px", borderRadius: 12, background: "#1e2235", color: "#9ca3af", fontWeight: 600, fontSize: 15, border: "1px solid #2a2f42", cursor: "pointer" }}
          >
            もう一度投稿
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#f0f2f5", flex: 1 }}>価格情報を投稿</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: 4 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Station picker */}
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>スタンドを選択（近く）</div>
        <StationPicker stations={nearbyStations} selected={selectedStation} onSelect={handleStationSelect} />
        {dupeWarning && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {dupeWarning}
          </div>
        )}
      </div>

      {/* Fuel type — color-coded buttons */}
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>燃料タイプ</div>
        <div style={{ display: "flex", gap: 6 }}>
          {fuelTypes.map((ft) => {
            const active = fuelType === ft;
            const c = FUEL_TYPE_COLORS[ft];
            return (
              <button key={ft} type="button" onClick={() => setFuelType(ft)} style={{
                flex: 1, padding: "9px 4px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `2px solid ${active ? c : "#2a2f42"}`,
                background: active ? `${c}22` : "#22263a",
                color: active ? c : "#6b7280",
              }}>{FUEL_TYPE_LABELS[ft]}</button>
            );
          })}
        </div>
      </div>

      {/* Member + Regular price inputs */}
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>価格</div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Member price */}
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: 700, fontSize: 14 }}>¥</span>
            <input
              type="number" inputMode="numeric"
              value={priceMember} onChange={(e) => setPriceMember(e.target.value)}
              placeholder="会員価格"
              style={{ background: "#22263a", border: `1.5px solid ${priceMember ? color + "88" : "#2a2f42"}`, borderRadius: 10, padding: "10px 10px 10px 26px", fontSize: 13, color: "#f0f2f5", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3, textAlign: "center" }}>会員 / カード</div>
          </div>
          {/* Regular price */}
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: 700, fontSize: 14 }}>¥</span>
            <input
              type="number" inputMode="numeric"
              value={priceRegular} onChange={(e) => setPriceRegular(e.target.value)}
              placeholder="一般価格"
              style={{ background: "#22263a", border: `1.5px solid ${priceRegular ? "#9ca3af88" : "#2a2f42"}`, borderRadius: 10, padding: "10px 10px 10px 26px", fontSize: 13, color: "#f0f2f5", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3, textAlign: "center" }}>一般</div>
          </div>
        </div>
      </div>

      {/* Facility info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>施設情報（任意）</div>

        {/* Opening hours */}
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5 }}>営業時間</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["24時間営業", ""].map((preset, i) => (
              <button
                key={i} type="button"
                onClick={() => setOpeningHours(preset)}
                style={{
                  padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${openingHours === preset && preset !== "" ? "#22c55e" : "#2a2f42"}`,
                  background: openingHours === preset && preset !== "" ? "#22c55e22" : "#22263a",
                  color: openingHours === preset && preset !== "" ? "#22c55e" : "#6b7280",
                  display: i === 0 ? "block" : "none",
                }}
              >
                24時間営業
              </button>
            ))}
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="例：7:00 - 22:00"
              style={{
                flex: 1, background: "#22263a", border: `1.5px solid ${openingHours ? "#22c55e55" : "#2a2f42"}`,
                borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f0f2f5", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Car wash */}
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5 }}>洗車機</div>
          <div style={{ display: "flex", gap: 6 }}>
            {([true, false, null] as const).map((val) => {
              const label = val === true ? "洗車機あり" : val === false ? "洗車機なし" : "不明";
              const activeColor = val === true ? "#38bdf8" : val === false ? "#9ca3af" : "#6b7280";
              const active = hasCarWash === val;
              return (
                <button
                  key={String(val)} type="button"
                  onClick={() => setHasCarWash(active ? null : val)}
                  style={{
                    flex: 1, padding: "8px 6px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${active ? activeColor : "#2a2f42"}`,
                    background: active ? `${activeColor}22` : "#22263a",
                    color: active ? activeColor : "#6b7280",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
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
        background: submitting ? "#166534" : color,
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
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) { setError("投稿内容を入力してください"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/community-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_type: "car", content: content.trim(), car_category: category }),
      });
      if (!res.ok) throw new Error("failed");
      setSubmitted(true);
    } catch {
      setError("投稿に失敗しました。通信環境を確認してください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "12px 0 8px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(167,139,250,0.12)", border: "2px solid rgba(167,139,250,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f2f5", marginBottom: 6 }}>投稿完了！</div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
            投稿が公開されました。<br />
            コミュニティのみんなで情報をシェアしよう。
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 999, padding: "8px 18px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>+5pt 獲得！</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button onClick={() => { onSubmitted(); }} style={{ padding: "14px", borderRadius: 12, background: "#a78bfa", color: "#0f1117", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
            投稿を見る
          </button>
          <button onClick={() => { setSubmitted(false); setContent(""); setError(""); }} style={{ padding: "14px", borderRadius: 12, background: "#1e2235", color: "#9ca3af", fontWeight: 600, fontSize: 15, border: "1px solid #2a2f42", cursor: "pointer" }}>
            もう一度投稿
          </button>
        </div>
      </div>
    );
  }

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

type ModalType  = "none" | "choose" | "gas" | "car";
type FeedFilter = "all" | "gas_price" | "car";
type SortMode   = "newest" | "most_liked" | "most_viewed";
type SearchCategory = "station" | "author" | "pasa";

interface PostScreenProps {
  userLocation?: { lat: number; lng: number } | null;
  nearbyStations?: GasStation[];
}

export default function PostScreen({ userLocation: _userLocation, nearbyStations = [] }: PostScreenProps) {
  const [modal, setModal]               = useState<ModalType>("none");
  const [feedFilter, setFeedFilter]     = useState<FeedFilter>("all");
  const [sortMode, setSortMode]         = useState<SortMode>("newest");
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchCategory, setSearchCategory] = useState<SearchCategory>("station");
  const [searchQuery, setSearchQuery]   = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, mutate, isLoading, error: swrError } = useSWR("/api/community-posts", fetcher, { refreshInterval: 30000 });
  const posts: any[]        = data?.posts     || [];
  const isLoggedIn: boolean = data?.isLoggedIn || false;

  const handleSubmitted = async () => { setModal("none"); await mutate(); };

  const FILTERS: { id: FeedFilter; label: string }[] = [
    { id: "all",       label: "すべて" },
    { id: "gas_price", label: "価格情報" },
    { id: "car",       label: "クルマ" },
  ];

  const SORT_OPTIONS: { id: SortMode; label: string }[] = [
    { id: "newest",      label: "新着" },
    { id: "most_liked",  label: "いいね" },
    { id: "most_viewed", label: "閲覧数" },
  ];

  const SEARCH_CATS: { id: SearchCategory; label: string }[] = [
    { id: "station", label: "スタンド名" },
    { id: "author",  label: "投稿者名" },
    { id: "pasa",    label: "PA / SA" },
  ];

  const visiblePosts = useMemo(() => {
    // Guest restrictions: hide car posts from non-logged-in users
    let base = posts.filter((p: any) => {
      if (p.post_type === "car" && !isLoggedIn) return false;
      if (feedFilter !== "all" && p.post_type !== feedFilter) return false;
      return true;
    });

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (searchCategory === "station") base = base.filter((p: any) => p.station_name?.toLowerCase().includes(q));
      else if (searchCategory === "author") base = base.filter((p: any) => p.author_name?.toLowerCase().includes(q));
      else if (searchCategory === "pasa") {
        // Guest cannot search PA/SA
        if (!isLoggedIn) base = [];
        else base = base.filter((p: any) => p.station_name?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q));
      }
    }

    // Sort
    if (sortMode === "most_liked")  base = [...base].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    else if (sortMode === "most_viewed") base = [...base].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    else base = [...base].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return base;
  }, [posts, feedFilter, searchQuery, searchCategory, sortMode, isLoggedIn]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0f1117", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "18px 16px 0", background: "#0f1117", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
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
          <div style={{ marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {SEARCH_CATS.map((c) => (
                <button key={c.id} onClick={() => setSearchCategory(c.id)} style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  border: `1.5px solid ${searchCategory === c.id ? "#22c55e" : "#2a2f42"}`,
                  background: searchCategory === c.id ? "#22c55e22" : "#1a1d27",
                  color: searchCategory === c.id ? "#22c55e" : "#6b7280",
                }}>{c.label}{c.id === "pasa" && !isLoggedIn ? " (要ログイン)" : ""}</button>
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
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>{f.label}</button>
            );
          })}
        </div>

        {/* Sort row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0 4px" }}>
          <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 600, marginRight: 2 }}>並び替え:</span>
          {SORT_OPTIONS.map((s) => {
            const active = sortMode === s.id;
            return (
              <button key={s.id} onClick={() => setSortMode(s.id)} style={{
                padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${active ? "#22c55e" : "#1e2235"}`,
                background: active ? "#22c55e22" : "transparent",
                color: active ? "#22c55e" : "#4b5563",
              }}>{s.label}</button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "#1a1d27", border: "1px solid #2a2f42", borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#2a2f42", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ height: 12, width: "55%", borderRadius: 6, background: "#2a2f42", animation: "pulse 1.5s ease-in-out infinite" }} />
                    <div style={{ height: 10, width: "35%", borderRadius: 6, background: "#22263a", animation: "pulse 1.5s ease-in-out infinite" }} />
                  </div>
                </div>
                <div style={{ height: 12, width: "80%", borderRadius: 6, background: "#22263a", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ height: 12, width: "60%", borderRadius: 6, background: "#22263a", animation: "pulse 1.5s ease-in-out infinite" }} />
              </div>
            ))}
          </div>
        )}

        {/* Network error */}
        {swrError && !isLoading && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, padding: "24px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" style={{ width: 40, height: 40 }}>
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f2f5" }}>通信エラーが発生しました</div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              インターネット接続を確認して<br />再度お試しください
            </div>
            <button onClick={() => mutate()} style={{ marginTop: 4, padding: "10px 24px", borderRadius: 999, background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
              再読み込み
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !swrError && visiblePosts.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "48px 20px", textAlign: "center" }}>
            {searchQuery ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" style={{ width: 48, height: 48 }}>
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                  <path d="M8 11h6M11 8v6"/>
                </svg>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#9ca3af" }}>検索結果がありません</div>
                <div style={{ fontSize: 13, color: "#4b5563" }}>別のキーワードを試してみてください</div>
              </>
            ) : (
              <>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.08)", border: "2px dashed rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" style={{ width: 38, height: 38 }}>
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4"/><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#f0f2f5", marginBottom: 6 }}>近くに投稿がありません</div>
                  <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                    最初の投稿をしてみよう！<br />
                    あなたの情報がドライバーの役に立ちます。
                  </div>
                </div>
                <button
                  onClick={() => setModal("gas")}
                  style={{ padding: "12px 28px", borderRadius: 999, background: "#22c55e", color: "#0f1117", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
                >
                  価格を投稿する
                </button>
              </>
            )}
          </div>
        )}

        {!isLoading && !swrError && visiblePosts.length > 0 &&
          visiblePosts.map((post: any, idx: number) => (
            <React.Fragment key={`item-${post.id}`}>
              {idx > 0 && idx % 5 === 0 && (
                <FeedAdCard adIndex={Math.floor(idx / 5) - 1} />
              )}
              {post.post_type === "gas_price"
                ? <GasPricePostCard post={post} isLoggedIn={isLoggedIn} />
                : <CarPostCard post={post} isLoggedIn={isLoggedIn} />
              }
            </React.Fragment>
          ))
        }

        {/* Guest gate for car posts */}
        {!isLoggedIn && (feedFilter === "all" || feedFilter === "car") && (
          <div style={{ background: "#111827", border: "1px dashed #1f2937", borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
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
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>ゲストでも投稿可</div>
              </div>
            </button>
            <button
              onClick={() => isLoggedIn ? setModal("car") : undefined}
              style={{ flex: 1, padding: "20px 12px", borderRadius: 16, background: isLoggedIn ? "rgba(167,139,250,0.1)" : "#12151f", border: `2px solid ${isLoggedIn ? "rgba(167,139,250,0.4)" : "#2a2f42"}`, cursor: isLoggedIn ? "pointer" : "not-allowed", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: isLoggedIn ? 1 : 0.55 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={isLoggedIn ? "#a78bfa" : "#4b5563"} strokeWidth="2" style={{ width: 32, height: 32 }}>
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <path d="M12 14h5"/><path d="M12 17h3"/>
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isLoggedIn ? "#a78bfa" : "#4b5563" }}>クルマ投稿</div>
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
