"use client";

import useSWR from "swr";

// Stable guest device ID stored in sessionStorage
function getDeviceId(): string {
  if (typeof window === "undefined") return "guest";
  let id = sessionStorage.getItem("dv_device_id");
  if (!id) {
    id = `guest_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("dv_device_id", id);
  }
  return id;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Mission = {
  id: string;
  mission_id: string;
  progress: number;
  completed: boolean;
  rewarded: boolean;
  mission_templates: {
    id: string;
    title_ja: string;
    description_ja: string;
    type: string;
    target: number;
    points: number;
    difficulty: "easy" | "medium" | "hard";
  };
};

const DIFFICULTY_COLORS = {
  easy:   { text: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)"   },
  medium: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  hard:   { text: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"   },
};

const DIFFICULTY_LABELS = { easy: "かんたん", medium: "ふつう", hard: "むずかしい" };

export default function MissionsSection({ onMissionComplete }: { onMissionComplete?: (pts: number, label: string) => void }) {
  const userId = getDeviceId();
  const { data, isLoading } = useSWR(
    `/api/missions?user_id=${userId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const missions: Mission[] = data?.missions ?? [];
  const weekStart: string   = data?.week_start ?? "";

  // Format week_start as readable date
  const weekLabel = weekStart
    ? (() => {
        const d = new Date(weekStart);
        const end = new Date(d);
        end.setDate(d.getDate() + 6);
        return `${d.getMonth() + 1}/${d.getDate()} 〜 ${end.getMonth() + 1}/${end.getDate()}`;
      })()
    : "";

  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div style={{ margin: "0 0 16px" }}>
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" style={{ width: 15, height: 15 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            週間ミッション
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {weekLabel && <span style={{ fontSize: 11, color: "#4b5563" }}>{weekLabel}</span>}
          {!isLoading && missions.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
              background: completedCount === missions.length ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.12)",
              color: completedCount === missions.length ? "#22c55e" : "#f59e0b",
              border: `1px solid ${completedCount === missions.length ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.25)"}`,
            }}>
              {completedCount}/{missions.length} 完了
            </span>
          )}
        </div>
      </div>

      {/* Mission cards */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {isLoading ? (
          // Skeleton
          [0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: "#1a1d27", border: "1px solid #2a2f42", borderRadius: 14, padding: "14px 16px", height: 72 }} />
          ))
        ) : missions.length === 0 ? (
          <div style={{ background: "#1a1d27", border: "1px solid #2a2f42", borderRadius: 14, padding: "20px 16px", textAlign: "center", color: "#4b5563", fontSize: 13 }}>
            ミッションを読み込めませんでした
          </div>
        ) : (
          missions.map((m) => {
            const tpl = m.mission_templates;
            const dc = DIFFICULTY_COLORS[tpl.difficulty];
            const progressPct = Math.min((m.progress / tpl.target) * 100, 100);

            return (
              <div key={m.id} style={{
                background: m.completed ? "rgba(34,197,94,0.04)" : "#1a1d27",
                border: `1px solid ${m.completed ? "rgba(34,197,94,0.2)" : "#2a2f42"}`,
                borderRadius: 14, padding: "14px 16px",
                opacity: m.completed ? 0.75 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: m.completed ? "rgba(34,197,94,0.12)" : dc.bg,
                    border: `1px solid ${m.completed ? "rgba(34,197,94,0.3)" : dc.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {m.completed ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" style={{ width: 18, height: 18 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke={dc.text} strokeWidth="2" strokeLinecap="round" style={{ width: 17, height: 17 }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: m.completed ? "#6b7280" : "#f0f2f5" }}>{tpl.title_ja}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999,
                        background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, flexShrink: 0,
                      }}>
                        {DIFFICULTY_LABELS[tpl.difficulty]}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{tpl.description_ja}</div>

                    {/* Progress bar */}
                    {!m.completed && (
                      <div>
                        <div style={{ height: 5, borderRadius: 999, background: "#2a2f42", overflow: "hidden", marginBottom: 4 }}>
                          <div style={{
                            height: "100%", borderRadius: 999,
                            width: `${progressPct}%`,
                            background: dc.text,
                            transition: "width 0.4s ease",
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#4b5563" }}>{m.progress} / {tpl.target}</div>
                      </div>
                    )}
                  </div>

                  {/* Points badge */}
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0,
                    background: m.completed ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.08)",
                    border: `1px solid ${m.completed ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.2)"}`,
                    borderRadius: 10, padding: "6px 10px",
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>+{tpl.points}</span>
                    <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>pt</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* All complete message */}
      {!isLoading && completedCount > 0 && completedCount === missions.length && (
        <div style={{ margin: "12px 16px 0", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>今週のミッション全て完了！</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>来週また新しいミッションが届きます</div>
        </div>
      )}
    </div>
  );
}
