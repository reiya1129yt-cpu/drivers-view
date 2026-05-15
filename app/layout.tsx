import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Driver&apos;s View - ガソリン価格マップ",
  description:
    "周辺のガソリンスタンド、PA/SA、EV充電スポットを検索。燃料価格の確認と投稿ができる日本の運転者向けアプリ。",
  keywords: [
    "ガソリン価格",
    "燃料価格",
    "ガソリンスタンド",
    "EV充電",
    "PA",
    "SA",
    "ナビゲーション",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full bg-background`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
