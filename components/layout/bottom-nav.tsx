"use client";

import { Map, MessageSquare, MoreVertical } from "lucide-react";

export type TabType = "map" | "post" | "more";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasUnread?: boolean;
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: "map", label: "マップ", icon: <Map className="h-6 w-6" /> },
  { id: "post", label: "投稿", icon: <MessageSquare className="h-6 w-6" /> },
  { id: "more", label: "その他", icon: <MoreVertical className="h-6 w-6" /> },
];

export default function BottomNav({ activeTab, onTabChange, hasUnread }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-area-pb">
      <div className="flex h-16 items-center justify-around">
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                {icon}
                {/* Show dot indicator for post tab when there are unread items */}
                {id === "post" && hasUnread && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
              {/* Active indicator dot below label */}
              {isActive && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
