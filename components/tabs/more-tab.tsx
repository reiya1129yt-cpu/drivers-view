"use client";

import {
  Bell,
  ChevronRight,
  MapPin,
  Globe,
  Info,
  TrendingUp,
  Star,
  Clock,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MoreTabProps {
  user: { email: string; id: string } | null;
  profile: Profile | null;
}

// Mock news data
const newsItems = [
  {
    id: 1,
    tag: "価格動向",
    tagColor: "bg-red-500",
    source: "日経エネルギー",
    time: "2時間前",
    title: "原油価格が2週間ぶりに下落、ガソリン価格にも影響か",
  },
  {
    id: 2,
    tag: "政策",
    tagColor: "bg-blue-500",
    source: "エコ自動車ニュース",
    time: "5時間前",
    title: "環境省、EV補助金を来年度も継続へ",
  },
  {
    id: 3,
    tag: "原油",
    tagColor: "bg-orange-500",
    source: "石油情報センター",
    time: "昨日",
    title: "中東情勢の緊迫でWTI原油が上昇",
  },
  {
    id: 4,
    tag: "業界",
    tagColor: "bg-green-500",
    source: "業界レポート",
    time: "2日前",
    title: "セルフスタンドの割合が全国で70%超え",
  },
];

// Mock AI price predictions
const pricePredictions = [
  { period: "今週", price: 168, change: 0, color: "text-foreground" },
  { period: "来週", price: 172, change: 4, color: "text-red-400" },
  { period: "再来週", price: 169, change: -3, color: "text-green-400" },
  { period: "1ヶ月後", price: 164, change: -8, color: "text-green-400" },
];

export default function MoreTab({ user, profile }: MoreTabProps) {
  const router = useRouter();
  const [priceAlert, setPriceAlert] = useState(true);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const getAvatarLetter = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0);
    }
    return "U";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <div className="p-4">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-4">その他</h1>

        {/* User Profile Card */}
        {user ? (
          <div className="rounded-xl bg-card border border-border p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {getAvatarLetter()}
                </div>
                <div>
                  <h2 className="font-bold text-foreground">
                    {profile?.display_name || "ユーザー"}
                  </h2>
                  <p className="text-sm text-muted-foreground">関東エリア</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-card border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                ログアウト
              </button>
            </div>

            {/* Points Section */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">ポイント</p>
                  <p className="text-xs text-muted-foreground">ポイント交換・履歴を見る</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{profile?.points || 0}</span>
                <span className="text-primary">pt</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-6 mb-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">?</span>
            </div>
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

        {/* Premium Card */}
        {user && !profile?.is_premium && (
          <div className="rounded-xl bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-bold text-yellow-400">プレミアム</p>
                  <p className="text-xs text-yellow-600">広告なし・お気に入り無制限</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">330円/月</span>
                <span className="text-xs text-yellow-500">他にも特典あり</span>
                <ChevronRight className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </div>
        )}

        {/* AI Gas Price Prediction */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">AIガソリン価格予測</h3>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">レギュラーガソリン予測</p>
                <p className="text-xs text-muted-foreground">AIによる価格トレンド分析（参考値）</p>
              </div>
            </div>

            {/* Price Chart */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {pricePredictions.map((pred, index) => (
                <div key={index} className="text-center">
                  <p className={`text-xl font-bold ${pred.color}`}>¥{pred.price}</p>
                  <div className={`h-0.5 mt-1 mb-2 ${
                    pred.change > 0 ? "bg-red-400" : pred.change < 0 ? "bg-green-400" : "bg-muted-foreground"
                  }`} />
                  <p className="text-xs text-muted-foreground">{pred.period}</p>
                  <p className={`text-xs font-medium ${pred.color}`}>
                    {pred.change > 0 ? `+${pred.change}円` : pred.change < 0 ? `${pred.change}円` : "±0円"}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              ※ 予測は過去データと原油先物指標に基づく参考値です。実際の価格と異なる場合があります。
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">通知</h3>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            {/* Notification Center */}
            <button className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">通知センター</p>
                  <p className="text-xs text-muted-foreground">未読 2件</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>

            {/* Price Alert Toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">価格アラート</p>
                  <p className="text-xs text-muted-foreground">価格変動をお知らせ</p>
                </div>
              </div>
              <button
                onClick={() => setPriceAlert(!priceAlert)}
                className="text-primary"
              >
                {priceAlert ? (
                  <ToggleRight className="h-8 w-8" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gasoline News Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">ガソリン関連ニュース</h3>
          <div className="space-y-3">
            {newsItems.map((news) => (
              <button
                key={news.id}
                className="w-full rounded-xl bg-card border border-border p-4 text-left hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium text-white ${news.tagColor}`}>
                    {news.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <span className="text-xs text-muted-foreground">・</span>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </div>
                <p className="font-medium text-foreground leading-snug">{news.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">設定</h3>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <button className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">表示地域</p>
                  <p className="text-xs text-muted-foreground">関東エリア</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">言語 / Language</p>
                  <p className="text-xs text-muted-foreground">日本語</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">アプリについて</p>
                  <p className="text-xs text-muted-foreground">バージョン 1.0.0</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
