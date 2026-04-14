import type { AppProps } from "next/app";
import { Noto_Sans_JP } from "next/font/google";
import "@/app/globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={notoSansJP.className}>
      <Component {...pageProps} />
    </main>
  );
}
