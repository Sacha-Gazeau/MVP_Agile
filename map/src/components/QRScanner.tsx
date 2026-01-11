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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">QR Check-in</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
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
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900">
                  Momenteel ingecheckt
                </p>
                <p className="text-sm text-green-700">
                  Sinds{" "}
                  {new Date(activeCheckIn.timestamp).toLocaleTimeString(
                    "nl-BE",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </div>
              <button
                onClick={handleCheckOut}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Check uit
              </button>
            </div>
          </div>
        )}

        {!activeCheckIn && (
          <>
            <div
              id="qr-reader"
              className="mb-4 rounded-lg overflow-hidden"
            ></div>

            {message && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  messageType === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : messageType === "error"
                    ? "bg-red-50 text-red-900 border border-red-200"
                    : "bg-blue-50 text-blue-900 border border-blue-200"
                }`}
              >
                {message}
              </div>
            )}

            {!isScanning ? (
              <button
                onClick={startScanning}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                📷 Start Scannen
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Stop Scannen
              </button>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <p>• Zoek de QR code bij de studielocatie</p>
              <p>• Houd je camera stabiel</p>
              <p>• Check automatisch in na scannen</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
