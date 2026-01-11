import { useState, useEffect } from "react";
import { useLocations } from "./hooks/useLocations";
import { useAuth } from "./contexts/AuthContext";
import { Map } from "./components/Map";
import { LocationList } from "./components/LocationList";
import { DetailsPanel } from "./components/DetailsPanel";
import { StudyLocation } from "./types/location";
import { QRScanner } from "./components/QRScanner";
import { Dashboard } from "./components/Dashboard";
import { Profile } from "./components/Profile";

type View = "explore" | "scan" | "profile" | "admin";

function App() {
  const { isAdmin } = useAuth();
  const [locationLimit, setLocationLimit] = useState<number>(10);
  const {
    data: locations = [],
    isLoading,
    refetch,
  } = useLocations(locationLimit);
  const [selectedLocation, setSelectedLocation] = useState<
    StudyLocation | undefined
  >();
  const [currentView, setCurrentView] = useState<View>("explore");
  const [showMap, setShowMap] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigation State
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [navDestination, setNavDestination] = useState<StudyLocation | null>(
    null
  );
  const [travelMode, setTravelMode] = useState<"car" | "bike" | "foot">("foot");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        console.log("Service worker registration skipped");
      });
    }

    // Initial location fetch
    fetchUserLocation();
  }, []);

  const fetchUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Fallback or IP based location could go here, but for now we just don't set it
        }
      );
    }
  };

  const startNavigation = (mode: "car" | "bike" | "foot") => {
    if (!selectedLocation) return;

    setTravelMode(mode);
    setNavDestination(selectedLocation);

    // Ensure we have user location
    if (!userLocation) {
      fetchUserLocation();
    }

    // On mobile, show map to see route
    if (window.innerWidth < 768) {
      setShowMap(true);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case "scan":
        return (
          <QRScanner
            onCheckInSuccess={() => setCurrentView("profile")}
            onClose={() => setCurrentView("explore")}
          />
        );
      case "profile":
        return <Profile />;
      case "admin":
        return isAdmin ? <Dashboard /> : <Profile />; // Redirect to profile if not admin
      case "explore":
      default:
        return (
          <div className="flex w-full h-full">
            <div
              className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden ${
                showMap ? "hidden md:flex" : "flex"
              }`}
            >
              <LocationList
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => {
                  setSelectedLocation(loc);
                  if (window.innerWidth < 768) setShowMap(true);
                }}
                isLoading={isLoading}
              />
            </div>

            <div
              className={`flex-1 flex h-full overflow-hidden ${
                !showMap ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="flex-1 overflow-hidden relative">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Map
                      locations={locations}
                      onLocationSelect={setSelectedLocation}
                      destination={navDestination}
                      userLocation={userLocation}
                      travelMode={travelMode}
                    />
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="md:hidden absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium text-primary-600 z-[1000]"
                    >
                      {showMap ? "Show List" : "Show Map"}
                    </button>
                  </>
                )}
              </div>

              <div className="w-96 bg-white border-l border-gray-200 hidden lg:flex flex-col overflow-y-auto">
                <DetailsPanel
                  location={selectedLocation}
                  isLoading={isLoading}
                  onNavigate={startNavigation}
                  isNavigating={!!navDestination}
                  onCancelNavigation={() => setNavDestination(null)}
                />
              </div>

              {selectedLocation && (
                <div className="lg:hidden fixed left-4 right-4 bottom-20 bg-white border border-gray-200 rounded-lg shadow-lg z-30 max-h-[40vh] overflow-y-auto">
                  <div className="relative">
                    <button
                      onClick={() => setSelectedLocation(undefined)}
                      className="absolute top-2 right-2 p-1 text-gray-500"
                    >
                      ✕
                    </button>
                    <DetailsPanel
                      location={selectedLocation}
                      isLoading={isLoading}
                      onNavigate={startNavigation}
                      isNavigating={!!navDestination}
                      onCancelNavigation={() => setNavDestination(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 z-10">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center"
            onClick={() => setCurrentView("explore")}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg mr-3 cursor-pointer">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Study Locator
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <DesktopNavLink
              active={currentView === "explore"}
              onClick={() => setCurrentView("explore")}
              label="Explore"
            />
            <DesktopNavLink
              active={currentView === "scan"}
              onClick={() => setCurrentView("scan")}
              label="Scan"
            />
            <DesktopNavLink
              active={currentView === "profile"}
              onClick={() => setCurrentView("profile")}
              label="Profile"
            />
            {isAdmin && (
              <DesktopNavLink
                active={currentView === "admin"}
                onClick={() => setCurrentView("admin")}
                label="Admin"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentView === "explore" && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <label
                    htmlFor="limit"
                    className="text-xs font-medium text-gray-600"
                  >
                    Limit:
                  </label>
                  <select
                    id="limit"
                    value={locationLimit}
                    onChange={(e) => setLocationLimit(Number(e.target.value))}
                    className="px-2 pr-6 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 appearance-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg
                    className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative pb-16 md:pb-0">
        {renderContent()}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 z-40">
        <NavButton
          active={currentView === "explore"}
          onClick={() => setCurrentView("explore")}
          icon="🗺️"
          label="Explore"
        />
        <NavButton
          active={currentView === "scan"}
          onClick={() => setCurrentView("scan")}
          icon="📷"
          label="Scan"
        />
        <NavButton
          active={currentView === "profile"}
          onClick={() => setCurrentView("profile")}
          icon="👤"
          label="Profile"
        />
        {isAdmin && (
          <NavButton
            active={currentView === "admin"}
            onClick={() => setCurrentView("admin")}
            icon="📊"
            label="Admin"
          />
        )}
      </div>
    </div>
  );
}

const NavButton = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
      active
        ? "text-primary-600 bg-primary-50"
        : "text-gray-500 hover:bg-gray-50"
    }`}
  >
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const DesktopNavLink = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-primary-50 text-primary-700"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    {label}
  </button>
);

export default App;
