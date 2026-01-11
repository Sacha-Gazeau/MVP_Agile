export interface StudyLocation {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  capacity?: number;
  reservedCount?: number;
  openingHours?: string;
  amenities?: string[];
  imageUrl?: string;
  quietnessLevel?: "very-quiet" | "quiet" | "moderate";
}

export interface LocationsResponse {
  locations: StudyLocation[];
  lastUpdated?: string;
}

export interface MapBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}
