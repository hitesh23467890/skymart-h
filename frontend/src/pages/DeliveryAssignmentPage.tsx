// frontend/src/pages/DeliveryAssignmentPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import {
  Trophy,
  Loader2,
  Crown,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
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

const goldIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const grayIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface FriendDistance {
  user_id: number;
  username: string;
  lat: number;
  lng: number;
  distance_km: number;
  eta_minutes: number;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });
    }
  }, [points.length, map]);
  return null;
}

export function DeliveryAssignmentPage() {
  const [params] = useSearchParams();
  const roomId = params.get("room") || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearest, setNearest] = useState<FriendDistance | null>(null);
  const [allFriends, setAllFriends] = useState<FriendDistance[]>([]);
  const [store, setStore] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/delivery/nearest-friend/?room_id=${roomId}`,
        );
        const data = await res.json();
        if (data.success) {
          setNearest(data.nearest);
          setAllFriends(data.all || []);
          setStore(data.store);
        } else {
          setError(data.error || "Could not compute nearest friend");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-400" />
          <p className="text-white/50 text-sm uppercase tracking-[0.25em]">
            Computing nearest friend…
          </p>
        </div>
      </div>
    );
  }

  if (error || !nearest) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-rose-400 mb-6 text-sm">
            {error || "No locations shared yet"}
          </p>
          <button
            onClick={() => navigate(`/delivery-location?room=${roomId}`)}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold rounded-xl uppercase text-xs tracking-[0.25em]"
          >
            ← Back to Location
          </button>
        </div>
      </div>
    );
  }

  const allPoints: [number, number][] = [
    [store.lat, store.lng],
    ...allFriends.map((f) => [f.lat, f.lng] as [number, number]),
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[180px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-600/5 blur-[160px]" />

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 text-amber-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">
            <Crown className="w-3 h-3" />
            Step 3 of 3 — Delivery
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-light">
            Nearest Friend Gets{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Delivery
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3">
            Room{" "}
            <span className="text-amber-300 font-mono font-semibold">
              {roomId}
            </span>{" "}
            • Computed by distance from SKYMART Store
          </p>
        </div>

        {/* Winner card */}
        <div className="relative rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/15 via-black to-black p-8 mb-8 shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-4xl font-bold text-black">
                {nearest.username.charAt(0).toUpperCase()}
              </div>
              <Trophy className="absolute -top-3 -right-3 w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-300 mb-2">
                🏆 Winner
              </p>
              <p className="text-4xl font-serif font-light text-white mb-4">
                {nearest.username}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="font-mono">
                    {nearest.distance_km.toFixed(2)} km
                  </span>{" "}
                  from store
                </span>
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <Clock className="w-4 h-4 text-amber-400" />
                  ETA ~{nearest.eta_minutes} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Map + list side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-8">
          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-400/20 shadow-[0_0_60px_-20px_rgba(245,158,11,0.4)]">
            <div className="absolute inset-0 pointer-events-none z-20 rounded-2xl ring-1 ring-amber-400/40 shadow-[inset_0_0_60px_rgba(0,0,0,0.55)]" />
            <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-amber-200 font-bold">
                Delivery Route
              </span>
            </div>

            <div style={{ height: "480px" }} className="w-full bg-zinc-900">
              <style>{`
                .leaflet-container { filter: saturate(0.85) contrast(1.05); }
                .leaflet-control-zoom a { background:#0a0a0a !important; color:#fbbf24 !important; border-color: rgba(251,191,36,0.3) !important; }
                .leaflet-control-zoom a:hover { background:#181818 !important; }
                .leaflet-control-attribution { background: rgba(0,0,0,0.6) !important; color: rgba(255,255,255,0.4) !important; }
              `}</style>

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

                <FitBounds points={allPoints} />

                <Marker position={[store.lat, store.lng]} icon={greenIcon}>
                  <Popup>
                    <strong>🏪 SKYMART Store</strong>
                  </Popup>
                </Marker>

                {allFriends.map((f) => {
                  const isWinner = f.user_id === nearest.user_id;
                  return (
                    <React.Fragment key={f.user_id}>
                      <Marker
                        position={[f.lat, f.lng]}
                        icon={isWinner ? goldIcon : grayIcon}
                      >
                        <Popup>
                          <strong>{f.username}</strong>
                          <br />
                          {f.distance_km.toFixed(2)} km · ETA {f.eta_minutes}{" "}
                          min
                          {isWinner && (
                            <>
                              <br />
                              <span style={{ color: "#f59e0b" }}>
                                🏆 Winner
                              </span>
                            </>
                          )}
                        </Popup>
                      </Marker>

                      {isWinner && (
                        <Polyline
                          positions={[
                            [store.lat, store.lng],
                            [f.lat, f.lng],
                          ]}
                          color="#F59E0B"
                          weight={3}
                          dashArray="10, 10"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Ranked list */}
          <div className="rounded-2xl border border-amber-400/15 bg-black/60 backdrop-blur-xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300 mb-5">
              Distance Ranking
            </p>
            <div className="space-y-3">
              {allFriends.map((f, idx) => {
                const isWinner = idx === 0;
                return (
                  <div
                    key={f.user_id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isWinner
                        ? "border-amber-400/50 bg-amber-400/[0.06]"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isWinner
                          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-black"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {f.username}
                        {isWinner && (
                          <span className="text-[10px] text-amber-300 ml-2">
                            🏆
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-mono text-white/40">
                        {f.distance_km.toFixed(2)} km · {f.eta_minutes} min
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Complete button */}
        <button
          onClick={() => navigate("/catalog")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-bold uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          Complete Order
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.2em]">
          <Lock className="w-3 h-3 text-amber-400/50" />
          Order secured · Delivery assigned by distance
        </div>
      </div>
    </div>
  );
}

export default DeliveryAssignmentPage;
