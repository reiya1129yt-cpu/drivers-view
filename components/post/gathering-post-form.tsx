"use client";

import { useState, useRef } from "react";
import {
  X,
  Loader2,
  ImagePlus,
  MapPin,
  Calendar,
  Clock,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GatheringType } from "@/lib/types";
import { GATHERING_TYPE_LABELS } from "@/lib/types";

interface GatheringPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

export default function GatheringPostForm({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: GatheringPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [gatheringType, setGatheringType] = useState<GatheringType>("touring");
  const [locationName, setLocationName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requirements, setRequirements] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gatheringTypes: GatheringType[] = ["touring", "meetup", "drive", "other"];

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
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!locationName.trim()) {
      setError("集合場所を入力してください");
      return;
    }
    if (!startDate || !startTime) {
      setError("開始日時を入力してください");
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
        const filePath = `gathering-posts/${fileName}`;

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

      // Combine date and time
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime =
        endDate && endTime
          ? new Date(`${endDate}T${endTime}`).toISOString()
          : null;

      // Insert post
      const { error: insertError } = await supabase
        .from("community_posts")
        .insert({
          post_type: "gathering",
          title: title.trim(),
          content: content.trim() || null,
          image_url: imageUrl,
          user_id: userId,
          location_name: locationName.trim(),
          start_time: startDateTime,
          end_time: endDateTime,
          gathering_type: gatheringType,
          participation_requirements: requirements.trim() || null,
          is_gathering: true,
        });

      if (insertError) {
        throw insertError;
      }

      // Award points (10 points per gathering post)
      await supabase.rpc("increment_points", {
        user_id: userId,
        amount: 10,
      });

      // Reset form
      setTitle("");
      setContent("");
      setGatheringType("touring");
      setLocationName("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
      setRequirements("");
      setImageFile(null);
      setImagePreview(null);
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
    setTitle("");
    setContent("");
    setGatheringType("touring");
    setLocationName("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setRequirements("");
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  // Get today's date for min date attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-t-2xl bg-card max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">集まりを募集</h2>
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

          {/* Gathering Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              募集タイプ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {gatheringTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGatheringType(type)}
                  className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                    gatheringType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {GATHERING_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：週末ツーリング参加者募集！"
              maxLength={100}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              詳細
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="イベントの詳細を入力してください..."
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                集合場所 <span className="text-red-400">*</span>
              </div>
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="例：東京駅八重洲口"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Start Date/Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                開始日時 <span className="text-red-400">*</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* End Date/Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                終了日時（任意）
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Participation Requirements */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              参加条件（任意）
            </label>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="例：普通自動車免許保有者"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              画像（任意）
            </label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover"
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
                className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-sm">画像を追加</span>
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                投稿中...
              </>
            ) : (
              "募集を投稿する（+10pt）"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
