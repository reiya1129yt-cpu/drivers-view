import dynamic from "next/dynamic";

// Load AppShell client-only (it uses browser APIs, maps, geolocation etc.)
const AppShell = dynamic(() => import("@/components/app-shell"), { ssr: false });

export default function Home() {
  return <AppShell />;
}
