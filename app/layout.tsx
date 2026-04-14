import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/sw-registrar";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Force static so HMR env-var reloads never trigger an RSC dispatch.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Drivers View - ガソリン価格マップ",
  description: "近くのガソリンスタンドの価格をリアルタイムで確認・投稿できるアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Drivers View",
  },
  icons: {
    apple: "/icon-192.jpg",
    icon: "/icon-512.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.className} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
