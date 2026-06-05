"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, User, Car, Loader2, Trash2, Heart, MessageCircle, Eye, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, CommunityPostType, POST_TYPE_LABELS } from "@/lib/types";

interface MyPageProps {
  user: { email: string; id: string };
  profile: Profile | null;
  onBack: () => void;
  onProfileUpdate?: (profile: Profile) => void;
}

interface UserPost {
  id: string;
  post_type: CommunityPostType;
  content: string | null;
  image_url: string | null;
  title: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
}

const POST_TYPE_LABELS_JP: Record<CommunityPostType, string> = {
  price: "価格情報",
  car: "クルマ投稿",
  gathering: "募集",
};

export default function MyPage({ user, profile, onBack, onProfileUpdate }: MyPageProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [carInfo, setCarInfo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserProfile();
    loadUserPosts();
  }, [user.id]);

  const loadUserProfile = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, car_info")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url);
      setCarInfo(data.car_info || "");
    }
  };

  const loadUserPosts = async () => {
    setIsLoadingPosts(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        id,
        post_type,
        content,
        image_url,
        title,
        created_at,
        views_count
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get likes and comments counts
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from("post_likes").select("id", { count: "exact" }).eq("post_id", post.id),
            supabase.from("post_comments").select("id", { count: "exact" }).eq("post_id", post.id),
          ]);
          
          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            views_count: post.views_count || 0,
          };
        })
      );
      setUserPosts(postsWithCounts);
    }
    setIsLoadingPosts(false);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("画像は2MB以下にしてください");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      let newAvatarUrl = avatarUrl;

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, avatarFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("posts")
            .getPublicUrl(filePath);
          newAvatarUrl = urlData.publicUrl;
        }
      }

      // Update profile
      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          avatar_url: newAvatarUrl,
          car_info: carInfo.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data) {
        setAvatarUrl(newAvatarUrl);
        setAvatarFile(null);
        setAvatarPreview(null);
        onProfileUpdate?.(data as Profile);
        alert("プロフィールを保存しました");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);

      if (!error) {
        setUserPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvatarDisplay = () => {
    if (avatarPreview) return avatarPreview;
    if (avatarUrl) return avatarUrl;
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">マイページ</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Profile Section */}
          <div className="rounded-xl bg-card border border-border p-4 mb-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
                  {getAvatarDisplay() ? (
                    <img
                      src={getAvatarDisplay()!}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                タップして画像を変更
              </p>
            </div>

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="h-4 w-4 inline mr-2" />
                アカウント名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名を入力"
                maxLength={30}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Car Info */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Car className="h-4 w-4 inline mr-2" />
                乗っている車
              </label>
              <input
                type="text"
                value={carInfo}
                onChange={(e) => setCarInfo(e.target.value)}
                placeholder="例: トヨタ GR86 / ZN8"
                maxLength={50}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存する"
              )}
            </button>
          </div>

          {/* User Posts Section */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">
              自分の投稿 ({userPosts.length})
            </h2>

            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="rounded-xl bg-card border border-border p-8 text-center">
                <p className="text-muted-foreground">まだ投稿がありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-xl bg-card border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">
                            {POST_TYPE_LABELS_JP[post.post_type]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        {post.title && (
                          <p className="font-medium text-foreground text-sm mb-1">
                            {post.title}
                          </p>
                        )}
                        <p className="text-sm text-foreground line-clamp-2">
                          {post.content || "（内容なし）"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.comments_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views_count}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmId(post.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">
              投稿を削除しますか？
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              本当にこの投稿を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-border py-3 font-medium text-foreground hover:bg-secondary"
              >
                いいえ
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-500 py-3 font-medium text-white hover:bg-red-600 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    削除中...
                  </>
                ) : (
                  "はい"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
