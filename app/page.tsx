import AppShell from "@/components/app-shell";

// Force static rendering so Next.js/Turbopack never dispatches an RSC
// router action on HMR env-var reloads. This eliminates the
// "Router action dispatched before initialization" error in Next.js 16.
export const dynamic = "force-static";
export const revalidate = false;

export default function Home() {
  return <AppShell />;
}
