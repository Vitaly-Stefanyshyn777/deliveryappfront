"use client";

import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// Базові типи для Leaflet подій
interface LeafletEvent {
  latlng: { lat: number; lng: number };
  originalEvent?: Event;
}

type LatLng = { lat: number; lng: number };
export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
};

interface MapPickerProps {
  value?: LatLng | null;
  onChange: (val: LatLng | null) => void;
  shop?: LatLng | null; // для відображення магазину і маршруту
  showRoute?: boolean;
  points?: MapPoint[]; // додаткові точки (наприклад, відділення НП)
  onSelectPoint?: (p: MapPoint) => void;
  height?: number; // висота карти в px
  focus?: LatLng | null; // куди проскролити карту
  fitToPoints?: MapPoint[] | null; // примусовий fitBounds за списком точок
}

function ClickHandler({ onPick }: { onPick: (pos: LatLng) => void }) {
  const map = useMapEvents({
    click(e: LeafletEvent) {
      try {
        // Зупинити нативну подію, щоб клік не пішов у глобальні слухачі
        // (інколи це може закривати модалку поза React)
        if (e?.originalEvent) {
          L.DomEvent.stop(e.originalEvent);
        }
      } catch {}
      const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
      onPick(pos);
      const targetZoom = Math.max(map.getZoom(), 16);
      map.setView(e.latlng, targetZoom, { animate: true });
    },
  });
  return null;
}

export function MapPicker({
  value,
  onChange,
  shop,
  showRoute,
  points,
  onSelectPoint,
  height = 360,
  focus = null,
  fitToPoints = null,
}: MapPickerProps) {
  const [route, setRoute] = useState<LatLng[] | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    async function fetchRoute() {
      if (!showRoute || !shop || !value) {
        setRoute(null);
        return;
      }
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${shop.lng},${shop.lat};${value.lng},${value.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: ac.signal });
        const data = await res.json();
        const coords: [number, number][] =
          data.routes?.[0]?.geometry?.coordinates || [];
        const poly: LatLng[] = coords.map(([lng, lat]) => ({ lat, lng }));
        setRoute(poly);
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        setRoute(null);
      }
    }
    fetchRoute();
    return () => ac.abort();
  }, [showRoute, shop, value]);

  const center = value || shop || { lat: 50.4501, lng: 30.5234 };

  useEffect(() => {
    if (mapInstance && focus) {
      const targetZoom = Math.max(mapInstance.getZoom?.() || 13, 13);
      mapInstance.setView([focus.lat, focus.lng], targetZoom, {
        animate: true,
      });
    }
  }, [mapInstance, focus]);

  useEffect(() => {
    if (!mapInstance) return;
    const src =
      (fitToPoints && fitToPoints.length ? fitToPoints : points) || [];
    if (src.length === 0) return;
    try {
      const bounds = L.latLngBounds(
        src.map((p) => [p.lat, p.lng] as [number, number])
      );
      if (!focus) {
        mapInstance.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch {}
  }, [mapInstance, points, focus, fitToPoints]);

  const AnyMapContainer = MapContainer as unknown as React.ComponentType<
    Record<string, unknown>
  >;
  const AnyTileLayer = TileLayer as unknown as React.ComponentType<
    Record<string, unknown>
  >;
  const AnyPolyline = Polyline as unknown as React.ComponentType<
    Record<string, unknown>
  >;
  const AnyCircleMarker = CircleMarker as unknown as React.ComponentType<
    Record<string, unknown>
  >;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <AnyMapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height, cursor: "crosshair" }}
        whenCreated={(m: L.Map) => setMapInstance(m)}
      >
        <AnyTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <ClickHandler onPick={(pos) => onChange(pos)} />
        {shop && (
          <AnyCircleMarker
            center={[shop.lat, shop.lng]}
            radius={10}
            pathOptions={{ color: "#ec4899" }}
          >
            <Popup>Магазин</Popup>
          </AnyCircleMarker>
        )}
        {value && (
          <AnyCircleMarker
            center={[value.lat, value.lng]}
            radius={8}
            pathOptions={{ color: "#111827" }}
          >
            <Popup>Вибрана адреса</Popup>
          </AnyCircleMarker>
        )}
        {points?.map((p) => (
          <AnyCircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={7}
            pathOptions={{ color: p.address ? "#3b82f6" : "#10b981" }}
            eventHandlers={{
              click: (ev: LeafletEvent) => {
                try {
                  if (ev?.originalEvent) {
                    L.DomEvent.stop(ev.originalEvent);
                  }
                } catch {}
                if (onSelectPoint) onSelectPoint(p);
                onChange({ lat: p.lat, lng: p.lng });
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-medium mb-1">{p.name}</div>
                {p.address && (
                  <div className="text-xs text-gray-600">{p.address}</div>
                )}
              </div>
            </Popup>
          </AnyCircleMarker>
        ))}
        {route && (
          <AnyPolyline
            positions={route.map((p) => [p.lat, p.lng])}
            color="#ec4899"
          />
        )}
      </AnyMapContainer>
    </div>
  );
}
