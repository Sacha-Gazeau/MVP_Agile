import React, { useEffect, useState } from "react";
import { gamificationService } from "../services/gamificationService";
import { checkInService } from "../services/checkInService";
import { UserStats, Badge, BADGE_DEFINITIONS } from "../types/gamification";
import { useAuth } from "../contexts/AuthContext";

export const Profile: React.FC = () => {
  const { userId, isAdmin, loginAsAdmin, logoutAdmin } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  const loadStats = () => {
    const userStats = gamificationService.getUserStats(userId);
    setStats(userStats);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAsAdmin(adminPassword)) {
      setAdminPassword("");
      setShowAdminLogin(false);
      alert("Welcome, Admin!");
    } else {
      alert("Incorrect password");
    }
  };

  // Test function to simulate a check-in
  const simulateCheckIn = () => {
    const testLocationId = "test-" + Date.now();
    const checkIn = checkInService.checkIn(testLocationId, userId);
    gamificationService.updateStatsAfterCheckIn(checkIn, userId);
    loadStats();
    alert("🎉 Test check-in complete! Your stats have been updated.");
  };

  const getLevelTitle = (level: number): string => {
    const titles = [
      "Newbie",
      "Apprentice",
      "Scholar",
      "Dedicated",
      "Focused",
      "Achiever",
      "Champion",
      "Master",
      "Legend",
      "Grandmaster",
    ];
    return titles[Math.min(level - 1, titles.length - 1)];
  };

  const getNextLevelXP = (level: number): number => level * 100;
  const getCurrentXP = (stats: UserStats): number =>
    stats.totalCheckIns * 25 +
    Math.floor(stats.totalStudyHours * 10) +
    stats.badges.length * 50;

  // Get all possible badges
  const allBadges = Object.values(BADGE_DEFINITIONS);

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400 text-xl">
          Loading your profile...
        </div>
      </div>
    );
  }

  const currentXP = getCurrentXP(stats);
  const nextLevelXP = getNextLevelXP(stats.level);
  const xpProgress = Math.min(
    ((currentXP % nextLevelXP) / nextLevelXP) * 100,
    100
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 pb-24 overflow-y-auto transition-colors">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-sm border-4 border-white dark:border-gray-700">
                {stats.level >= 5 ? "🦸" : stats.level >= 3 ? "🧑‍🎓" : "👤"}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold shadow-md">
                Lv.{stats.level}
              </div>
            </div>

            {/* Name & Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-4">
              {getLevelTitle(stats.level)} Explorer
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              ID: {userId ? userId.substring(0, 12) + "..." : "Guest"}
            </p>

            {/* XP Bar */}
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>XP: {currentXP}</span>
                <span>Next: {nextLevelXP}</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl sm:text-3xl mb-1">🔥</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.currentStreak}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Day Streak
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl sm:text-3xl mb-1">📍</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalCheckIns}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Check-ins
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl sm:text-3xl mb-1">⏱️</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(stats.totalStudyHours)}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Study Hours
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-2xl sm:text-3xl mb-1">🗺️</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.locationsVisited.length}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Places Visited
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          🏆 Badges ({stats.badges.length}/{allBadges.length})
        </h2>

        {stats.badges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 text-center shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🎮</div>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              No badges yet!
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2">
              Scan a QR code at a study location to earn your first badge!
            </p>
            <button
              onClick={() => setShowTestPanel(true)}
              className="mt-3 sm:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
            >
              🧪 Test Check-in (Demo)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.badges.map((badge: Badge) => (
              <div
                key={badge.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">
                  {badge.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                  {badge.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs mt-1">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Locked Badges Preview */}
        <h3 className="text-base sm:text-lg font-medium text-gray-400 dark:text-gray-500 mt-4 sm:mt-6 mb-2 sm:mb-3">
          🔒 Badges to Unlock
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {allBadges
            .filter((b) => !stats.badges.some((earned) => earned.id === b.id))
            .slice(0, 8)
            .map((badge) => (
              <div
                key={badge.id}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 sm:p-3 text-center opacity-60"
              >
                <div className="text-xl sm:text-2xl mb-1 grayscale">
                  {badge.icon}
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-[10px] sm:text-xs">
                  {badge.name}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Test Panel */}
      {showTestPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              🧪 Test Mode
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
              This lets you test the gamification system without scanning a real
              QR code.
            </p>
            <button
              onClick={simulateCheckIn}
              className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all mb-3"
            >
              ✅ Simulate Check-in
            </button>
            <button
              onClick={() => setShowTestPanel(false)}
              className="w-full py-2.5 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Section */}
      <div className="px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              ⚙️ Settings
            </h2>
            {isAdmin && (
              <button
                onClick={logoutAdmin}
                className="text-xs sm:text-sm text-red-500 hover:text-red-600 active:scale-95 transition-all"
              >
                Logout Admin
              </button>
            )}
          </div>

          <button
            onClick={() => setShowTestPanel(true)}
            className="w-full mb-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs sm:text-sm font-medium border border-blue-200 dark:border-blue-800 active:scale-[0.98] transition-all"
          >
            🧪 Open Test Panel (Demo Check-ins)
          </button>

          {!isAdmin ? (
            <div>
              <button
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {showAdminLogin ? "Cancel" : "🔐 Teacher Access"}
              </button>

              {showAdminLogin && (
                <form onSubmit={handleAdminLogin} className="mt-3 flex gap-2">
                  <input
                    type="password"
                    placeholder="Password"
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-all hover:bg-blue-700"
                  >
                    Login
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-700 dark:text-green-400 text-xs sm:text-sm font-medium">
                ✅ Admin access enabled
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
