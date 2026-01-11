import React from "react";
import { StudyLocation } from "../types/location";
import { LocationCard } from "./LocationCard";

interface LocationListProps {
  locations: StudyLocation[];
  selectedLocation?: StudyLocation;
  onSelectLocation?: (location: StudyLocation) => void;
  isLoading?: boolean;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Loading study locations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 z-10">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          📍 Study Spots
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {locations.length} locations found
        </p>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {locations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 dark:text-gray-400">
              No study locations found
            </p>
          </div>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className={`rounded-xl border-2 transition-all active:scale-[0.98] ${
                selectedLocation?.id === location.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                  : "border-transparent"
              }`}
            >
              <LocationCard location={location} onSelect={onSelectLocation} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
