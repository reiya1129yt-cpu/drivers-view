"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import DynamicMap from "@/components/dynamic-map";
import MapHeader from "@/components/map-header";
import PricePostForm from "@/components/price-post-form";
import StationList from "@/components/station-list";
import type { GasStation, GasStationInput } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(
    null
  );

  const {
    data: stations = [],
    error,
    mutate,
  } = useSWR<GasStation[]>("/api/gas-stations", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  const handleLocationFound = useCallback(
    (latlng: { lat: number; lng: number }) => {
      setUserLocation(latlng);
    },
    []
  );

  const handleSubmitPrice = async (data: GasStationInput) => {
    const response = await fetch("/api/gas-stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to submit");
    }

    // Refresh the data
    mutate();
  };

  const handleStationClick = (station: GasStation) => {
    setShowList(false);
    setFlyToLocation([station.latitude, station.longitude]);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <MapHeader
        onAddClick={() => setShowAddForm(true)}
        onListClick={() => setShowList(true)}
        stationCount={stations.length}
      />

      <div className="flex-1 relative">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-2">
                Failed to load stations
              </p>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <DynamicMap
            center={[35.6762, 139.6503]}
            zoom={12}
            showUserLocation={true}
            stations={stations}
            onLocationFound={handleLocationFound}
            flyToLocation={flyToLocation}
            className="absolute inset-0"
          />
        )}
      </div>

      {showAddForm && (
        <PricePostForm
          userLocation={userLocation}
          onSubmit={handleSubmitPrice}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showList && (
        <StationList
          stations={stations}
          userLocation={userLocation}
          onStationClick={handleStationClick}
          onClose={() => setShowList(false)}
        />
      )}
    </main>
  );
}
