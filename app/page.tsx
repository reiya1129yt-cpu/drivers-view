"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import Header from "@/components/layout/header";
import BottomNav, { TabType } from "@/components/layout/bottom-nav";
import FilterBar from "@/components/ui/filter-bar";
import AdBanner from "@/components/ui/ad-banner";
import PlaceList from "@/components/place/place-list";
import PlaceDetail from "@/components/place/place-detail";
import PricePostModal from "@/components/place/price-post-modal";
import PostTypeSelector from "@/components/post/post-type-selector";
import CarPostForm from "@/components/post/car-post-form";
import GatheringPostForm from "@/components/post/gathering-post-form";
import PostTab from "@/components/tabs/post-tab";
import MyPage from "@/components/profile/my-page";
import type { CommunityPostType } from "@/lib/types";
import MoreTab from "@/components/tabs/more-tab";
import { Loader2, MapPin } from "lucide-react";
import type { PlaceWithPrices, PlaceType, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import LoginPrompt from "@/components/ui/login-prompt";
import { shouldShowLoginPrompt, getSettings } from "@/lib/settings";
import type { Language } from "@/lib/i18n";

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
  const [activeTab, setActiveTab] = useState<TabType>("map");
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
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showPostTypeSelector, setShowPostTypeSelector] = useState(false);
  const [showCarPostForm, setShowCarPostForm] = useState(false);
  const [showGatheringPostForm, setShowGatheringPostForm] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [language, setLanguage] = useState<Language>("ja");

  // Build URL for fetching places
  const placesUrl = bounds
    ? `/api/places?north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}&types=${selectedTypes.join(",")}`
    : null;

  const { data, mutate, isLoading } = useSWR<{ places: PlaceWithPrices[] }>(
    placesUrl,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
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
        setUser({ email: authUser.email || "", id: authUser.id });

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      } else {
        // Show login prompt for guest users after a short delay
        setTimeout(() => {
          if (shouldShowLoginPrompt()) {
            setShowLoginPrompt(true);
          }
        }, 2000);
      }
    };

    // Load language settings
    const settings = getSettings();
    setLanguage(settings.language);

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
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  const handleNavigate = useCallback((place: PlaceWithPrices) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=driving`;
    window.open(url, "_blank");
  }, []);

  const handleOpenPostForm = useCallback(() => {
    if (user) {
      setShowPostTypeSelector(true);
    } else {
      window.location.href = "/auth/login";
    }
  }, [user]);

  const handleSelectPostType = useCallback((type: CommunityPostType) => {
    setShowPostTypeSelector(false);
    if (type === "price") {
      setShowPriceModal(true);
    } else if (type === "car") {
      setShowCarPostForm(true);
    } else if (type === "gathering") {
      setShowGatheringPostForm(true);
    }
  }, []);

  const handlePricePosted = useCallback(() => {
    mutate();
    
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

      {/* Main Content Area */}
      <div className="relative flex-1 pb-14">
        {activeTab === "map" && (
          <>
            {/* Filter Controls at Top */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3">
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

            {/* Current Location Button */}
            <button
              onClick={getUserLocation}
              disabled={isLocating}
              className="absolute bottom-48 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-lg border border-border transition-colors hover:bg-secondary disabled:opacity-50"
              title="現在地を取得"
            >
              {isLocating ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
            </button>

            {/* Ad Banner above place list */}
            <div className="absolute bottom-[8.5rem] left-3 right-3 z-20">
              <AdBanner placement="bottom" />
            </div>

            {/* Place List */}
            <PlaceList
              places={places}
              userLocation={center}
              onNavigate={handleNavigate}
              onShowDetail={setSelectedPlace}
              isExpanded={isListExpanded}
              onToggleExpand={() => setIsListExpanded(!isListExpanded)}
              isLoading={isLoading}
            />
          </>
        )}

        {activeTab === "post" && !showMyPage && (
          <PostTab
            user={user}
            profile={profile}
            places={places}
            userLocation={center}
            onPricePosted={handlePricePosted}
            onOpenPostForm={handleOpenPostForm}
            onOpenMyPage={() => setShowMyPage(true)}
          />
        )}

        {activeTab === "post" && showMyPage && user && (
          <MyPage
            user={user}
            profile={profile}
            onBack={() => setShowMyPage(false)}
            onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
          />
        )}

        {activeTab === "more" && (
          <MoreTab user={user} profile={profile} />
        )}

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

        {/* Post Type Selector */}
        <PostTypeSelector
          isOpen={showPostTypeSelector}
          onClose={() => setShowPostTypeSelector(false)}
          onSelectType={handleSelectPostType}
        />

        {/* Price Post Modal */}
        {user && (
          <PricePostModal
            isOpen={showPriceModal}
            onClose={() => setShowPriceModal(false)}
            places={places}
            userLocation={center}
            userId={user.id}
            onSuccess={handlePricePosted}
          />
        )}

        {/* Car Post Form */}
        {user && (
          <CarPostForm
            isOpen={showCarPostForm}
            onClose={() => setShowCarPostForm(false)}
            userId={user.id}
            onSuccess={handlePricePosted}
          />
        )}

        {/* Gathering Post Form */}
        {user && (
          <GatheringPostForm
            isOpen={showGatheringPostForm}
            onClose={() => setShowGatheringPostForm(false)}
            userId={user.id}
            onSuccess={handlePricePosted}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Login Prompt for Guest Users */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        language={language}
      />
    </div>
  );
}
