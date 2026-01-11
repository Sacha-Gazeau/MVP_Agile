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
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="h-full flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4">📍</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Select a location to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 text-white p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{location.name}</h2>
        <div className="flex flex-wrap gap-2">
          {location.quietnessLevel && (
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium">
              {location.quietnessLevel.replace("-", " ")}
            </div>
          )}
          {location.type && (
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium">
              {LocationTypeLabels[location.type]}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {location.description && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
              About
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              {location.description}
            </p>
          </div>
        )}

        {location.address && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center text-sm sm:text-base">
              <svg
                className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
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
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              {location.address}
            </p>
            <div className="flex flex-col gap-2 mt-3">
              {!isNavigating ? (
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Navigate:
                  </span>
                  <button
                    onClick={() => onNavigate?.("foot")}
                    className="text-xl hover:scale-110 active:scale-95 transition-transform p-1"
                    title="Walk"
                  >
                    🚶
                  </button>
                  <button
                    onClick={() => onNavigate?.("bike")}
                    className="text-xl hover:scale-110 active:scale-95 transition-transform p-1"
                    title="Bike"
                  >
                    🚲
                  </button>
                  <button
                    onClick={() => onNavigate?.("car")}
                    className="text-xl hover:scale-110 active:scale-95 transition-transform p-1"
                    title="Car"
                  >
                    🚗
                  </button>
                </div>
              ) : (
                <button
                  onClick={onCancelNavigation}
                  className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 transition-all border border-red-200 dark:border-red-800"
                >
                  ⏹️ Stop Navigation
                </button>
              )}

              <div className="flex flex-wrap gap-2">
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg"
                >
                  🗺️ Google Maps
                </a>
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg"
                >
                  {showQRCode ? "🙈 Hide" : "📱 Show"} QR Code
                </button>
              </div>
            </div>
            {showQRCode && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=studyspaces-gent-${location.id}&color=2563EB`}
                    alt="Location QR Code"
                    className="w-32 h-32 sm:w-40 sm:h-40"
                  />
                </div>
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 mt-3 flex items-center gap-1">
                  📱 Scan to check-in & earn points!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                  Use the Scan tab to scan this code
                </p>
                <div className="mt-2 text-xs text-gray-400 bg-white dark:bg-gray-700 p-1 rounded border dark:border-gray-600">
                  Debug ID: {location.id}
                </div>
              </div>
            )}
          </div>
        )}

        {location.openingHours && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center text-sm sm:text-base">
              <svg
                className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
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
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              {location.openingHours}
            </p>
          </div>
        )}

        {typeof location.capacity === "number" && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center text-sm sm:text-base">
              <svg
                className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 3h14v2H3V3zm0 4h10v2H3V7zm0 4h6v2H3v-2z" />
              </svg>
              Capacity
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
              {location.capacity} places
            </p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base sm:text-lg">
            ⭐ Reviews
          </h3>

          {/* Add Review Form */}
          <form
            onSubmit={handleSubmitReview}
            className="mb-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <h4 className="text-xs sm:text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Write a review
            </h4>
            <div className="flex items-center mb-2">
              <span className="text-xs mr-2 text-gray-600 dark:text-gray-400">
                Rating:
              </span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-lg sm:text-xl focus:outline-none transition-transform hover:scale-110 active:scale-95 ${
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
              className="w-full text-xs sm:text-sm p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              rows={2}
              required
            />
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-2 rounded-lg active:scale-95 transition-all disabled:opacity-50 font-semibold"
            >
              📝 Post Review
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm italic text-center py-4">
                No reviews yet. Be the first! 🎉
              </p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                      {review.userName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-yellow-400 text-xs sm:text-sm my-1">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {typeof location.currentOccupancy === "number" && location.capacity && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center text-sm sm:text-base">
              <svg
                className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3h12v2H4V3zm0 4h8v2H4V7zm0 4h6v2H4v-2z" />
              </svg>
              Current Occupancy
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    location.currentOccupancy / location.capacity > 0.8
                      ? "bg-red-500"
                      : location.currentOccupancy / location.capacity > 0.5
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (location.currentOccupancy / location.capacity) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
                {location.currentOccupancy}/{location.capacity}
              </span>
            </div>
          </div>
        )}

        {location.amenities && location.amenities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-sm sm:text-base">
              <span className="mr-2">✨</span>
              Amenities
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {location.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-block px-2 sm:px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};
