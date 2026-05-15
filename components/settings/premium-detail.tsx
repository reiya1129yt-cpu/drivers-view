"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Star,
  Ban,
  Heart,
  Bell,
  TrendingUp,
  Gift,
  X,
  Sparkles,
} from "lucide-react";

interface PremiumDetailProps {
  onBack: () => void;
}

export default function PremiumDetail({ onBack }: PremiumDetailProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const benefits = [
    {
      icon: Ban,
      title: "広告なし",
      description: "すべての広告を非表示にして快適に利用",
    },
    {
      icon: Heart,
      title: "お気に入り無制限",
      description: "好きなだけスポットを保存",
    },
    {
      icon: Bell,
      title: "価格アラート通知",
      description: "設定価格を下回ったら即通知",
    },
    {
      icon: TrendingUp,
      title: "AI予測強化",
      description: "より精度の高い価格予測を提供",
    },
    {
      icon: Gift,
      title: "ポイントボーナス",
      description: "投稿ポイントが1.5倍に",
    },
  ];

  const recommendations = [
    "毎日ガソリンを入れる人",
    "少しでも安く入れたい人",
    "広告なしで快適に使いたい人",
  ];

  const handleSubscribe = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-yellow-900/20">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">戻る</span>
          </button>
          <Star className="h-6 w-6 text-yellow-500" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Hero Section */}
        <div className="relative px-6 pt-8 pb-10 text-center">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
          </div>
          
          {/* Crown/Star icon */}
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-600/20 to-yellow-800/20" />
            <Star className="h-12 w-12 text-yellow-500 relative z-10" fill="currentColor" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            プレミアム会員
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-4xl font-bold text-yellow-500">月330円</span>
          </div>

          {/* Coming Soon Notice */}
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-400">この機能は今後のアップデートで開放予定です</span>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="px-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-yellow-500" />
            こんな人におすすめ
          </h2>
          <div className="rounded-xl bg-gradient-to-br from-yellow-900/10 to-transparent border border-yellow-900/20 p-4 space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20">
                  <span className="text-xs text-yellow-500">✓</span>
                </div>
                <span className="text-gray-300">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="px-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-yellow-500" />
            特典一覧
          </h2>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#141414] border border-yellow-900/20 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20">
                    <benefit.icon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
        <button
          onClick={handleSubscribe}
          className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 py-4 font-bold text-black text-lg shadow-lg shadow-yellow-500/20 hover:from-yellow-400 hover:to-orange-400 transition-all"
        >
          月330円で始める
        </button>
        <p className="text-center text-sm text-gray-500 mt-3">
          いつでも解約可能
        </p>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-yellow-900/30 p-6 shadow-2xl">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowComingSoon(false)}
                className="text-gray-500 hover:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/30">
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                Coming Soon
              </h3>
              
              <p className="text-gray-400 mb-6">
                プレミアム会員機能は今後のアップデートで開放予定です
              </p>
              
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full rounded-xl bg-yellow-500/10 border border-yellow-500/30 py-3 font-medium text-yellow-500 hover:bg-yellow-500/20 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
