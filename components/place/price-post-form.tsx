"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import type { PlaceWithPrices, FuelType } from "@/lib/types";
import { FUEL_TYPE_LABELS } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface PricePostFormProps {
  place: PlaceWithPrices;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PricePostForm({
  place,
  onClose,
  onSuccess,
}: PricePostFormProps) {
  const [fuelType, setFuelType] = useState<FuelType>("regular");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fuelTypes: FuelType[] = ["regular", "high_octane", "diesel", "kerosene"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceValue = parseInt(price, 10);
    if (isNaN(priceValue) || priceValue < 100 || priceValue > 300) {
      setError("価格は100〜300円の範囲で入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("ログインが必要です");
        return;
      }

      const { error: insertError } = await supabase.from("price_posts").insert({
        place_id: place.id,
        user_id: user.id,
        fuel_type: fuelType,
        price: priceValue,
      });

      if (insertError) {
        throw insertError;
      }

      // Award points (10 points per post)
      await supabase.rpc("increment_points", {
        user_id: user.id,
        amount: 10,
      });

      onSuccess();
    } catch (err) {
      console.error("Error posting price:", err);
      setError("価格の投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-card-foreground">価格を投稿</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{place.name}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              燃料タイプ
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fuelTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFuelType(type)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    fuelType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {FUEL_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              価格 (円/L)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="165"
                min="100"
                max="300"
                className="w-full rounded-lg border border-input bg-background px-8 py-3 text-lg font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                /L
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !price}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                投稿中...
              </>
            ) : (
              "価格を投稿 (+10ポイント)"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
