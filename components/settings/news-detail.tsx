"use client";

import { ArrowLeft, ExternalLink, Calendar, Building } from "lucide-react";

export interface NewsItem {
  id: number;
  tag: string;
  tagColor: string;
  source: string;
  time: string;
  title: string;
  content?: string;
  url?: string;
}

interface NewsDetailProps {
  news: NewsItem;
  onBack: () => void;
}

export default function NewsDetail({ news, onBack }: NewsDetailProps) {
  // Sample content for news articles
  const getContent = (id: number): string => {
    const contents: Record<number, string> = {
      1: `原油価格が2週間ぶりに下落し、ガソリン価格への影響が注目されています。

国際エネルギー機関（IEA）の最新レポートによると、世界的な原油供給の増加と需要の鈍化により、原油価格は前週比で約3%下落しました。

この動きを受けて、国内のガソリン価格も来週以降、若干の値下げが予想されています。ただし、為替レートの変動や精製コストなども考慮する必要があり、実際の店頭価格への反映にはタイムラグが生じる可能性があります。

業界専門家は「原油価格の下落が続けば、レギュラーガソリンで1リットルあたり2〜3円程度の値下げが期待できる」と分析しています。

消費者にとっては朗報ですが、今後の国際情勢や為替動向に注視が必要です。`,
      2: `環境省は、電気自動車（EV）購入補助金を来年度も継続する方針を固めました。

現行の補助金制度では、新車のEV購入に対して最大65万円、プラグインハイブリッド車には最大45万円の補助金が支給されています。

来年度の予算案では、補助金総額として約700億円が計上される見通しで、充電インフラの整備支援も含まれています。

経済産業省との連携により、急速充電器の設置補助も拡充される予定で、高速道路のサービスエリアや主要幹線道路沿いの充電ネットワーク拡大が期待されています。

自動車業界からは「補助金継続は歓迎だが、さらなる増額を望む」との声も上がっています。`,
      3: `中東情勢の緊迫化を受けて、WTI原油先物価格が上昇しています。

地政学的リスクの高まりにより、投資家のリスク回避姿勢が強まり、原油市場は不安定な動きを見せています。

OPEC+の減産方針も相まって、供給面での懸念が価格上昇を後押ししています。

エネルギーアナリストは「中東情勢次第では、原油価格が1バレル90ドルを超える可能性もある」と警告しています。

日本国内のガソリン価格への影響は、2〜3週間後に現れると予想されています。`,
      4: `全国のガソリンスタンドにおけるセルフ式の割合が70%を超えたことが、石油情報センターの調査で明らかになりました。

1998年のセルフ式解禁以来、その割合は年々増加しており、消費者の価格志向の高まりが背景にあります。

セルフ式スタンドは人件費を抑えられるため、フルサービス店と比較して1リットルあたり5〜10円程度安い傾向があります。

一方で、高齢者や女性ドライバーからはフルサービスへの需要も根強く、地域によっては差別化戦略としてフルサービスを維持する店舗も存在します。

業界関係者は「今後もセルフ化は進むが、サービスの多様化も重要」と指摘しています。`,
    };
    return contents[id] || "詳細な情報は現在準備中です。";
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">ニュース詳細</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Tag and meta */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`rounded px-2 py-0.5 text-xs font-medium text-white ${news.tagColor}`}>
            {news.tag}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-4 leading-relaxed">
          {news.title}
        </h2>

        {/* Source and date */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{news.source}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{news.time}</span>
          </div>
        </div>

        {/* Article content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {getContent(news.id)}
          </p>
        </div>

        {/* External link button */}
        <div className="mt-8">
          <a
            href={news.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-card border border-border py-4 font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            <span>元記事を見る</span>
          </a>
        </div>
      </div>
    </div>
  );
}
