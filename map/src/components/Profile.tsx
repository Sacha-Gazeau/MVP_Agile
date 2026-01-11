import React, { useEffect, useState } from "react";
import { gamificationService } from "../services/gamificationService";
import { UserStats, Badge } from "../types/gamification";
import { useAuth } from "../contexts/AuthContext";

export const Profile: React.FC = () => {
  const { userId, isAdmin, loginAsAdmin, logoutAdmin } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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

  if (!stats) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-500">Level {stats.level} Explorer</p>
              <p className="text-xs text-gray-400 mt-1">
                ID: {userId ? userId.substring(0, 8) + "..." : "Guest"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.currentStreak} 🔥
            </div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalCheckIns} 📍
            </div>
            <div className="text-sm text-gray-500">Check-ins</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(stats.totalStudyHours)} ⏱️
            </div>
            <div className="text-sm text-gray-500">Study Hours</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.badges.length} 🏆
            </div>
            <div className="text-sm text-gray-500">Badges</div>
          </div>
        </div>

        {/* Badges Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Earned Badges
          </h2>
          {stats.badges.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No badges yet. Start checking in to earn them!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.badges.map((badge: Badge) => (
                <div
                  key={badge.id}
                  className="bg-white p-4 rounded-lg shadow flex items-center space-x-4"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900">{badge.name}</h3>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    <p className="text-xs text-primary-600 mt-1">
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Admin/Teacher Access Section */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">Settings</h2>
            {isAdmin && (
              <button
                onClick={logoutAdmin}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout Admin
              </button>
            )}
          </div>

          {!isAdmin ? (
            <div className="bg-white p-4 rounded-lg shadow">
              <button
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                {showAdminLogin ? "Cancel Admin Login" : "Teacher Access"}
              </button>

              {showAdminLogin && (
                <form onSubmit={handleAdminLogin} className="mt-3 flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter password (try 'admin')"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Login
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm font-medium">
                ✅ You are logged in as Admin
              </p>
              <p className="text-green-600 text-xs mt-1">
                Access the Admin Dashboard from the navigation menu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
