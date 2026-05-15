"use client";

import type { Language } from "./i18n";

export type Region = "kanto" | "kansai" | "chubu" | "tohoku" | "kyushu" | "hokkaido" | "chugoku" | "shikoku";

export const REGION_LABELS: Record<Region, Record<Language, string>> = {
  kanto: { ja: "関東エリア", en: "Kanto Area", zh: "关东地区", ko: "간토 지역", es: "Área de Kanto" },
  kansai: { ja: "関西エリア", en: "Kansai Area", zh: "关西地区", ko: "간사이 지역", es: "Área de Kansai" },
  chubu: { ja: "中部エリア", en: "Chubu Area", zh: "中部地区", ko: "주부 지역", es: "Área de Chubu" },
  tohoku: { ja: "東北エリア", en: "Tohoku Area", zh: "东北地区", ko: "도호쿠 지역", es: "Área de Tohoku" },
  kyushu: { ja: "九州エリア", en: "Kyushu Area", zh: "九州地区", ko: "규슈 지역", es: "Área de Kyushu" },
  hokkaido: { ja: "北海道エリア", en: "Hokkaido Area", zh: "北海道地区", ko: "홋카이도 지역", es: "Área de Hokkaido" },
  chugoku: { ja: "中国エリア", en: "Chugoku Area", zh: "中国地区", ko: "주고쿠 지역", es: "Área de Chugoku" },
  shikoku: { ja: "四国エリア", en: "Shikoku Area", zh: "四国地区", ko: "시코쿠 지역", es: "Área de Shikoku" },
};

export interface AppSettings {
  language: Language;
  region: Region;
  notifications: {
    priceChange: boolean;
    cheapest: boolean;
    newPost: boolean;
    paSaCongestion: boolean;
    carCommunity: boolean;
  };
  priceAlert: boolean;
  loginPromptDismissed: boolean;
  loginPromptDismissedAt: number | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: "ja",
  region: "kanto",
  notifications: {
    priceChange: true,
    cheapest: true,
    newPost: true,
    paSaCongestion: false,
    carCommunity: true,
  },
  priceAlert: true,
  loginPromptDismissed: false,
  loginPromptDismissedAt: null,
};

const STORAGE_KEY = "drivers_view_settings";

// Check if we're in the browser
const isBrowser = typeof window !== "undefined";

export function getSettings(): AppSettings {
  if (!isBrowser) return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Failed to parse settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  if (!isBrowser) return DEFAULT_SETTINGS;
  
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save settings:", e);
    return getSettings();
  }
}

export function updateNotificationSetting(key: keyof AppSettings["notifications"], value: boolean): AppSettings {
  const settings = getSettings();
  settings.notifications[key] = value;
  return saveSettings(settings);
}

export function dismissLoginPrompt(): void {
  saveSettings({
    loginPromptDismissed: true,
    loginPromptDismissedAt: Date.now(),
  });
}

export function shouldShowLoginPrompt(): boolean {
  if (!isBrowser) return false;
  
  const settings = getSettings();
  
  // If not dismissed, show it
  if (!settings.loginPromptDismissed) return true;
  
  // If dismissed more than 7 days ago, show again
  if (settings.loginPromptDismissedAt) {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - settings.loginPromptDismissedAt > sevenDays) {
      return true;
    }
  }
  
  return false;
}
