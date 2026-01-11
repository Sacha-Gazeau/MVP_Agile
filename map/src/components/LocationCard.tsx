import React from "react";
import { StudyLocation } from "../types/location";

interface LocationCardProps {
  location: StudyLocation;
  onSelect?: (location: StudyLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onSelect }) => {
  const getQuietnessColor = (level?: string) => {
    switch (level) {
      case "very-quiet":
        return "bg-green-100 text-green-800";
      case "quiet":
        return "bg-blue-100 text-blue-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="location-card cursor-pointer" onClick={() => onSelect?.(location)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
        {location.quietnessLevel && <span className={`px-2 py-1 rounded text-xs font-medium ${getQuietnessColor(location.quietnessLevel)}`}>{location.quietnessLevel.replace("-", " ")}</span>}
      </div>

      {location.description && <p className="text-sm text-gray-600 mb-2">{location.description}</p>}

      {location.address && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {location.address}
        </div>
      )}

      {location.openingHours && (
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          {location.openingHours}
        </div>
      )}

      {location.amenities && location.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {location.amenities.map((amenity, index) => (
            <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {amenity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
