"use client";

import { Map, PenSquare, MoreHorizontal } from "lucide-react";

export type TabType = "map" | "post" | "more";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "map", label: "マップ", icon: <Map className="h-5 w-5" /> },
  { id: "post", label: "投稿", icon: <PenSquare className="h-5 w-5" /> },
  { id: "more", label: "その他", icon: <MoreHorizontal className="h-5 w-5" /> },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm safe-area-pb">
      <div className="flex h-14 items-center justify-around">
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
