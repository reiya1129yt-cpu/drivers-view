"use client";

import { ArrowLeft, Check, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { getSettings, saveSettings, type Region, REGION_LABELS } from "@/lib/settings";
import type { Language } from "@/lib/i18n";

interface RegionSettingsProps {
  onBack: () => void;
  language: Language;
}

const regions: Region[] = ["kanto", "kansai", "chubu", "tohoku", "kyushu", "hokkaido", "chugoku", "shikoku"];

export default function RegionSettings({ onBack, language }: RegionSettingsProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region>("kanto");

  useEffect(() => {
    const settings = getSettings();
    setSelectedRegion(settings.region);
  }, []);

  const handleSelect = (region: Region) => {
    setSelectedRegion(region);
    saveSettings({ region });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">表示地域</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          表示するエリアを選択してください。選択したエリアの情報が優先的に表示されます。
        </p>

        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {regions.map((region, index) => (
            <button
              key={region}
              onClick={() => handleSelect(region)}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors ${
                index < regions.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">
                  {REGION_LABELS[region][language]}
                </span>
              </div>
              {selectedRegion === region && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
