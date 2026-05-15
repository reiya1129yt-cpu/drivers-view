"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Heart, MessageSquare, ShoppingCart } from "lucide-react";
import type { PlaceWithPrices, Profile, FuelType, PricePost } from "@/lib/types";
import { FUEL_TYPE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import AdBanner from "@/components/ui/ad-banner";

interface PostTabProps {
  user: { email: string; id: string } | null;
  profile: Profile | null;
  places: PlaceWithPrices[];
  userLocation: [number, number];
  onPricePosted?: () => void;
  onOpenPostForm?: () => void;
}

type TabType = "all" | "price" | "car";
type SortType = "new" | "likes" | "views";

interface PostWithDetails extends PricePost {
  place?: {
    name: string;
    brand: string | null;
  };
  profile?: {
    display_name: string | null;
  };
}

export default function PostTab({
  user,
  profile,
  places,
  userLocation,
  onPricePosted,
  onOpenPostForm,
}: PostTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortBy, setSortBy] = useState<SortType>("new");
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);

  // Fetch recent posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("price_posts")
        .select(`
          *,
          place:places(name, brand),
          profile:profiles(display_name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setPosts(data as PostWithDetails[]);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  const tabs = [
    { id: "all" as TabType, label: "すべて" },
    { id: "price" as TabType, label: "価格情報" },
    { id: "car" as TabType, label: "クルマ" },
  ];

  const sortOptions = [
    { id: "new" as SortType, label: "新着" },
    { id: "likes" as SortType, label: "いいね" },
    { id: "views" as SortType, label: "閲覧数" },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "たった今";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
    return `${Math.floor(diffInSeconds / 86400)}日前`;
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-red-500", "bg-orange-500", "bg-green-500", "bg-blue-500", "bg-purple-500"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getFuelTypeColor = (fuelType: FuelType) => {
    switch (fuelType) {
      case "regular": return "bg-red-500/20 text-red-400";
      case "high_octane": return "bg-orange-500/20 text-orange-400";
      case "diesel": return "bg-blue-500/20 text-blue-400";
      case "kerosene": return "bg-purple-500/20 text-purple-400";
    }
  };

  const getBorderColor = (fuelType: FuelType) => {
    switch (fuelType) {
      case "regular": return "border-l-red-500";
      case "high_octane": return "border-l-orange-500";
      case "diesel": return "border-l-blue-500";
      case "kerosene": return "border-l-purple-500";
    }
  };

  const filteredPosts = activeTab === "price" 
    ? posts 
    : activeTab === "car" 
    ? [] // No car posts yet
    : posts;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">投稿</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-sm text-muted-foreground">並び替え:</span>
        {sortOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSortBy(option.id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              sortBy === option.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const displayName = post.profile?.display_name || "ゲスト";
              const avatarLetter = displayName.charAt(0);
              
              return (
                <div
                  key={post.id}
                  className={`rounded-xl bg-card border border-border p-4 border-l-4 ${getBorderColor(post.fuel_type)}`}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ${getAvatarColor(displayName)}`}>
                        {avatarLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{displayName}</span>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.place?.brand && `${post.place.brand} `}
                          {post.place?.name || "不明なスタンド"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Price Display */}
                    <div className={`rounded-lg px-3 py-2 ${getFuelTypeColor(post.fuel_type)}`}>
                      <p className="text-2xl font-bold">¥{post.price}<span className="text-sm font-normal">/L</span></p>
                      <p className="text-xs text-center">{FUEL_TYPE_LABELS[post.fuel_type]}</p>
                    </div>
                  </div>

                  {/* Tags and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      価格情報
                    </span>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">0</span>
                      </button>
                      <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">コメント</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-primary/30">
              <ShoppingCart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {activeTab === "car" ? "クルマの投稿がありません" : "近くに投稿がありません"}
            </h3>
            <p className="text-muted-foreground mb-1">最初の投稿をしてみよう！</p>
            <p className="text-sm text-muted-foreground mb-6">あなたの情報がドライバーの役に立ちます。</p>
            <button
              onClick={() => onOpenPostForm?.()}
              className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
            >
              価格を投稿する
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => onOpenPostForm?.()}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 text-primary-foreground"
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
