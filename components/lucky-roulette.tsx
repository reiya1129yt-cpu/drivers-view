"use client";

import { useState, useEffect, useRef } from "react";

// ── Prize table ──────────────────────────────────────────────────────────────
// Weights sum to 100. Rare prizes have lower weight.
const PRIZES = [
  { pts: 1,  label: "+1pt",  color: "#6b7280", weight: 40 },
  { pts: 3,  label: "+3pt",  color: "#3b82f6", weight: 30 },
  { pts: 5,  label: "+5pt",  color: "#22c55e", weight: 18 },
  { pts: 10, label: "+10pt", color: "#f59e0b", weight: 9  },
  { pts: 20, label: "+20pt", color: "#f97316", weight: 3  },
];

function pickPrize(): typeof PRIZES[number] {
  const total = PRIZES.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PRIZES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PRIZES[0];
}

// Total segments on the wheel (repeat prizes for visual balance)
const SEGMENTS = [
  PRIZES[0], PRIZES[2], PRIZES[1], PRIZES[3],
  PRIZES[0], PRIZES[4], PRIZES[1], PRIZES[2],
  PRIZES[0], PRIZES[1], PRIZES[2], PRIZES[0],
];
const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT;

interface Props {
  onComplete: (pts: number) => void;
}

export default function LuckyRoulette({ onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<typeof PRIZES[number] | null>(null);
  const [showRays, setShowRays] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinRef = useRef(false);

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const R = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    SEGMENTS.forEach((seg, i) => {
      const start = (i * SEG_ANGLE - 90) * (Math.PI / 180);
      const end = start + SEG_ANGLE * (Math.PI / 180);

      // Slice fill
      ctx.beginPath();
      ctx.moveTo(R, R);
      ctx.arc(R, R, R - 2, start, end);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? seg.color + "dd" : seg.color + "99";
      ctx.fill();
      ctx.strokeStyle = "#0f1117";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(R, R);
      ctx.rotate(start + (SEG_ANGLE / 2) * (Math.PI / 180));
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(seg.label, R - 10, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(R, R, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#0f1117";
    ctx.fill();
    ctx.strokeStyle = "#2a2f42";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center bolt icon
    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚡", R, R);
  }, []);

  const handleSpin = () => {
    if (spinRef.current) return;
    spinRef.current = true;
    setPhase("spinning");

    const chosen = pickPrize();
    // Find a segment index matching the chosen prize
    const matchIdx = SEGMENTS.findIndex((s) => s.pts === chosen.pts);
    // Target angle: spin 5+ full rotations, land on prize segment
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const targetAngle = 360 * extraSpins + (360 - matchIdx * SEG_ANGLE - SEG_ANGLE / 2);

    setRotation(targetAngle);

    setTimeout(() => {
      setPrize(chosen);
      setPhase("result");
      setShowRays(true);
    }, 3800);
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (phase === "result" && prize) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 20, padding: "16px 0 8px", textAlign: "center",
        animation: "fadeSlideUp 0.4s ease",
      }}>
        {/* Burst rays */}
        {showRays && (
          <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`ray-${i}`} style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: 2, height: 48,
                background: prize.color,
                opacity: 0.5,
                borderRadius: 999,
                transformOrigin: "top center",
                transform: `translate(-50%, 0) rotate(${i * 45}deg)`,
              }} />
            ))}
            {/* Prize circle */}
            <div style={{
              position: "absolute", inset: 18,
              borderRadius: "50%",
              background: `${prize.color}20`,
              border: `3px solid ${prize.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: prize.color }}>{prize.pts}</span>
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f0f2f5", marginBottom: 6 }}>
            {prize.pts >= 10 ? "スゴい！" : "ボーナス獲得！"}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
            ラッキーチャンスで追加ポイントをゲット
          </div>
        </div>

        {/* Points badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: `${prize.color}18`,
          border: `1.5px solid ${prize.color}55`,
          borderRadius: 999, padding: "10px 24px",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={prize.color} strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18 }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span style={{ fontSize: 22, fontWeight: 900, color: prize.color }}>{prize.label}</span>
          <span style={{ fontSize: 13, color: prize.color, fontWeight: 600 }}>追加獲得！</span>
        </div>

        <button
          onClick={() => onComplete(prize.pts)}
          style={{
            width: "100%", padding: "14px",
            borderRadius: 12,
            background: prize.color,
            color: "#0f1117",
            fontWeight: 800, fontSize: 16,
            border: "none", cursor: "pointer",
          }}
        >
          受け取る
        </button>
      </div>
    );
  }

  // ── Spin screen ────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 20, padding: "12px 0 8px", textAlign: "center",
    }}>
      {/* Header */}
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.35)",
          borderRadius: 999, padding: "6px 16px", marginBottom: 12,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.06em" }}>LUCKY CHANCE</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#f0f2f5", marginBottom: 6 }}>ラッキーチャンス！</div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
          ボーナスポイントをスピンで獲得しよう
        </div>
      </div>

      {/* Wheel container */}
      <div style={{ position: "relative", width: 230, height: 230 }}>
        {/* Pointer (top) */}
        <div style={{
          position: "absolute", top: -8, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0, zIndex: 10,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "22px solid #f59e0b",
          filter: "drop-shadow(0 2px 4px rgba(245,158,11,0.5))",
        }} />

        {/* Spinning canvas */}
        <div style={{
          width: 230, height: 230,
          transition: phase === "spinning" ? "transform 3.8s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
          transform: `rotate(${rotation}deg)`,
          borderRadius: "50%",
          boxShadow: "0 0 0 3px #2a2f42, 0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <canvas ref={canvasRef} width={230} height={230} style={{ borderRadius: "50%", display: "block" }} />
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={phase === "spinning"}
        style={{
          width: "100%", padding: "16px",
          borderRadius: 14,
          background: phase === "spinning"
            ? "#2a2f42"
            : "linear-gradient(135deg, #f59e0b, #f97316)",
          color: phase === "spinning" ? "#4b5563" : "#0f1117",
          fontWeight: 900, fontSize: 17,
          border: "none",
          cursor: phase === "spinning" ? "not-allowed" : "pointer",
          letterSpacing: "0.04em",
          boxShadow: phase === "spinning" ? "none" : "0 4px 20px rgba(245,158,11,0.35)",
          transition: "all 0.2s",
        }}
      >
        {phase === "spinning" ? "スピン中..." : "スピン！"}
      </button>

      {/* Prize legend */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {PRIZES.map((p) => (
          <div key={p.pts} style={{
            display: "flex", alignItems: "center", gap: 4,
            background: `${p.color}18`, border: `1px solid ${p.color}44`,
            borderRadius: 999, padding: "4px 10px",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
