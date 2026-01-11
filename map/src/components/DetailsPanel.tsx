import React, { useState } from "react";
import { StudyLocation } from "../types/location";

interface DetailsPanelProps {
  location?: StudyLocation;
  isLoading?: boolean;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ location, isLoading }) => {
  const [showDirections, setShowDirections] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <p className="text-gray-500">Select a location to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{location.name}</h2>
        {location.quietnessLevel && <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">{location.quietnessLevel.replace("-", " ")}</div>}
      </div>

      <div className="p-6 space-y-4">
        {location.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">About</h3>
            <p className="text-gray-600 text-sm">{location.description}</p>
          </div>
        )}

        {location.address && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Location
            </h3>
            <p className="text-gray-600 text-sm">{location.address}</p>
            <button onClick={() => setShowDirections(!showDirections)} className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
              {showDirections ? "Hide" : "Get"} directions
            </button>
          </div>
        )}

        {location.openingHours && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              Hours
            </h3>
            <p className="text-gray-600 text-sm">{location.openingHours}</p>
          </div>
        )}

        {typeof location.capacity === "number" && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 3h14v2H3V3zm0 4h10v2H3V7zm0 4h6v2H3v-2z" />
              </svg>
              Capacity
            </h3>
            <p className="text-gray-600 text-sm">{location.capacity} places</p>
          </div>
        )}

        {typeof location.reservedCount === "number" && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3h12v2H4V3zm0 4h8v2H4V7zm0 4h6v2H4v-2z" />
              </svg>
              Gereserveerde plaatsen
            </h3>
            <p className="text-gray-600 text-sm">{location.reservedCount} plaatsen</p>
          </div>
        )}

        {location.amenities && location.amenities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5m-15-4h4m-4 4h4m-4 4h4m8-8v8m-4-4h8m-8 4h8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {location.amenities.map((amenity, index) => (
                <span key={index} className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};
