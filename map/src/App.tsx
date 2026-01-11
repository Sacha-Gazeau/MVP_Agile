import { useState, useEffect } from "react";
import { useLocations } from "./hooks/useLocations";
import { Map } from "./components/Map";
import { LocationList } from "./components/LocationList";
import { DetailsPanel } from "./components/DetailsPanel";
import { StudyLocation } from "./types/location";

function App() {
  const [locationLimit, setLocationLimit] = useState<number>(10);
  const { data: locations = [], isLoading, refetch } = useLocations(locationLimit);
  const [selectedLocation, setSelectedLocation] = useState<StudyLocation | undefined>();
  const [showMap, setShowMap] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed, app will still work
        console.log("Service worker registration skipped");
      });
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 text-white rounded-lg mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Study Locator</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-xs font-medium text-gray-600">
                Limit:
              </label>
              <select id="limit" value={locationLimit} onChange={(e) => setLocationLimit(Number(e.target.value))} className="px-2 pr-6 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 appearance-none" aria-label="Location limit">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Refresh locations">
              <svg className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={() => setShowMap(!showMap)} className="md:hidden px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
              {showMap ? "List" : "Map"}
            </button>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{locations.length} locations</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex w-full mt-16 h-[calc(100vh-64px)]">
        {/* Sidebar - Locations List */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden ${showMap && "hidden md:flex"}`}>
          <LocationList locations={locations} selectedLocation={selectedLocation} onSelectLocation={setSelectedLocation} isLoading={isLoading} />
        </div>

        {/* Map area */}
        <div className={`flex-1 flex h-full overflow-hidden ${!showMap && "hidden md:flex"}`}>
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : (
              <Map locations={locations} onLocationSelect={setSelectedLocation} />
            )}
          </div>

          {/* Details panel (desktop) */}
          <div className="w-96 bg-white border-l border-gray-200 hidden lg:flex flex-col overflow-y-auto">
            <DetailsPanel location={selectedLocation} isLoading={isLoading} />
          </div>

          {/* Details panel (mobile bottom sheet) */}
          {selectedLocation && (
            <div className="lg:hidden fixed left-4 right-4 bottom-4 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              <div className="max-h-[50vh] overflow-y-auto">
                <DetailsPanel location={selectedLocation} isLoading={isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
