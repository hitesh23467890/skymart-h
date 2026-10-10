// frontend/src/pages/DeliveryAssignmentPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { Trophy, Loader2, ArrowLeft, Clock, MapPin } from "lucide-react";
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

interface FriendDistance {
  user_id: number;
  username: string;
  lat: number;
  lng: number;
  distance_km: number;
  eta_minutes: number;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-amber-400" />
          <p className="text-white/60">Computing nearest friend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-rose-400 mb-4">❌ {error}</p>
          <button
            onClick={() => navigate(`/delivery-location?room=${roomId}`)}
            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold"
          >
            ← Back to Location Page
          </button>
        </div>
      </div>
    );
  }

  if (!nearest) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-amber-400" />
          Delivery Assigned
        </h1>
        <p className="text-white/60 mb-8">
          Room {roomId} • Closest friend to SKYMART store gets the delivery
        </p>

        <div className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-2 border-amber-400/50 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl font-bold">
              {nearest.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">
                🏆 Nearest Friend
              </p>
              <p className="text-3xl font-bold mb-2">{nearest.username}</p>
              <div className="flex items-center gap-6 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {nearest.distance_km} km away
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  ETA ~{nearest.eta_minutes} min
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div style={{ height: "400px" }}>
            <MapContainer
              center={[store.lat, store.lng]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[store.lat, store.lng]}>
                <Popup>
                  <strong>🏪 SKYMART Store</strong>
                </Popup>
              </Marker>
              {allFriends.map((f) => (
                <React.Fragment key={f.user_id}>
                  <Marker position={[f.lat, f.lng]}>
                    <Popup>
                      <strong>{f.username}</strong>
                      <br />
                      {f.distance_km} km • ETA {f.eta_minutes} min
                      {f.user_id === nearest.user_id && (
                        <>
                          <br />
                          <span style={{ color: "green" }}>🏆 Winner</span>
                        </>
                      )}
                    </Popup>
                  </Marker>
                  {f.user_id === nearest.user_id && (
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
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">
            All Friends Ranked by Distance
          </h2>
          <div className="space-y-2">
            {allFriends.map((f, idx) => (
              <div
                key={f.user_id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  idx === 0
                    ? "bg-amber-500/20 border border-amber-400/40"
                    : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/40 w-6">
                    #{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-xs font-bold">
                    {f.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold">{f.username}</span>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{f.distance_km} km</p>
                  <p className="text-white/50 text-xs">
                    ETA ~{f.eta_minutes} min
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/catalog")}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            🎉 Complete Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAssignmentPage;
