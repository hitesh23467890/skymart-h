// src/components/DeliveryLocationPicker.tsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type LatLng = { lat: number; lng: number };

type Props = {
  selected: LatLng | null;
  onSelect: (pos: LatLng) => void;
  reverseGeocode: (
    lat: number,
    lng: number,
  ) => Promise<{ displayName?: string; postcode?: string } | null>;
  disabled?: boolean;
};

function LocationClickHandler({
  onSelect,
  disabled,
}: {
  onSelect: (pos: LatLng) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// FIXED: RecenterMap - Only recenters when selected location changes, NOT on every render
function RecenterMap({
  center,
  selected,
}: {
  center: LatLng;
  selected: LatLng | null;
}) {
  const map = useMap();
  const prevSelectedRef = useRef<LatLng | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to avoid interfering with initial map load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only recenter if the selected location actually changed
    if (selected && map) {
      const hasLocationChanged =
        !prevSelectedRef.current ||
        prevSelectedRef.current.lat !== selected.lat ||
        prevSelectedRef.current.lng !== selected.lng;

      if (hasLocationChanged) {
        try {
          map.flyTo([selected.lat, selected.lng], 16, {
            animate: true,
            duration: 1.5,
          });
          prevSelectedRef.current = selected;
          console.log("📍 Recentered to:", selected);
        } catch (error) {
          console.warn("Error recentering map:", error);
        }
      }
    }
  }, [selected, map]);

  return null;
}

export default function DeliveryLocationPicker({
  selected,
  onSelect,
  reverseGeocode,
  disabled = false,
}: Props) {
  const [isResolving, setIsResolving] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  const center = useMemo(() => {
    if (selected) return selected;
    return { lat: 20.5937, lng: 78.9629 };
  }, [selected]);

  const handleSelect = async (pos: LatLng) => {
    try {
      setIsResolving(true);
      onSelect(pos);

      const geo = await reverseGeocode(pos.lat, pos.lng);
      window.dispatchEvent(
        new CustomEvent("skymart:delivery-geo", {
          detail: {
            ...geo,
            lat: pos.lat,
            lng: pos.lng,
          },
        }),
      );
    } catch {
      // ignore
    } finally {
      setIsResolving(false);
    }
  };

  const handleMapReady = () => {
    setMapReady(true);
    // Enable dragging when map is ready
    if (mapRef.current) {
      const map = mapRef.current;
      if (map.dragging) {
        map.dragging.enable();
        console.log("✅ Map dragging enabled");
      }
    }
  };

  return (
    <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-semibold">
            Delivery location (click on map)
          </p>
          <p className="text-xs text-stone-600 mt-1">
            {isResolving
              ? "Resolving address..."
              : selected
                ? `Selected: ${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`
                : "Select your point by clicking the map."}
          </p>
          <p className="text-[10px] text-stone-400 mt-1">
            🖱️ Drag the map to explore nearby areas
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-mono text-stone-400">
          {disabled ? "Disabled" : "Active"}
        </div>
      </div>

      <div
        className="w-full rounded-2xl overflow-hidden border border-stone-100 relative"
        style={{ height: "500px", minHeight: "400px" }}
      >
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-xs text-stone-400">Loading map...</span>
            </div>
          </div>
        )}

        <MapContainer
          key={`map-${center.lat}-${center.lng}`}
          center={[center.lat, center.lng]}
          zoom={selected ? 16 : 4}
          style={{
            height: "100%",
            width: "100%",
          }}
          scrollWheelZoom={true}
          zoomControl={true}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          ref={mapRef}
          whenReady={handleMapReady}
          attributionControl={true}
          preferCanvas={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationClickHandler
            disabled={disabled}
            onSelect={(pos) => {
              void handleSelect(pos);
            }}
          />
          {selected && (
            <Marker
              position={[selected.lat, selected.lng]}
              draggable={true}
              eventHandlers={{
                dragend: async (e) => {
                  const marker = e.target;
                  const next = marker.getLatLng();
                  await handleSelect({ lat: next.lat, lng: next.lng });
                },
              }}
            />
          )}
          <RecenterMap center={center} selected={selected} />
        </MapContainer>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-semibold">
            Selected coordinates (debug)
          </p>
          <p className="text-xs text-stone-600 mt-1 font-mono">
            {selected
              ? `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`
              : "—"}
          </p>
        </div>
        <button
          onClick={() => {
            if (mapRef.current) {
              const map = mapRef.current;
              map.flyTo([center.lat, center.lng], 16, {
                animate: true,
                duration: 1.5,
              });
            }
          }}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium underline"
        >
          📍 Recenter
        </button>
      </div>
    </div>
  );
}
