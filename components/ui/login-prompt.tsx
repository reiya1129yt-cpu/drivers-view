"use client";

import { X, MessageSquare, Heart, Bell, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { t, type Language } from "@/lib/i18n";
import { dismissLoginPrompt } from "@/lib/settings";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

const features = [
  { icon: MessageSquare, key: "login.feature.comment" },
  { icon: Heart, key: "login.feature.favorite" },
  { icon: Bell, key: "login.feature.priceAlert" },
  { icon: TrendingUp, key: "login.feature.aiPrediction" },
];

export default function LoginPrompt({ isOpen, onClose, language = "ja" }: LoginPromptProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleClose = () => {
    dismissLoginPrompt();
    onClose();
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-2 pr-8">
          {t("login.features", language)}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("login.description", language)}
        </p>

        {/* Features list */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">
                {t(feature.key, language)}
              </span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-primary py-4 font-bold text-primary-foreground mb-3"
        >
          {t("login.loginRegister", language)}
        </button>

        {/* Not now link */}
        <button
          onClick={handleClose}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {t("login.notNow", language)}
        </button>
      </div>
    </div>
  );
}
