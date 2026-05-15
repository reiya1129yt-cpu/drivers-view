"use client";

import {
  User,
  Crown,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Star,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AdBanner from "@/components/ui/ad-banner";

interface MoreTabProps {
  user: { email: string; id: string } | null;
  profile: Profile | null;
}

export default function MoreTab({ user, profile }: MoreTabProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const menuItems = [
    {
      icon: <Settings className="h-5 w-5" />,
      label: "設定",
      onClick: () => {},
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "お気に入りスポット",
      onClick: () => {},
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "ヘルプ",
      onClick: () => {},
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "利用規約",
      onClick: () => {},
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4">
        {/* User Profile Section */}
        {user ? (
          <div className="rounded-xl bg-card border border-border p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground truncate">
                    {profile?.display_name || "ユーザー"}
                  </h2>
                  {profile?.is_premium && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Points Display */}
            <div className="mt-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">保有ポイント</p>
                  <p className="text-3xl font-bold text-foreground">
                    {profile?.points || 0}
                    <span className="text-lg font-normal text-muted-foreground ml-1">pt</span>
                  </p>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  特典を見る
                </button>
              </div>
            </div>

            {/* Premium Upgrade */}
            {!profile?.is_premium && (
              <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 py-3 font-medium text-white">
                <Crown className="h-5 w-5" />
                プレミアムにアップグレード
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-6 mb-4 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">
              ログインしていません
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              ログインして価格投稿やポイント獲得を始めましょう
            </p>
            <a
              href="/auth/login"
              className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground"
            >
              ログイン
            </a>
          </div>
        )}

        {/* Menu Items */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary transition-colors ${
                index < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-muted-foreground">{item.icon}</span>
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        {user && (
          <button
            onClick={handleSignOut}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-destructive py-3 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            ログアウト
          </button>
        )}

        {/* App Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Driver&apos;s View v1.0.0</p>
          <p className="mt-1">ガソリン価格を共有して、お得に給油しよう</p>
        </div>
      </div>

      {/* Ad Banner at bottom */}
      <div className="mt-auto p-4">
        <AdBanner placement="inline" />
      </div>
    </div>
  );
}
