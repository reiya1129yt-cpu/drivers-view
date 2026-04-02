"use client";

import { useState, useEffect } from "react";
import type { FuelType, GasStationInput } from "@/lib/types";
import { FUEL_TYPE_LABELS, FUEL_TYPE_COLORS } from "@/lib/types";

interface PostScreenProps {
  userLocation: { lat: number; lng: number } | null;
  onSubmit: (data: GasStationInput) => Promise<void>;
}

const fuelTypes: FuelType[] = ["regular", "high_octane", "diesel"];

export default function PostScreen({ userLocation, onSubmit }: PostScreenProps) {
  const [stationName, setStationName] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("regular");
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation) {
      setManualLat(userLocation.lat.toFixed(6));
      setManualLng(userLocation.lng.toFixed(6));
    }
  }, [userLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lat = useCurrentLocation && userLocation ? userLocation.lat : parseFloat(manualLat);
    const lng = useCurrentLocation && userLocation ? userLocation.lng : parseFloat(manualLng);
    const priceNum = parseFloat(price);

    if (!stationName.trim()) { setError("スタンド名を入力してください"); return; }
    if (!price || isNaN(priceNum) || priceNum <= 0) { setError("正しい価格を入力してください"); return; }
    if (isNaN(lat) || isNaN(lng)) { setError("位置情報を確認してください"); return; }

    setIsSubmitting(true);
    try {
      await onSubmit({ station_name: stationName.trim(), fuel_type: fuelType, price: priceNum, latitude: lat, longitude: lng, comment: comment.trim() || undefined });
      setSubmitted(true);
      setStationName("");
      setPrice("");
      setComment("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError("投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#22263a",
    border: "1px solid #2a2f42",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "15px",
    color: "#f0f2f5",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#9ca3af",
    marginBottom: "6px",
    letterSpacing: "0.03em",
  } as React.CSSProperties;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0f1117" }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0", background: "#0f1117" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f0f2f5" }}>価格を投稿</h1>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
          近くのガソリンスタンドの価格を共有しましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Success banner */}
        {submitted && (
          <div style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#22c55e",
            fontSize: "14px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            投稿しました！ありがとうございます
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#f87171",
            fontSize: "14px",
          }}>
            {error}
          </div>
        )}

        {/* Station name */}
        <div>
          <label style={labelStyle}>スタンド名 *</label>
          <input
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            placeholder="例：コスモ石油 渋谷店"
            style={inputStyle}
            required
          />
        </div>

        {/* Fuel type */}
        <div>
          <label style={labelStyle}>燃料タイプ *</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {fuelTypes.map((ft) => {
              const isActive = fuelType === ft;
              const color = FUEL_TYPE_COLORS[ft];
              return (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFuelType(ft)}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    borderRadius: "10px",
                    border: isActive ? `2px solid ${color}` : "2px solid #2a2f42",
                    background: isActive ? `${color}22` : "#22263a",
                    color: isActive ? color : "#6b7280",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: 10, height: 10,
                      borderRadius: "50%",
                      background: isActive ? color : "#2a2f42",
                      display: "block",
                    }}
                  />
                  {FUEL_TYPE_LABELS[ft]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price */}
        <div>
          <label style={labelStyle}>価格（円/L）*</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b7280",
              fontSize: "16px",
              fontWeight: 700,
            }}>¥</span>
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="168"
              min="1"
              max="999"
              step="0.1"
              style={{ ...inputStyle, paddingLeft: "30px" }}
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>位置情報</label>
          {userLocation ? (
            <div
              style={{
                background: "#22263a",
                border: "1px solid #2a2f42",
                borderRadius: "10px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#22c55e",
                flexShrink: 0,
                boxShadow: "0 0 0 3px rgba(34,197,94,0.25)",
              }} />
              <div>
                <div style={{ fontSize: "13px", color: "#22c55e", fontWeight: 600 }}>現在地を使用</div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "12px", color: "#f59e0b", marginBottom: "8px", padding: "8px 12px", background: "rgba(245,158,11,0.1)", borderRadius: "8px", border: "1px solid rgba(245,158,11,0.3)" }}>
                位置情報が取得できていません。マップ画面で位置情報を許可してください。
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <input type="number" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="緯度 (例: 35.6762)" style={{ ...inputStyle, fontSize: "13px" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="経度 (例: 139.6503)" style={{ ...inputStyle, fontSize: "13px" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comment */}
        <div>
          <label style={labelStyle}>コメント（任意）</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例：会員価格です / セルフです"
            rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
            maxLength={100}
          />
          <div style={{ fontSize: "11px", color: "#6b7280", textAlign: "right", marginTop: "4px" }}>
            {comment.length}/100
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: "12px",
            background: isSubmitting ? "#1a4731" : "#22c55e",
            color: isSubmitting ? "#4ade80" : "#0f1117",
            fontSize: "16px",
            fontWeight: 700,
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin" viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M4 12a8 8 0 018-8" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
              </svg>
              投稿中...
            </>
          ) : (
            "投稿する"
          )}
        </button>
      </form>
    </div>
  );
}
