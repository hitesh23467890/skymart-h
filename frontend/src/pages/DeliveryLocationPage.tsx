// frontend/src/pages/DeliveryLocationPage.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Check, Loader2, ArrowRight } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons (Leaflet + bundler quirk)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://skymart-h.onrender.com";

interface Location {
  user_id: number;
  username: string;
  lat: number;
  lng: number;
}

export function DeliveryLocationPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [store, setStore] = useState({ lat: 12.9716, lng: 77.5946 });
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authToken = localStorage.getItem("authToken") || "";
  const myUserId = parseInt(localStorage.getItem("userId") || "0");
  const myUsername = localStorage.getItem("username") || "";

  // Fetch existing locations on mount
  const fetchLocations = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/delivery/room-locations/?room_id=${roomId}`,
      );
      const data = await res.json();
      if (data.success) {
        setStore(data.store);
        setLocations(data.locations);
        const mine = data.locations.find(
          (l: Location) => l.user_id === myUserId,
        );
        if (mine) setMyLocation(mine);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [roomId]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation");
      return;
    }

    setSharing(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`${API_BASE}/api/delivery/save-location/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              room_id: roomId,
              lat: latitude,
              lng: longitude,
            }),
          });
          const data = await res.json();
          if (data.success) {
            setMyLocation({
              user_id: myUserId,
              username: myUsername,
              lat: latitude,
              lng: longitude,
            });
            fetchLocations();
          } else {
            setError(data.error || "Could not save location");
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setSharing(false);
        }
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
        setSharing(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleContinue = () => {
    navigate(`/payment-options?room=${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8 text-amber-400" />
            Share Your Location
          </h1>
          <p className="text-white/60 mt-1">
            Room {roomId} • Each friend shares their location so we can find the
            nearest delivery point
          </p>
        </div>

        {/* Map */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div style={{ height: "400px" }} className="w-full">
            {!loading && (
              <MapContainer
                center={[store.lat, store.lng]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Store marker */}
                <Marker position={[store.lat, store.lng]}>
                  <Popup>
                    <strong>🏪 SKYMART Store</strong>
                    <br />
                    Fulfillment Center
                  </Popup>
                </Marker>
                {/* Friend markers */}
                {locations.map((loc) => (
                  <Marker key={loc.user_id} position={[loc.lat, loc.lng]}>
                    <Popup>
                      <strong>{loc.username}</strong>
                      <br />
                      {loc.user_id === myUserId && "(You)"}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Friends list */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">
            Friends in Room ({locations.length})
          </h2>
          <div className="space-y-2">
            {locations.length === 0 && (
              <p className="text-white/40 text-sm italic">
                No one has shared their location yet. Be the first!
              </p>
            )}
            {locations.map((loc) => (
              <div
                key={loc.user_id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center font-bold">
                    {loc.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {loc.username}
                      {loc.user_id === myUserId && (
                        <span className="text-xs text-purple-400 ml-2">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/50">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 mb-6">
            ❌ {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleShareLocation}
            disabled={sharing}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              myLocation
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gradient-to-r from-purple-600 to-amber-500 hover:shadow-lg"
            } disabled:opacity-50`}
          >
            {sharing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Getting location...
              </>
            ) : myLocation ? (
              <>
                <Check className="w-5 h-5" /> Location Shared (Tap to update)
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" /> Share My Location
              </>
            )}
          </button>

          <button
            onClick={handleContinue}
            disabled={!myLocation}
            className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue to Payment
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {!myLocation && (
          <p className="text-xs text-white/40 text-center mt-4">
            Share your location to continue
          </p>
        )}
      </div>
    </div>
  );
}
