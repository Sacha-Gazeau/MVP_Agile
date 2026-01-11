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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          🔄 Vernieuwen
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Check-ins</p>
                <p className="text-3xl font-bold text-primary-600">
                  {stats.totalCheckIns}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actieve Check-ins</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeCheckIns}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gem. Duur (min)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.averageDuration}
                </p>
              </div>
              <div className="text-4xl">⏱️</div>
            </div>
          </div>
        </div>
      )}

      {stats && stats.popularLocations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Populaire Locaties
          </h2>
          <div className="space-y-3">
            {stats.popularLocations.map((loc, index) => {
              const location = locations.find((l) => l.id === loc.locationId);
              return (
                <div
                  key={loc.locationId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {location?.name || loc.locationId}
                      </p>
                      <p className="text-sm text-gray-600">
                        {location?.address}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-semibold">
                    {loc.count} check-ins
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Alle Locaties</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locatie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bezetting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Totale Check-ins
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Laatste Check-in
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locationData.map((data) => {
                const location = locations.find(
                  (l) => l.id === data.locationId
                );
                const occupancyPercentage =
                  data.capacity > 0
                    ? Math.round((data.currentOccupancy / data.capacity) * 100)
                    : 0;

                return (
                  <tr key={data.locationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {data.locationName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {location?.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {location?.type || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {data.currentOccupancy}/{data.capacity}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.totalCheckIns}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {data.lastCheckIn
                        ? new Date(data.lastCheckIn).toLocaleString("nl-BE", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Geen"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-900">
          📌 Dashboard toont real-time gegevens van alle check-ins en locaties.
          Deze data kan worden gebruikt voor het optimaliseren van studieruimtes
          in Gent.
        </p>
      </div>
    </div>
  );
}
