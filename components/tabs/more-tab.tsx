"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  MapPin,
  Globe,
  Info,
  TrendingUp,
  Star,
  Clock,
  ToggleRight,
  ToggleLeft,
  Lock,
} from "lucide-react";
import type { Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getSettings, saveSettings, REGION_LABELS, type Region } from "@/lib/settings";
import { t, LANGUAGE_LABELS, type Language } from "@/lib/i18n";
import RegionSettings from "@/components/settings/region-settings";
import LanguageSettings from "@/components/settings/language-settings";
import NotificationSettings from "@/components/settings/notification-settings";
import AboutPage from "@/components/settings/about-page";
import NewsDetail, { type NewsItem } from "@/components/settings/news-detail";
import PremiumDetail from "@/components/settings/premium-detail";
import LoginPrompt from "@/components/ui/login-prompt";

interface MoreTabProps {
  user: { email: string; id: string } | null;
  profile: Profile | null;
}

type SettingsPage = "main" | "region" | "language" | "notifications" | "about" | "news" | "premium";

// Mock news data
const newsItems: NewsItem[] = [
  {
    id: 1,
    tag: "価格動向",
    tagColor: "bg-red-500",
    source: "日経エネルギー",
    time: "2時間前",
    title: "原油価格が2週間ぶりに下落、ガソリン価格にも影響か",
  },
  {
    id: 2,
    tag: "政策",
    tagColor: "bg-blue-500",
    source: "エコ自動車ニュース",
    time: "5時間前",
    title: "環境省、EV補助金を来年度も継続へ",
  },
  {
    id: 3,
    tag: "原油",
    tagColor: "bg-orange-500",
    source: "石油情報センター",
    time: "昨日",
    title: "中東情勢の緊迫でWTI原油が上昇",
  },
  {
    id: 4,
    tag: "業界",
    tagColor: "bg-green-500",
    source: "業界レポート",
    time: "2日前",
    title: "セルフスタンドの割合が全国で70%超え",
  },
];

// Mock AI price predictions
const pricePredictions = [
  { period: "今週", price: 168, change: 0, color: "text-foreground" },
  { period: "来週", price: 172, change: 4, color: "text-red-400" },
  { period: "再来週", price: 169, change: -3, color: "text-green-400" },
  { period: "1ヶ月後", price: 164, change: -8, color: "text-green-400" },
];

export default function MoreTab({ user, profile }: MoreTabProps) {
  const router = useRouter();
  const [priceAlert, setPriceAlert] = useState(true);
  const [currentPage, setCurrentPage] = useState<SettingsPage>("main");
  const [language, setLanguage] = useState<Language>("ja");
  const [region, setRegion] = useState(REGION_LABELS.kanto.ja);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setLanguage(settings.language);
    setPriceAlert(settings.priceAlert);
    setRegion(REGION_LABELS[settings.region][settings.language]);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const getAvatarLetter = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0);
    }
    return "U";
  };

  const handlePriceAlertToggle = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    const newValue = !priceAlert;
    setPriceAlert(newValue);
    saveSettings({ priceAlert: newValue });
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    const settings = getSettings();
    setRegion(REGION_LABELS[settings.region][lang]);
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(REGION_LABELS[newRegion][language]);
  };

  const handleNewsClick = (news: NewsItem) => {
    setSelectedNews(news);
    setCurrentPage("news");
  };

  const handleAIPredictionClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    // Already logged in, do nothing special
  };

  // Show settings pages
  if (currentPage === "region") {
    return <RegionSettings onBack={() => setCurrentPage("main")} language={language} onRegionChange={handleRegionChange} />;
  }

  if (currentPage === "language") {
    return <LanguageSettings onBack={() => setCurrentPage("main")} onLanguageChange={handleLanguageChange} />;
  }

  if (currentPage === "notifications") {
    if (!user) {
      return (
        <div className="flex flex-col h-full bg-background">
          {/* Header with back button */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button 
              onClick={() => setCurrentPage("main")} 
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">通知設定</h1>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <Lock className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">ログインが必要です</p>
            <p className="text-sm text-muted-foreground text-center mb-6">通知設定を利用するにはログインしてください</p>
            <a href="/auth/login" className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">
              ログイン
            </a>
          </div>
        </div>
      );
    }
    return <NotificationSettings onBack={() => setCurrentPage("main")} language={language} />;
  }

  if (currentPage === "about") {
    return <AboutPage onBack={() => setCurrentPage("main")} language={language} />;
  }

  if (currentPage === "news" && selectedNews) {
    return <NewsDetail news={selectedNews} onBack={() => { setCurrentPage("main"); setSelectedNews(null); }} />;
  }

  if (currentPage === "premium") {
    return <PremiumDetail onBack={() => setCurrentPage("main")} />;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      <div className="p-4">
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-4">{t("more.title", language)}</h1>

        {/* User Profile Card */}
        {user ? (
          <div className="rounded-xl bg-card border border-border p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {getAvatarLetter()}
                </div>
                <div>
                  <h2 className="font-bold text-foreground">
                    {profile?.display_name || "ユーザー"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{region}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-card border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {t("more.logout", language)}
              </button>
            </div>

            {/* Points Section */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("more.points", language)}</p>
                  <p className="text-xs text-muted-foreground">{t("more.pointsHistory", language)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{profile?.points || 0}</span>
                <span className="text-primary">pt</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-card border border-border p-6 mb-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">?</span>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t("more.notLoggedIn", language)}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("more.loginPrompt", language)}
            </p>
            <a
              href="/auth/login"
              className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground"
            >
              {t("more.login", language)}
            </a>
          </div>
        )}

        {/* Premium Card */}
        {user && !profile?.is_premium && (
          <button
            onClick={() => setCurrentPage("premium")}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 p-4 mb-4 text-left hover:from-yellow-900/40 hover:to-orange-900/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-bold text-yellow-400">{t("more.premium", language)}</p>
                  <p className="text-xs text-yellow-600">{t("more.premiumDesc", language)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">330円/月</span>
                <span className="text-xs text-yellow-500">他にも特典あり</span>
                <ChevronRight className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </button>
        )}

        {/* AI Gas Price Prediction */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("more.aiPrediction", language)}</h3>
          <button
            onClick={handleAIPredictionClick}
            className={`w-full rounded-xl bg-card border border-border p-4 text-left ${!user ? "relative" : ""}`}
          >
            {!user && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">ログインで利用可能</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">レギュラーガソリン予測</p>
                <p className="text-xs text-muted-foreground">{t("more.aiPredictionDesc", language)}</p>
              </div>
            </div>

            {/* Price Chart */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {pricePredictions.map((pred, index) => (
                <div key={index} className="text-center">
                  <p className={`text-xl font-bold ${pred.color}`}>¥{pred.price}</p>
                  <div className={`h-0.5 mt-1 mb-2 ${
                    pred.change > 0 ? "bg-red-400" : pred.change < 0 ? "bg-green-400" : "bg-muted-foreground"
                  }`} />
                  <p className="text-xs text-muted-foreground">{pred.period}</p>
                  <p className={`text-xs font-medium ${pred.color}`}>
                    {pred.change > 0 ? `+${pred.change}円` : pred.change < 0 ? `${pred.change}円` : "±0円"}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              ※ 予測は過去データと原油先物指標に基づく参考値です。実際の価格と異なる場合があります。
            </p>
          </button>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("more.notifications", language)}</h3>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            {/* Notification Center */}
            <button
              onClick={() => setCurrentPage("notifications")}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{t("more.notificationCenter", language)}</p>
                  <p className="text-xs text-muted-foreground">{t("more.unread", language)} 2件</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>

            {/* Price Alert Toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t("more.priceAlert", language)}</p>
                  <p className="text-xs text-muted-foreground">{t("more.priceAlertDesc", language)}</p>
                </div>
              </div>
              <button
                onClick={handlePriceAlertToggle}
                className="text-primary"
              >
                {priceAlert ? (
                  <ToggleRight className="h-8 w-8" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gasoline News Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("more.news", language)}</h3>
          <div className="space-y-3">
            {newsItems.map((news) => (
              <button
                key={news.id}
                onClick={() => handleNewsClick(news)}
                className="w-full rounded-xl bg-card border border-border p-4 text-left hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium text-white ${news.tagColor}`}>
                    {news.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <span className="text-xs text-muted-foreground">・</span>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </div>
                <p className="font-medium text-foreground leading-snug">{news.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("more.settings", language)}</h3>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <button
              onClick={() => setCurrentPage("region")}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{t("more.region", language)}</p>
                  <p className="text-xs text-muted-foreground">{region}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setCurrentPage("language")}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{t("more.language", language)}</p>
                  <p className="text-xs text-muted-foreground">{LANGUAGE_LABELS[language]}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setCurrentPage("about")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{t("more.about", language)}</p>
                  <p className="text-xs text-muted-foreground">{t("more.version", language)} 1.0.0</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        language={language}
      />
    </div>
  );
}
