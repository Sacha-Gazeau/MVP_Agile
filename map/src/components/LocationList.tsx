import React from "react";
import { StudyLocation } from "../types/location";
import { LocationCard } from "./LocationCard";

interface LocationListProps {
  locations: StudyLocation[];
  selectedLocation?: StudyLocation;
  onSelectLocation?: (location: StudyLocation) => void;
  isLoading?: boolean;
}

export const LocationList: React.FC<LocationListProps> = ({ locations, selectedLocation, onSelectLocation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading study locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {locations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No study locations found</p>
          </div>
        ) : (
          locations.map((location) => (
            <div key={location.id} className={`rounded-lg border-2 transition-colors ${selectedLocation?.id === location.id ? "border-primary-600 bg-primary-50" : "border-transparent"}`}>
              <LocationCard location={location} onSelect={onSelectLocation} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
