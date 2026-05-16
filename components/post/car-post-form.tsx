"use client";

import { useState, useRef } from "react";
import { X, Loader2, ImagePlus, Video, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CarPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

export default function CarPostForm({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: CarPostFormProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("画像は5MB以下にしてください");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile && !videoUrl) {
      setError("内容、画像、または動画URLを入力してください");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      let imageUrl = null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `car-posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // Insert post
      const { error: insertError } = await supabase
        .from("community_posts")
        .insert({
          post_type: "car",
          content: content.trim() || null,
          image_url: imageUrl,
          video_url: videoUrl.trim() || null,
          user_id: userId,
          is_gathering: false,
        });

      if (insertError) {
        throw insertError;
      }

      // Award points (5 points per car post)
      await supabase.rpc("increment_points", {
        user_id: userId,
        amount: 5,
      });

      // Reset form
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setVideoUrl("");
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error posting:", err);
      setError("投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setVideoUrl("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-t-2xl bg-card max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">クルマを投稿</h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-red-400">
              {error}
            </div>
          )}

          {/* Content Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="愛車について書いてみよう..."
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {content.length}/500
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              画像
            </label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">タップして画像を選択</span>
                <span className="text-xs">最大5MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Video URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                動画URL（YouTube, TikTokなど）
              </div>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageFile && !videoUrl)}
            className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                投稿中...
              </>
            ) : (
              "投稿する（+5pt）"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
