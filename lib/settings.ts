"use client";

import type { Language } from "./i18n";

export type Region = "all" | "hokkaido" | "tohoku" | "kanto" | "chubu" | "kansai" | "chugoku" | "shikoku" | "kyushu" | "okinawa";

export const REGION_LABELS: Record<Region, Record<Language, string>> = {
  all: { ja: "全国", en: "All Japan", zh: "全国", ko: "전국", es: "Todo Japón" },
  hokkaido: { ja: "北海道", en: "Hokkaido", zh: "北海道", ko: "홋카이도", es: "Hokkaido" },
  tohoku: { ja: "東北", en: "Tohoku", zh: "东北", ko: "도호쿠", es: "Tohoku" },
  kanto: { ja: "関東", en: "Kanto", zh: "关东", ko: "간토", es: "Kanto" },
  chubu: { ja: "中部", en: "Chubu", zh: "中部", ko: "주부", es: "Chubu" },
  kansai: { ja: "関西", en: "Kansai", zh: "关西", ko: "간사이", es: "Kansai" },
  chugoku: { ja: "中国", en: "Chugoku", zh: "中国地区", ko: "주고쿠", es: "Chugoku" },
  shikoku: { ja: "四国", en: "Shikoku", zh: "四国", ko: "시코쿠", es: "Shikoku" },
  kyushu: { ja: "九州", en: "Kyushu", zh: "九州", ko: "규슈", es: "Kyushu" },
  okinawa: { ja: "沖縄", en: "Okinawa", zh: "冲绳", ko: "오키나와", es: "Okinawa" },
};

// Region center coordinates for map
export const REGION_CENTERS: Record<Region, { lat: number; lng: number; zoom: number }> = {
  all: { lat: 36.5, lng: 138.0, zoom: 5 },
  hokkaido: { lat: 43.06, lng: 141.35, zoom: 7 },
  tohoku: { lat: 39.7, lng: 140.1, zoom: 7 },
  kanto: { lat: 35.69, lng: 139.69, zoom: 8 },
  chubu: { lat: 35.18, lng: 136.91, zoom: 7 },
  kansai: { lat: 34.69, lng: 135.50, zoom: 8 },
  chugoku: { lat: 34.40, lng: 132.46, zoom: 7 },
  shikoku: { lat: 33.84, lng: 133.54, zoom: 8 },
  kyushu: { lat: 33.59, lng: 130.40, zoom: 7 },
  okinawa: { lat: 26.21, lng: 127.68, zoom: 9 },
};

// Prefecture list for each region
export const PREFECTURES: Record<Region, string[]> = {
  all: [],
  hokkaido: ["北海道"],
  tohoku: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  kanto: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  chubu: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  kansai: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  chugoku: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  shikoku: ["徳島県", "香川県", "愛媛県", "高知県"],
  kyushu: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県"],
  okinawa: ["沖縄県"],
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
