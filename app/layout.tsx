import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/sw-registrar";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
        <Script id="router-error-guard" strategy="beforeInteractive">{`
          (function(){
            var MSG = "Router action dispatched before initialization";
            window.addEventListener("error", function(e){
              if(e && e.message && e.message.indexOf(MSG) !== -1){
                e.preventDefault(); e.stopImmediatePropagation();
                setTimeout(function(){ window.location.reload(); }, 400);
              }
            }, true);
            window.addEventListener("unhandledrejection", function(e){
              var m = e.reason && e.reason.message ? e.reason.message : String(e.reason||"");
              if(m.indexOf(MSG) !== -1){ e.preventDefault(); setTimeout(function(){ window.location.reload(); }, 400); }
            });
          })();
        `}</Script>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
