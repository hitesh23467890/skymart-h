// src/components/MapPreview.tsx

import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type Props = {
  source: { lat: number; lng: number; label?: string } | null;
  destination: { lat: number; lng: number; label?: string } | null;
};

export default function MapPreview({ source, destination }: Props) {
  const [mapReady, setMapReady] = useState(false);

  const center = useMemo(() => {
    if (destination) return { lat: destination.lat, lng: destination.lng };
    if (source) return { lat: source.lat, lng: source.lng };
    return { lat: 20.5937, lng: 78.9629 };
  }, [source, destination]);

  const positions = useMemo(() => {
    const pos = [];
    if (source) pos.push([source.lat, source.lng] as [number, number]);
    if (destination)
      pos.push([destination.lat, destination.lng] as [number, number]);
    return pos;
  }, [source, destination]);

  const getZoomLevel = () => {
    if (positions.length === 2) {
      const lat1 = positions[0][0];
      const lng1 = positions[0][1];
      const lat2 = positions[1][0];
      const lng2 = positions[1][1];

      const latDiff = Math.abs(lat2 - lat1);
      const lngDiff = Math.abs(lng2 - lng1);
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff < 0.01) return 15;
      if (maxDiff < 0.05) return 13;
      if (maxDiff < 0.1) return 12;
      if (maxDiff < 0.5) return 10;
      if (maxDiff < 1) return 9;
      if (maxDiff < 5) return 7;
      if (maxDiff < 10) return 6;
      return 5;
    }
    return 4;
  };

  const zoom = useMemo(() => getZoomLevel(), [positions]);
  const bounds = useMemo(() => {
    if (positions.length === 2) {
      return positions as L.LatLngBoundsExpression;
    }
    return undefined;
  }, [positions]);

  const handleMapReady = () => {
    setMapReady(true);
  };

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-md relative">
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-50 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
            <span className="text-xs text-stone-400">Loading map...</span>
          </div>
        </div>
      )}

      <MapContainer
        key={`map-preview-${source?.lat || 0}-${source?.lng || 0}-${destination?.lat || 0}-${destination?.lng || 0}`}
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
        whenReady={handleMapReady}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {source && (
          <Marker position={[source.lat, source.lng]}>
            <Popup>
              <div className="text-sm font-medium">
                {source.label || "Source Location"}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {source.lat.toFixed(6)}, {source.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>
              <div className="text-sm font-medium">
                {destination.label || "Destination Location"}
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {positions.length === 2 && (
          <Polyline
            positions={positions}
            color="#1c1917"
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
}
