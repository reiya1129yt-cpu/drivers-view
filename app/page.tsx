import DynamicMap from "@/components/dynamic-map";
import MapHeader from "@/components/map-header";

export default function Home() {
  // Example markers - you can customize these
  const markers = [
    {
      position: [35.6762, 139.6503] as [number, number],
      popup: "Tokyo Station",
    },
    {
      position: [35.6586, 139.7454] as [number, number],
      popup: "Tokyo Tower",
    },
    {
      position: [35.7101, 139.8107] as [number, number],
      popup: "Tokyo Skytree",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <MapHeader />
      <div className="flex-1 relative">
        <DynamicMap
          center={[35.6762, 139.6503]}
          zoom={12}
          showUserLocation={true}
          markers={markers}
          className="absolute inset-0"
        />
      </div>
    </main>
  );
}
