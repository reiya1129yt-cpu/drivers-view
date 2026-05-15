"use client";

import { ArrowLeft, ChevronRight, FileText, Shield, Mail, ExternalLink } from "lucide-react";
import { t, type Language } from "@/lib/i18n";

interface AboutPageProps {
  onBack: () => void;
  language: Language;
}

export default function AboutPage({ onBack, language }: AboutPageProps) {
  const links = [
    { icon: FileText, label: t("settings.terms", language), url: "#" },
    { icon: Shield, label: t("settings.privacy", language), url: "#" },
    { icon: Mail, label: t("settings.contact", language), url: "#" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t("settings.about", language)}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* App Info */}
        <div className="flex flex-col items-center py-8 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary mb-4">
            <span className="text-3xl font-bold text-primary-foreground">DV</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {t("settings.appName", language)}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">
            {t("settings.description", language)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("more.version", language)} 1.0.0
          </p>
        </div>

        {/* Links */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className={`flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors ${
                index < links.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">{link.label}</span>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2024 Driver&apos;s View. All rights reserved.
        </p>
      </div>
    </div>
  );
}
