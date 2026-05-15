"use client";

import { ArrowLeft, Check, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/lib/settings";
import { LANGUAGE_LABELS, type Language } from "@/lib/i18n";

interface LanguageSettingsProps {
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
}

const languages: Language[] = ["ja", "en", "zh", "ko", "es"];

export default function LanguageSettings({ onBack, onLanguageChange }: LanguageSettingsProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("ja");

  useEffect(() => {
    const settings = getSettings();
    setSelectedLanguage(settings.language);
  }, []);

  const handleSelect = (lang: Language) => {
    setSelectedLanguage(lang);
    saveSettings({ language: lang });
    onLanguageChange(lang);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">言語 / Language</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4">
          言語を選択してください / Select your language
        </p>

        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {languages.map((lang, index) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors ${
                index < languages.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">
                  {LANGUAGE_LABELS[lang]}
                </span>
              </div>
              {selectedLanguage === lang && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
