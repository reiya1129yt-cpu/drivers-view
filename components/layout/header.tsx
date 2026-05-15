"use client";

import { useState } from "react";
import { User, LogOut, Crown, Menu, X } from "lucide-react";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  user: { email: string } | null;
  profile: Profile | null;
}

export default function Header({ user, profile }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg">🚗</span>
          </div>
          <h1 className="font-bold text-card-foreground">
            Driver&apos;s View
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile && (
                <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                  {profile.is_premium && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-secondary-foreground">
                    {profile.points}pt
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center justify-center rounded-full bg-secondary p-2"
              >
                {showMenu ? (
                  <X className="h-5 w-5 text-secondary-foreground" />
                ) : (
                  <User className="h-5 w-5 text-secondary-foreground" />
                )}
              </button>

              {showMenu && (
                <div className="absolute right-4 top-14 mt-2 w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {user.email}
                    </p>
                    {profile && (
                      <p className="text-xs text-muted-foreground">
                        {profile.display_name || "ユーザー"}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" />
                    ログアウト
                  </button>
                </div>
              )}
            </>
          ) : (
            <a
              href="/auth/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              ログイン
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
