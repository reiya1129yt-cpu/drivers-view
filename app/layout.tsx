import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://drivers-view.vercel.app";

export const metadata: Metadata = {
  title: "Driver's View - ガソリン価格マップ",
  description:
    "周辺のガソリンスタンド、PA/SA、EV充電スポットを検索。燃料価格の確認と投稿ができる日本のドライバー向けアプリ。リアルタイム価格情報とナビゲーション機能。",
  keywords: [
    "ガソリン価格",
    "燃料価格",
    "ガソリンスタンド",
    "EV充電",
    "PA",
    "SA",
    "サービスエリア",
    "パーキングエリア",
    "ナビゲーション",
    "ドライバー",
    "運転",
    "日本",
  ],
  authors: [{ name: "Driver's View" }],
  creator: "Driver's View",
  publisher: "Driver's View",
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: APP_URL,
    siteName: "Driver's View",
    title: "Driver's View - ガソリン価格マップ",
    description:
      "周辺のガソリンスタンド、PA/SA、EV充電スポットを検索。燃料価格の確認と投稿ができる日本のドライバー向けアプリ。",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Driver's View - ガソリン価格マップ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Driver's View - ガソリン価格マップ",
    description:
      "周辺のガソリンスタンド、PA/SA、EV充電スポットを検索。燃料価格の確認と投稿ができる日本のドライバー向けアプリ。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/icons/icon-512x512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/apple-touch-icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Driver's View",
    startupImage: [
      {
        url: "/icons/icon-512x512.jpg",
        media: "(device-width: 390px) and (device-height: 844px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#0a1628",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1628",
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full bg-background dark`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* PWA splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.jpg" />
      </head>
      <body className="h-full font-sans antialiased overscroll-none">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
