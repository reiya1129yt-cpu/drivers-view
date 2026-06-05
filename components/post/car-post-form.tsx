"use client";

import { useState, useRef } from "react";
import { X, Loader2, ImagePlus, MapPin, Trash2, Plus, ChevronDown, BarChart3, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CarPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

type LocationCategory = "meeting_spot" | "scenic_spot" | "orbis" | "other";

const LOCATION_CATEGORIES: Record<LocationCategory, string> = {
  meeting_spot: "集合場所",
  scenic_spot: "景色スポット",
  orbis: "オービス",
  other: "その他",
};

const POLL_DURATIONS = [
  { value: 30, label: "30分" },
  { value: 60, label: "1時間" },
  { value: 180, label: "3時間" },
  { value: 360, label: "6時間" },
  { value: 720, label: "12時間" },
  { value: 1440, label: "24時間" },
  { value: 4320, label: "3日" },
  { value: 7200, label: "5日" },
];

export default function CarPostForm({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: CarPostFormProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location state
  const [locationName, setLocationName] = useState("");
  const [locationCategory, setLocationCategory] = useState<LocationCategory | "">("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Poll state
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDuration, setPollDuration] = useState(1440); // Default 24 hours

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 5 - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      if (file.size > 5 * 1024 * 1024) {
        setError("画像は5MB以下にしてください");
        continue;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("本文を入力してください");
      return;
    }

    // Validate poll if enabled
    if (pollEnabled) {
      if (!pollQuestion.trim()) {
        setError("アンケートの質問を入力してください");
        return;
      }
      const validOptions = pollOptions.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        setError("アンケートの選択肢を2つ以上入力してください");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      let imageUrl = null;

      // Upload first image if any
      if (images.length > 0) {
        const firstImage = images[0];
        const fileExt = firstImage.file.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `car-posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, firstImage.file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      // Insert post
      const { data: postData, error: insertError } = await supabase
        .from("community_posts")
        .insert({
          post_type: "car",
          content: content.trim(),
          image_url: imageUrl,
          user_id: userId,
          is_gathering: false,
          location_name: locationName.trim() || null,
          location_lat: locationLat,
          location_lng: locationLng,
          location_category: locationCategory || null,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Create poll if enabled
      if (pollEnabled && postData) {
        const endsAt = new Date(Date.now() + pollDuration * 60 * 1000);
        
        const { data: pollData, error: pollError } = await supabase
          .from("polls")
          .insert({
            post_id: postData.id,
            question: pollQuestion.trim(),
            ends_at: endsAt.toISOString(),
          })
          .select()
          .single();

        if (pollError) {
          console.error("Poll creation error:", pollError);
        } else if (pollData) {
          // Insert poll options
          const validOptions = pollOptions.filter((opt) => opt.trim());
          const optionsToInsert = validOptions.map((opt) => ({
            poll_id: pollData.id,
            option_text: opt.trim(),
          }));

          const { error: optionsError } = await supabase
            .from("poll_options")
            .insert(optionsToInsert);

          if (optionsError) {
            console.error("Poll options error:", optionsError);
          }
        }
      }

      // Award points (5 points per car post)
      await supabase.rpc("increment_points", {
        user_id: userId,
        amount: 5,
      });

      // Reset form
      resetForm();
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Error posting:", err);
      setError("投稿に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setContent("");
    setImages([]);
    setLocationName("");
    setLocationCategory("");
    setLocationLat(null);
    setLocationLng(null);
    setShowLocationInput(false);
    setPollEnabled(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setPollDuration(1440);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
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
              本文 <span className="text-red-400">*</span>
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
              画像（最大5枚）
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs mt-1">追加</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Location Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                場所
              </label>
              <button
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="text-sm text-primary"
              >
                {showLocationInput ? "閉じる" : "追加"}
              </button>
            </div>
            {showLocationInput && (
              <div className="space-y-3 rounded-lg bg-background border border-border p-3">
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="場所名を入力（例: 東京タワー）"
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                {locationName && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      カテゴリを選択
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.entries(LOCATION_CATEGORIES) as [LocationCategory, string][]).map(
                        ([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setLocationCategory(key)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              locationCategory === key
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-foreground hover:bg-secondary"
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Poll Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                アンケート
              </label>
              <button
                onClick={() => setPollEnabled(!pollEnabled)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  pollEnabled
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                {pollEnabled ? "ON" : "OFF"}
              </button>
            </div>
            {pollEnabled && (
              <div className="space-y-3 rounded-lg bg-background border border-border p-3">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="質問を入力（例: あなたの好きな車は？）"
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <div className="space-y-2">
                  <label className="block text-xs text-muted-foreground">
                    選択肢（2〜5つ）
                  </label>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={`選択肢 ${index + 1}`}
                        maxLength={50}
                        className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => handleRemovePollOption(index)}
                          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 5 && (
                    <button
                      onClick={handleAddPollOption}
                      className="flex items-center gap-2 text-sm text-primary"
                    >
                      <Plus className="h-4 w-4" />
                      選択肢を追加
                    </button>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    結果公開までの時間
                  </label>
                  <div className="relative">
                    <select
                      value={pollDuration}
                      onChange={(e) => setPollDuration(Number(e.target.value))}
                      className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-2 pr-10 text-foreground focus:border-primary focus:outline-none"
                    >
                      {POLL_DURATIONS.map((duration) => (
                        <option key={duration.value} value={duration.value}>
                          {duration.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ※ 選択した時間まで投稿主のみ結果を閲覧可能
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
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
