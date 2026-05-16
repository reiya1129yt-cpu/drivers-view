"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Heart,
  MessageSquare,
  ShoppingCart,
  Lock,
  Car,
  Users,
  MapPin,
  Calendar,
  Play,
} from "lucide-react";
import type {
  PlaceWithPrices,
  Profile,
  FuelType,
  PricePost,
  CommunityPost,
  CommunityPostType,
} from "@/lib/types";
import { FUEL_TYPE_LABELS, GATHERING_TYPE_LABELS, POST_TYPE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import LoginPrompt from "@/components/ui/login-prompt";
import { getSettings } from "@/lib/settings";
import type { Language } from "@/lib/i18n";

interface PostTabProps {
  user: { email: string; id: string } | null;
  profile: Profile | null;
  places: PlaceWithPrices[];
  userLocation: [number, number];
  onPricePosted?: () => void;
  onOpenPostForm?: () => void;
}

type TabType = "all" | "price" | "car" | "gathering";
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
  const [pricePosts, setPricePosts] = useState<PostWithDetails[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [language, setLanguage] = useState<Language>("ja");

  useEffect(() => {
    const settings = getSettings();
    setLanguage(settings.language);
  }, []);

  // Fetch recent posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // Fetch price posts
      const { data: priceData } = await supabase
        .from("price_posts")
        .select(
          `
          *,
          place:places(name, brand),
          profile:profiles(display_name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (priceData) {
        setPricePosts(priceData as PostWithDetails[]);
      }

      // Fetch community posts (car + gathering)
      const { data: communityData } = await supabase
        .from("community_posts")
        .select(
          `
          *,
          profile:profiles(display_name)
        `
        )
        .in("post_type", ["car", "gathering"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (communityData) {
        setCommunityPosts(communityData as CommunityPost[]);
      }

      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  const tabs = [
    { id: "all" as TabType, label: "すべて" },
    { id: "price" as TabType, label: "価格情報" },
    { id: "car" as TabType, label: "クルマ", requiresAuth: true },
    { id: "gathering" as TabType, label: "募集", requiresAuth: true },
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-purple-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getFuelTypeColor = (fuelType: FuelType) => {
    switch (fuelType) {
      case "regular":
        return "bg-red-500/20 text-red-400";
      case "high_octane":
        return "bg-orange-500/20 text-orange-400";
      case "diesel":
        return "bg-blue-500/20 text-blue-400";
      case "kerosene":
        return "bg-purple-500/20 text-purple-400";
    }
  };

  const getBorderColor = (fuelType: FuelType) => {
    switch (fuelType) {
      case "regular":
        return "border-l-red-500";
      case "high_octane":
        return "border-l-orange-500";
      case "diesel":
        return "border-l-blue-500";
      case "kerosene":
        return "border-l-purple-500";
    }
  };

  const getPostTypeBorderColor = (postType: CommunityPostType) => {
    switch (postType) {
      case "price":
        return "border-l-red-500";
      case "car":
        return "border-l-blue-500";
      case "gathering":
        return "border-l-green-500";
    }
  };

  const getPostTypeTagColor = (postType: CommunityPostType) => {
    switch (postType) {
      case "price":
        return "bg-red-500/20 text-red-400";
      case "car":
        return "bg-blue-500/20 text-blue-400";
      case "gathering":
        return "bg-green-500/20 text-green-400";
    }
  };

  const handleLikeClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    // Handle like
  };

  const handleCommentClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    // Handle comment
  };

  const handleTabChange = (tab: TabType) => {
    const tabConfig = tabs.find((t) => t.id === tab);
    if (tabConfig?.requiresAuth && !user) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveTab(tab);
  };

  // Filter posts based on active tab
  const filteredPricePosts =
    activeTab === "all" || activeTab === "price" ? pricePosts : [];
  const filteredCommunityPosts =
    activeTab === "all"
      ? communityPosts
      : activeTab === "car"
        ? communityPosts.filter((p) => p.post_type === "car")
        : activeTab === "gathering"
          ? communityPosts.filter((p) => p.post_type === "gathering")
          : [];

  // Combine and sort all posts for "all" tab
  const allPosts =
    activeTab === "all"
      ? [
          ...filteredPricePosts.map((p) => ({
            ...p,
            type: "price" as const,
            sortDate: new Date(p.created_at),
          })),
          ...filteredCommunityPosts.map((p) => ({
            ...p,
            type: "community" as const,
            sortDate: new Date(p.created_at),
          })),
        ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
      : [];

  // Render login required content for car/gathering tabs
  if ((activeTab === "car" || activeTab === "gathering") && !user) {
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
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.requiresAuth && !user && (
                  <Lock className="inline h-3 w-3 mr-1" />
                )}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Login Required Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-card border-2 border-dashed border-primary/30">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {activeTab === "car" ? "クルマコミュニティ" : "集まり募集"}
          </h3>
          <p className="text-muted-foreground text-center mb-6">
            ログインすると
            {activeTab === "car" ? "クルマコミュニティ" : "集まり募集機能"}
            が利用できます
          </p>
          <a
            href="/auth/login"
            className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            ログイン / 登録する
          </a>
        </div>

        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          language={language}
        />
      </div>
    );
  }

  // Render Price Post Card
  const renderPricePost = (post: PostWithDetails) => {
    const displayName = post.profile?.display_name || "ゲスト";
    const avatarLetter = displayName.charAt(0);

    return (
      <div
        key={`price-${post.id}`}
        className={`rounded-xl bg-card border border-border p-4 border-l-4 ${getBorderColor(post.fuel_type)}`}
      >
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ${getAvatarColor(displayName)}`}
            >
              {avatarLetter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {post.place?.brand && `${post.place.brand} `}
                {post.place?.name || "不明なスタンド"}
              </p>
            </div>
          </div>

          {/* Price Display */}
          <div className={`rounded-lg px-3 py-2 ${getFuelTypeColor(post.fuel_type)}`}>
            <p className="text-2xl font-bold">
              ¥{post.price}
              <span className="text-sm font-normal">/L</span>
            </p>
            <p className="text-xs text-center">{FUEL_TYPE_LABELS[post.fuel_type]}</p>
          </div>
        </div>

        {/* Tags and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            価格情報
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">0</span>
            </button>
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">コメント</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Community Post Card (Car or Gathering)
  const renderCommunityPost = (post: CommunityPost) => {
    const displayName = post.profile?.display_name || "ゲスト";
    const avatarLetter = displayName.charAt(0);

    return (
      <div
        key={`community-${post.id}`}
        className={`rounded-xl bg-card border border-border p-4 border-l-4 ${getPostTypeBorderColor(post.post_type)}`}
      >
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white font-bold ${getAvatarColor(displayName)}`}
          >
            {avatarLetter}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPostTypeTagColor(post.post_type)}`}
          >
            {POST_TYPE_LABELS[post.post_type]}
          </span>
        </div>

        {/* Gathering Title */}
        {post.post_type === "gathering" && post.title && (
          <h3 className="font-bold text-foreground mb-2">{post.title}</h3>
        )}

        {/* Content */}
        {post.content && (
          <p className="text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={post.image_url}
              alt="Post"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Video Link */}
        {post.video_url && (
          <a
            href={post.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-3 rounded-lg bg-secondary p-3 text-foreground hover:bg-secondary/80"
          >
            <Play className="h-5 w-5 text-primary" />
            <span className="text-sm">動画を見る</span>
          </a>
        )}

        {/* Gathering Info */}
        {post.post_type === "gathering" && (
          <div className="mb-3 space-y-2">
            {post.gathering_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {GATHERING_TYPE_LABELS[post.gathering_type as keyof typeof GATHERING_TYPE_LABELS] ||
                    post.gathering_type}
                </span>
              </div>
            )}
            {post.location_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{post.location_name}</span>
              </div>
            )}
            {post.start_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDateTime(post.start_time)}
                  {post.end_time && ` ~ ${formatDateTime(post.end_time)}`}
                </span>
              </div>
            )}
            {post.participation_requirements && (
              <div className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                参加条件: {post.participation_requirements}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-2 border-t border-border">
          <button
            onClick={handleLikeClick}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm">0</span>
          </button>
          <button
            onClick={handleCommentClick}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">コメント</span>
          </button>
        </div>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const emptyConfig = {
      all: {
        icon: ShoppingCart,
        title: "近くに投稿がありません",
        description: "最初の投稿をしてみよう！あなたの情報がドライバーの役に立ちます。",
        buttonText: "投稿する",
      },
      price: {
        icon: ShoppingCart,
        title: "価格投稿がありません",
        description: "最初の投稿をしてみよう！あなたの情報がドライバーの役に立ちます。",
        buttonText: "価格を投稿する",
      },
      car: {
        icon: Car,
        title: "クルマの投稿がありません",
        description: "最初の投稿をしてみよう！あなたの愛車を共有しましょう。",
        buttonText: "クルマを投稿する",
      },
      gathering: {
        icon: Users,
        title: "募集がありません",
        description: "最初の募集をしてみよう！ツーリングやオフ会の参加者を募集しましょう。",
        buttonText: "募集を投稿する",
      },
    };

    const config = emptyConfig[activeTab];

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-primary/30">
          <config.icon className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{config.title}</h3>
        <p className="text-muted-foreground mb-6 px-4">{config.description}</p>
        <button
          onClick={() => onOpenPostForm?.()}
          className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
        >
          {config.buttonText}
        </button>
      </div>
    );
  };

  const hasNoPosts =
    activeTab === "all"
      ? allPosts.length === 0
      : activeTab === "price"
        ? filteredPricePosts.length === 0
        : filteredCommunityPosts.length === 0;

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
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab.requiresAuth && !user && <Lock className="inline h-3 w-3 mr-1" />}
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
        ) : hasNoPosts ? (
          renderEmptyState()
        ) : (
          <div className="space-y-3">
            {activeTab === "all" ? (
              // All posts - mixed
              allPosts.map((post) =>
                post.type === "price"
                  ? renderPricePost(post as PostWithDetails)
                  : renderCommunityPost(post as CommunityPost)
              )
            ) : activeTab === "price" ? (
              // Price posts only
              filteredPricePosts.map((post) => renderPricePost(post))
            ) : (
              // Community posts (car or gathering)
              filteredCommunityPosts.map((post) => renderCommunityPost(post))
            )}
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

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        language={language}
      />
    </div>
  );
}
