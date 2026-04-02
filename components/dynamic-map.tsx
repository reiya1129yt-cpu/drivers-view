"use client";

import dynamic from "next/dynamic";
import type { GasStation } from "@/lib/types";

// Dynamically import the LeafletMap component with SSR disabled
// This is REQUIRED for Leaflet to work in Next.js because:
// 1. Leaflet requires the window object which doesn't exist on the server
// 2. Without this, you'll get "Object is not a constructor" errors
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-muted"
      style={{ minHeight: "400px", height: "100%", width: "100%" }}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <svg
          className="h-8 w-8 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

interface DynamicMapProps {
  center?: [number, number];
  zoom?: number;
  showUserLocation?: boolean;
  stations: GasStation[];
  onLocationFound: (latlng: { lat: number; lng: number }) => void;
  flyToLocation?: [number, number] | null;
  className?: string;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <LeafletMap {...props} />;
}
