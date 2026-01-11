import React, { useState, useEffect } from "react";
import { StudyLocation, LocationTypeLabels } from "../types/location";
import { reviewService } from "../services/reviewService";
import { Review } from "../types/review";
import { useAuth } from "../contexts/AuthContext";

interface DetailsPanelProps {
  location?: StudyLocation;
  isLoading?: boolean;
  onNavigate?: (mode: "car" | "bike" | "foot") => void;
  isNavigating?: boolean;
  onCancelNavigation?: () => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  location,
  isLoading,
  onNavigate,
  isNavigating,
  onCancelNavigation,
}) => {
  const { userId } = useAuth();
  const [showDirections, setShowDirections] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (location) {
      loadReviews();
      setShowQRCode(false); // Reset when location changes
    }
  }, [location]);

  const loadReviews = () => {
    if (location) {
      setReviews(reviewService.getReviewsForLocation(location.id));
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !userId) return;

    setIsSubmittingReview(true);
    reviewService.addReview(
      location.id,
      userId,
      newReview.rating,
      newReview.comment
    );
    setNewReview({ rating: 5, comment: "" });
    loadReviews();
    setIsSubmittingReview(false);
  };

  const getGoogleMapsUrl = () => {
    if (!location) return "";
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  };

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
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
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
        <div className="flex flex-wrap gap-2">
          {location.quietnessLevel && (
            <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              {location.quietnessLevel.replace("-", " ")}
            </div>
          )}
          {location.type && (
            <div className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              {LocationTypeLabels[location.type]}
            </div>
          )}
        </div>
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
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Location
            </h3>
            <p className="text-gray-600 text-sm">{location.address}</p>
            <div className="flex flex-col gap-2 mt-2">
              {!isNavigating ? (
                <div className="flex gap-2 bg-gray-50 p-2 rounded">
                  <span className="text-xs font-semibold text-gray-500 py-1">
                    Navigate:
                  </span>
                  <button
                    onClick={() => onNavigate?.("foot")}
                    className="text-xl"
                    title="Walk"
                  >
                    🚶
                  </button>
                  <button
                    onClick={() => onNavigate?.("bike")}
                    className="text-xl"
                    title="Bike"
                  >
                    🚲
                  </button>
                  <button
                    onClick={() => onNavigate?.("car")}
                    className="text-xl"
                    title="Car"
                  >
                    🚗
                  </button>
                </div>
              ) : (
                <button
                  onClick={onCancelNavigation}
                  className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-100"
                >
                  Stop Navigation
                </button>
              )}

              <div className="flex gap-2">
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                >
                  Open in Google Maps ↗
                </a>
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm border-l border-gray-300 pl-2 ml-2"
                >
                  {showQRCode ? "Hide" : "Show"} QR Code
                </button>
              </div>
            </div>
            {showQRCode && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${location.id}`}
                  alt="Location QR Code"
                  className="w-32 h-32 mb-2"
                />
                <p className="text-xs text-gray-500 text-center">
                  Scan with the app scanner to check-in
                </p>
                <div className="mt-2 text-xs text-gray-400 bg-white p-1 rounded border">
                  Debug ID: {location.id}
                </div>
              </div>
            )}
          </div>
        )}

        {location.openingHours && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              Hours
            </h3>
            <p className="text-gray-600 text-sm">{location.openingHours}</p>
          </div>
        )}

        {typeof location.capacity === "number" && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 3h14v2H3V3zm0 4h10v2H3V7zm0 4h6v2H3v-2z" />
              </svg>
              Capacity
            </h3>
            <p className="text-gray-600 text-sm">{location.capacity} places</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t pt-4 mt-6">
          <h3 className="font-bold text-gray-900 mb-3 text-lg">Reviews</h3>

          {/* Add Review Form */}
          <form
            onSubmit={handleSubmitReview}
            className="mb-6 bg-gray-50 p-3 rounded-lg"
          >
            <h4 className="text-sm font-semibold mb-2">Write a review</h4>
            <div className="flex items-center mb-2">
              <span className="text-xs mr-2 text-gray-600">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-lg focus:outline-none ${
                    star <= newReview.rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              placeholder="Share your experience..."
              className="w-full text-sm p-2 border border-gray-300 rounded mb-2 focus:ring-1 focus:ring-primary-500"
              rows={2}
              required
            />
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full bg-primary-600 text-white text-sm py-1.5 rounded hover:bg-primary-700 transition disabled:opacity-50"
            >
              Post Review
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No reviews yet. Be the first!
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-800">
                      {review.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 text-xs my-1">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {typeof location.currentOccupancy === "number" && location.capacity && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3h12v2H4V3zm0 4h8v2H4V7zm0 4h6v2H4v-2z" />
              </svg>
              Huidige Bezetting
            </h3>
            <p className="text-gray-600 text-sm">
              {location.currentOccupancy}/{location.capacity} bezet
            </p>
          </div>
        )}

        {location.amenities && location.amenities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5m-15-4h4m-4 4h4m-4 4h4m8-8v8m-4-4h8m-8 4h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {location.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Coordinates: {location.latitude.toFixed(4)},{" "}
            {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};
