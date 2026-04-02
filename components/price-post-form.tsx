"use client";

import { useState } from "react";
import type { FuelType, GasStationInput } from "@/lib/types";
import { FUEL_TYPE_LABELS } from "@/lib/types";

interface PricePostFormProps {
  userLocation: { lat: number; lng: number } | null;
  onSubmit: (data: GasStationInput) => Promise<void>;
  onClose: () => void;
}

export default function PricePostForm({
  userLocation,
  onSubmit,
  onClose,
}: PricePostFormProps) {
  const [stationName, setStationName] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("regular");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userLocation) {
      setError("Location required. Please allow location access.");
      return;
    }

    if (!stationName.trim()) {
      setError("Please enter a station name");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        station_name: stationName.trim(),
        fuel_type: fuelType,
        price: priceNum,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });

      // Reset form
      setStationName("");
      setPrice("");
      setFuelType("regular");
      onClose();
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Report Gas Price</h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!userLocation && (
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm">
              Please allow location access to submit a price report.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Station Name
            </label>
            <input
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="e.g., Shell, Exxon, Costco"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fuel Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(FUEL_TYPE_LABELS) as FuelType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFuelType(type)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    fuelType === type
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {FUEL_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Price (per gallon)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !userLocation}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Price Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
