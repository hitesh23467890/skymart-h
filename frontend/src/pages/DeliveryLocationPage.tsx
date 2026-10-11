// frontend/src/pages/DeliveryLocationPage.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Check,
  Loader2,
  ArrowRight,
  Users,
  Crown,
  Shield,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
    const interval = setInterval(fetchLocations, 5000);
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[140px]" />

      {/* Gold hairline at top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            <Crown className="w-3 h-3" />
            Step 1 of 3 — Delivery
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide text-white">
            Share Your{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Location
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3 max-w-xl">
            Room{" "}
            <span className="text-amber-300 font-mono font-semibold">
              {roomId}
            </span>{" "}
            • Every friend shares their position so we can assign the closest
            delivery point.
          </p>
        </div>

        {/* Two-column layout: controls LEFT, map RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          {/* LEFT: controls + friends */}
          <div className="space-y-6">
            {/* Share button card */}
            <div className="relative rounded-2xl border border-amber-400/20 bg-gradient-to-br from-black via-zinc-950 to-black p-6 shadow-[0_0_40px_-15px_rgba(245,158,11,0.3)]">
              <div className="flex items-center gap-2 text-amber-300 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                  Your Position
                </span>
              </div>

              {myLocation ? (
                <>
                  <p className="text-white/60 text-xs font-mono mb-4">
                    {myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}
                  </p>
                  <button
                    onClick={handleShareLocation}
                    disabled={sharing}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {sharing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Location Shared — Update
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/50 text-xs mb-4 leading-relaxed">
                    Tap below to let your browser detect your position. We use
                    it only to find the nearest delivery point.
                  </p>
                  <button
                    onClick={handleShareLocation}
                    disabled={sharing}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.6)] transition-all disabled:opacity-50"
                  >
                    {sharing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Detecting…
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        Share My Location
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Friends card */}
            <div className="rounded-2xl border border-amber-400/15 bg-black/60 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                    Friends In Room
                  </span>
                </div>
                <span className="text-xs font-mono text-white/50">
                  {locations.length} / shared
                </span>
              </div>

              {locations.length === 0 ? (
                <p className="text-white/40 text-sm italic py-4 text-center">
                  No one has shared their location yet.
                  <br />
                  Be the first.
                </p>
              ) : (
                <div className="space-y-2">
                  {locations.map((loc) => {
                    const isMe = loc.user_id === myUserId;
                    return (
                      <div
                        key={loc.user_id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isMe
                            ? "border-amber-400/40 bg-amber-400/5"
                            : "border-white/5 bg-white/[0.03]"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isMe
                              ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black"
                              : "bg-gradient-to-br from-zinc-700 to-zinc-900 text-white border border-white/10"
                          }`}
                        >
                          {loc.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {loc.username}
                            {isMe && (
                              <span className="text-[10px] text-amber-300 ml-2">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-mono text-white/40">
                            {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                          </p>
                        </div>
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={!myLocation}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-bold uppercase text-xs tracking-[0.25em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </button>

            {!myLocation && (
              <p className="text-[10px] text-center text-amber-300/50 uppercase tracking-[0.2em]">
                Share your location to unlock
              </p>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em] pt-2">
              <Shield className="w-3 h-3 text-amber-400/50" />
              Location encrypted · Shared only with room
            </div>
          </div>

          {/* RIGHT: Map */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-400/20 shadow-[0_0_60px_-20px_rgba(245,158,11,0.4)]">
            {/* Map frame — gold hairline */}
            <div className="absolute inset-0 pointer-events-none z-20 rounded-2xl ring-1 ring-amber-400/30" />
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-amber-200 font-bold">
                Live Map
              </span>
            </div>
            <div style={{ height: "640px" }} className="w-full bg-zinc-900">
              {!loading && (
                <MapContainer
                  center={[store.lat, store.lng]}
                  zoom={11}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Store */}
                  <Marker position={[store.lat, store.lng]}>
                    <Popup>
                      <strong>🏪 SKYMART Store</strong>
                      <br />
                      Fulfillment Center
                    </Popup>
                  </Marker>
                  {/* Friends */}
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
        </div>
      </div>
    </div>
  );
}

export default DeliveryLocationPage;
