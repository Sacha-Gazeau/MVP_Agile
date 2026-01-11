import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../contexts/AuthContext";
import { checkInService } from "../services/checkInService";
import { gamificationService } from "../services/gamificationService";
import { locationService } from "../services/locationService";
import { CheckIn } from "../types/checkin";

interface QRScannerProps {
  onCheckInSuccess?: (checkIn: CheckIn) => void;
  onClose?: () => void;
}

export function QRScanner({ onCheckInSuccess, onClose }: QRScannerProps) {
  const { userId } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);

  useEffect(() => {
    if (userId) {
      const active = checkInService.getActiveCheckIn(userId);
      setActiveCheckIn(active);
    }

    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [userId]);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
      setMessage("Scan de QR code op de locatie");
      setMessageType("info");
    } catch (err) {
      console.error("Error starting scanner:", err);
      setMessage("Kon camera niet starten. Controleer de permissies.");
      setMessageType("error");
    }
  };

  const stopScanning = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        setIsScanning(false);
        setScanner(null);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);

    await stopScanning();

    const locationId = checkInService.validateQRCode(decodedText);

    if (!locationId) {
      setMessage("Ongeldige QR code. Scan een Study Spaces QR code.");
      setMessageType("error");
      return;
    }

    const location = await locationService.getLocationById(locationId);
    if (!location) {
      setMessage("Locatie niet gevonden.");
      setMessageType("error");
      return;
    }

    const checkIn = checkInService.checkIn(locationId, userId);

    gamificationService.updateStatsAfterCheckIn(checkIn, userId);

    setMessage(`✅ Ingecheckt bij ${location.name}!`);
    setMessageType("success");
    setActiveCheckIn(checkIn);

    if (onCheckInSuccess) {
      onCheckInSuccess(checkIn);
    }
  };

  const onScanError = (errorMessage: string) => {
    console.log("Scan error:", errorMessage);
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;

    const checkedOut = checkInService.checkOut(activeCheckIn.id);
    if (checkedOut) {
      gamificationService.updateStatsAfterCheckOut(checkedOut, userId);

      const location = await locationService.getLocationById(
        checkedOut.locationId
      );
      const duration = checkedOut.duration || 0;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      setMessage(
        `✅ Uitgecheckt van ${location?.name}. Studietijd: ${hours}u ${minutes}m`
      );
      setMessageType("success");
      setActiveCheckIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 pb-24 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📷 QR Check-in
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full p-2 transition-colors active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {activeCheckIn && !isScanning && (
          <div className="mb-4 sm:mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                  ✅ Currently Checked In
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Since{" "}
                  {new Date(activeCheckIn.timestamp).toLocaleTimeString(
                    "nl-BE",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
              >
                Check Out
              </button>
            </div>
          </div>
        )}

        {!activeCheckIn && (
          <>
            <div
              id="qr-reader"
              className="mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
              style={{ minHeight: isScanning ? "280px" : "0" }}
            ></div>

            {message && (
              <div
                className={`mb-4 p-3 sm:p-4 rounded-lg text-center text-sm sm:text-base ${
                  messageType === "success"
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : messageType === "error"
                    ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                }`}
              >
                {message}
              </div>
            )}

            {!isScanning ? (
              <button
                onClick={startScanning}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all font-medium text-base sm:text-lg"
              >
                📷 Start Camera & Scan
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all font-medium text-base sm:text-lg"
              >
                ⏹️ Stop Scanning
              </button>
            )}

            <div className="mt-4 sm:mt-6 space-y-2">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <span className="text-lg sm:text-xl">🎯</span>
                <span>Find the QR code at the study location</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <span className="text-lg sm:text-xl">📱</span>
                <span>Point your camera at the code</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                <span className="text-lg sm:text-xl">🏆</span>
                <span>Earn XP & badges automatically!</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
