import { useEffect, useState } from "react";
import { checkInService } from "../services/checkInService";
import { locationService } from "../services/locationService";
import { CheckInStats, LocationCheckInData } from "../types/checkin";
import { StudyLocation } from "../types/location";

export function Dashboard() {
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [locations, setLocations] = useState<StudyLocation[]>([]);
  const [locationData, setLocationData] = useState<LocationCheckInData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const checkInStats = checkInService.getStats();
    setStats(checkInStats);

    const response = await locationService.getLocations();
    const allLocations = response.locations;
    setLocations(allLocations);

    const locationCheckInData = allLocations.map((loc) =>
      checkInService.getLocationData(loc)
    );
    setLocationData(locationCheckInData);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 pb-24 overflow-y-auto transition-colors">
      {/* Header */}
      <div className="px-4 py-6 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Real-time study location analytics
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all font-medium"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Check-ins
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalCheckIns}
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Check-ins
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.activeCheckIns}
                  </p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Avg. Duration (min)
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.averageDuration}
                  </p>
                </div>
                <div className="text-3xl">⏱️</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && stats.popularLocations.length > 0 && (
        <div className="px-4 sm:px-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🏆 Popular Locations
            </h2>
            <div className="space-y-3">
              {stats.popularLocations.map((loc, index) => {
                const location = locations.find((l) => l.id === loc.locationId);
                return (
                  <div
                    key={loc.locationId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {location?.name || loc.locationId}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {location?.address}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      {loc.count} check-ins
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Locations Table - Mobile Scrollable */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📍 All Locations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check-ins
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Check-in
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {locationData.map((data) => {
                  const location = locations.find(
                    (l) => l.id === data.locationId
                  );
                  const occupancyPercentage =
                    data.capacity > 0
                      ? Math.round(
                          (data.currentOccupancy / data.capacity) * 100
                        )
                      : 0;

                  return (
                    <tr
                      key={data.locationId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {data.locationName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {location?.address}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {location?.type || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {data.currentOccupancy}/{data.capacity}
                          </div>
                          <div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                occupancyPercentage > 80
                                  ? "bg-red-500"
                                  : occupancyPercentage > 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(occupancyPercentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {data.totalCheckIns}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {data.lastCheckIn
                          ? new Date(data.lastCheckIn).toLocaleString("nl-BE", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "None"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            📌 Dashboard shows real-time data from all check-ins and locations.
            This data can be used to optimize study spaces in Ghent.
          </p>
        </div>
      </div>
    </div>
  );
}
