"use client";

import { ArrowLeft, Bell, TrendingDown, FileText, AlertTriangle, Car, ToggleRight, ToggleLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { getSettings, saveSettings, type AppSettings } from "@/lib/settings";
import { t, type Language } from "@/lib/i18n";

interface NotificationSettingsProps {
  onBack: () => void;
  language: Language;
}

const notificationOptions = [
  { key: "priceChange" as const, icon: Bell, labelKey: "notifications.priceChange" },
  { key: "cheapest" as const, icon: TrendingDown, labelKey: "notifications.cheapest" },
  { key: "newPost" as const, icon: FileText, labelKey: "notifications.newPost" },
  { key: "paSaCongestion" as const, icon: AlertTriangle, labelKey: "notifications.paSaCongestion" },
  { key: "carCommunity" as const, icon: Car, labelKey: "notifications.carCommunity" },
];

export default function NotificationSettings({ onBack, language }: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState<AppSettings["notifications"]>({
    priceChange: true,
    cheapest: true,
    newPost: true,
    paSaCongestion: false,
    carCommunity: true,
  });
  const [priceAlert, setPriceAlert] = useState(true);

  useEffect(() => {
    const settings = getSettings();
    setNotifications(settings.notifications);
    setPriceAlert(settings.priceAlert);
  }, []);

  const handleToggle = (key: keyof AppSettings["notifications"]) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    saveSettings({ notifications: updated });
  };

  const handlePriceAlertToggle = () => {
    const newValue = !priceAlert;
    setPriceAlert(newValue);
    saveSettings({ priceAlert: newValue });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t("notifications.title", language)}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Notification toggles */}
        <div className="rounded-xl bg-card border border-border overflow-hidden mb-4">
          {notificationOptions.map((option, index) => (
            <div
              key={option.key}
              className={`flex items-center justify-between px-4 py-4 ${
                index < notificationOptions.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <option.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">
                  {t(option.labelKey, language)}
                </span>
              </div>
              <button onClick={() => handleToggle(option.key)} className="text-primary">
                {notifications[option.key] ? (
                  <ToggleRight className="h-8 w-8" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Price Alert */}
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("notifications.priceAlert", language)}</h3>
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{t("more.priceAlert", language)}</p>
                <p className="text-xs text-muted-foreground">{t("more.priceAlertDesc", language)}</p>
              </div>
            </div>
            <button onClick={handlePriceAlertToggle} className="text-primary">
              {priceAlert ? (
                <ToggleRight className="h-8 w-8" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
