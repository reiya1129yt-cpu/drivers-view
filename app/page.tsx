"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import Header from "@/components/layout/header";
import FilterBar from "@/components/ui/filter-bar";
import SearchBar from "@/components/ui/search-bar";
import PlaceList from "@/components/place/place-list";
import PlaceDetail from "@/components/place/place-detail";
import { Loader2 } from "lucide-react";
import type { PlaceWithPrices, PlaceType, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

// Default to Tokyo if geolocation fails
const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [bounds, setBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<PlaceType[]>([
    "gas_station",
    "pa_sa",
    "ev_charging",
  ]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithPrices | null>(
    null
  );
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Build URL for fetching places
  const placesUrl = bounds
    ? `/api/places?north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}&types=${selectedTypes.join(",")}`
    : null;

  const { data, mutate } = useSWR<{ places: PlaceWithPrices[] }>(
    placesUrl,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  const places = data?.places || [];

  // Get user session and profile
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({ email: authUser.email || "" });

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
    };

    getUser();
  }, []);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setCenter(newCenter);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  const handleBoundsChange = useCallback(
    (newBounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    }) => {
      setBounds(newBounds);
    },
    []
  );

  const handleTypeToggle = useCallback((type: PlaceType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        // Don't allow deselecting all
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    // Use Nominatim for geocoding (free, but has rate limits)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=jp&limit=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        setCenter([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  }, []);

  const handleNavigate = useCallback((place: PlaceWithPrices) => {
    // Open navigation in Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=driving`;
    window.open(url, "_blank");
  }, []);

  const handlePricePosted = useCallback(() => {
    // Refresh places and profile
    mutate();
    
    // Refresh profile to update points
    const refreshProfile = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
    };
    
    refreshProfile();
  }, [mutate]);

  return (
    <div className="flex h-full flex-col">
      <Header user={user} profile={profile} />

      <div className="relative flex-1">
        {/* Search and Filter Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 space-y-3">
          <SearchBar
            onSearch={handleSearch}
            onLocate={getUserLocation}
            isLocating={isLocating}
          />
          <FilterBar selectedTypes={selectedTypes} onToggle={handleTypeToggle} />
        </div>

        {/* Map */}
        <div className="absolute inset-0">
          <MapView
            places={places}
            center={center}
            onBoundsChange={handleBoundsChange}
            onPlaceSelect={setSelectedPlace}
            selectedTypes={selectedTypes}
          />
        </div>

        {/* Place List */}
        <PlaceList
          places={places}
          userLocation={center}
          onNavigate={handleNavigate}
          onShowDetail={setSelectedPlace}
          isExpanded={isListExpanded}
          onToggleExpand={() => setIsListExpanded(!isListExpanded)}
        />

        {/* Place Detail Modal */}
        {selectedPlace && (
          <PlaceDetail
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            onNavigate={handleNavigate}
            isLoggedIn={!!user}
            onPricePosted={handlePricePosted}
          />
        )}
      </div>
    </div>
  );
}
