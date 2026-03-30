"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { MapPoint } from "./MapPicker";
import { useNpCities, useNpWarehouses } from "@/hooks/useNovaPoshta";
import { BACKEND_BASE_URL } from "@/lib/env";

type LatLng = { lat: number; lng: number };

interface ModalMapPickerProps {
  triggerLabel?: string;
  value?: LatLng | null;
  onChange: (val: LatLng | null) => void;
  points?: MapPoint[];
  shop?: LatLng | null;
  showRoute?: boolean;
  onAddressSelect?: (addr: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModalMapPicker({
  triggerLabel = "Відкрити мапу",
  value,
  onChange,
  points,
  shop,
  showRoute,
  onAddressSelect,
  open: openProp,
  onOpenChange,
}: ModalMapPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof openProp === "boolean";
  const open = isControlled ? (openProp as boolean) : internalOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const MapPicker = dynamic(
    () => import("./MapPicker").then((m) => m.MapPicker),
    { ssr: false }
  );
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCityRef, setSelectedCityRef] = useState<string | undefined>(
    undefined
  );
  const [tab, setTab] = useState<"both" | "warehouse" | "postomat">("both");
  const [streetQuery, setStreetQuery] = useState("");

  const bootstrappedOnceRef = useRef(false);
  const lastOpenRef = useRef(false);

  const extractCityFromAddress = (addr: string): string | null => {
    if (!addr) return null;
    const parts = addr.split(",");
    if (parts.length >= 1) {
      const candidate = parts[0].trim();
      if (candidate.length >= 2) return candidate;
    }
    return null;
  };

  const cities = useNpCities(cityQuery, 8);
  const wh = useNpWarehouses({
    cityRef: selectedCityRef,
    type: tab,
    streetQuery,
    limit: 100,
  });
  const [bootstrapPoints, setBootstrapPoints] = useState<MapPoint[]>([]);
  const [focusCenter, setFocusCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (open && !lastOpenRef.current) {
      bootstrappedOnceRef.current = false;
    }
    lastOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (selectedCityRef) return;
    if (bootstrappedOnceRef.current) return;
    (async () => {
      try {
        bootstrappedOnceRef.current = true;
        const cityNames = ["Київ", "Львів", "Одеса", "Харків", "Дніпро"];
        const cityRefs: string[] = [];
        for (const name of cityNames) {
          const res = await fetch(
            `${BACKEND_BASE_URL}/api/v1/nova-poshta/cities?query=${encodeURIComponent(
              name
            )}&limit=1`,
            { credentials: "include" }
          );
          const data = await res.json();
          const ref = data?.items?.[0]?.ref;
          if (ref) cityRefs.push(ref);
        }
        const all: MapPoint[] = [];
        for (const ref of cityRefs) {
          const url = `${BACKEND_BASE_URL}/api/v1/nova-poshta/warehouses?cityRef=${ref}&type=both&limit=50`;
          const r = await fetch(url, { credentials: "include" });
          const d = await r.json();
          if (Array.isArray(d?.points)) {
            all.push(
              ...d.points.map(
                (p: {
                  id: string;
                  name: string;
                  lat: number;
                  lng: number;
                  address?: string;
                }) => ({
                  id: p.id,
                  name: p.name,
                  lat: p.lat,
                  lng: p.lng,
                  address: p.address,
                })
              )
            );
          }
        }
        setBootstrapPoints(all);
      } catch {}
    })();
  }, [open, selectedCityRef]);

  useEffect(() => {
    if (selectedCityRef && wh.data?.points?.length) {
      const first = wh.data.points[0];
      setFocusCenter({ lat: first.lat, lng: first.lng });
      setBootstrapPoints([]);
    }
  }, [selectedCityRef, wh.data]);

  const mapPoints: MapPoint[] = useMemo(() => {
    if (wh.data?.points?.length) return wh.data.points;
    if (bootstrapPoints.length) return bootstrapPoints;
    return points || [];
  }, [wh.data, bootstrapPoints, points]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={open}
        aria-expanded={open}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {triggerLabel}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Вибір адреси на мапі</h3>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
                <div className="lg:col-span-1">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && cities.data?.items?.[0]) {
                          const c = cities.data.items[0];
                          setSelectedCityRef(c.ref);
                          setCityQuery(c.name);
                          onAddressSelect?.(c.name);
                          e.preventDefault();
                        }
                      }}
                      placeholder="Місто..."
                      className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400"
                    />
                    {cityQuery.length >= 2 && cities.data?.items && (
                      <div className="mt-2 max-h-56 overflow-auto border rounded-lg divide-y bg-white text-gray-900 shadow-sm">
                        {cities.data.items.map((c) => (
                          <button
                            type="button"
                            key={c.ref}
                            onClick={() => {
                              setSelectedCityRef(c.ref);
                              setCityQuery(c.name);
                              onAddressSelect?.(c.name);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-pink-50 text-gray-900 ${
                              selectedCityRef === c.ref ? "bg-pink-50" : ""
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {!selectedCityRef && (
                      <p className="mt-2 text-xs text-gray-500">
                        Оберіть місто зі списку, щоб побачити відділення
                      </p>
                    )}
                  </div>

                  <div className="mb-3 flex gap-2">
                    {(["both", "warehouse", "postomat"] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                          tab === t
                            ? "bg-pink-500 text-white border-pink-500"
                            : "bg-white text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {t === "both"
                          ? "Всі"
                          : t === "warehouse"
                          ? "Відділення"
                          : "Поштомати"}
                      </button>
                    ))}
                  </div>

                  <div className="mb-3">
                    <input
                      type="text"
                      value={streetQuery}
                      onChange={(e) => setStreetQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && mapPoints[0]) {
                          const p = mapPoints[0];
                          const addr = p.address || p.name;
                          onChange({ lat: p.lat, lng: p.lng });
                          setFocusCenter({ lat: p.lat, lng: p.lng });
                          setStreetQuery(addr || "");
                          const city = extractCityFromAddress(addr || "");
                          if (city) setCityQuery(city);
                          onAddressSelect?.(addr || "");
                          e.preventDefault();
                        }
                      }}
                      placeholder="Пошук по вулиці..."
                      className="w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div className="max-h-80 overflow-auto border rounded-lg divide-y">
                    {mapPoints.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          onChange({ lat: p.lat, lng: p.lng });
                          setFocusCenter({ lat: p.lat, lng: p.lng });
                          const addr = p.address || p.name;
                          setStreetQuery(addr || "");
                          const city = extractCityFromAddress(addr || "");
                          if (city) setCityQuery(city);
                          onAddressSelect?.(addr || "");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.address}</div>
                      </button>
                    ))}
                    {wh.isFetching && (
                      <div className="p-3 text-sm text-gray-500">
                        Завантаження...
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <MapPicker
                    value={value}
                    onChange={onChange}
                    points={mapPoints}
                    shop={shop}
                    showRoute={showRoute}
                    height={520}
                    focus={focusCenter}
                    fitToPoints={selectedCityRef ? mapPoints : null}
                    onSelectPoint={(p) => {
                      const addr = p.address || p.name;
                      setStreetQuery(addr || "");
                      const city = extractCityFromAddress(addr || "");
                      if (city) setCityQuery(city);
                      onAddressSelect?.(addr || "");
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  type="button"
                  className="px-3 py-2 border rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Закрити
                </button>
                <button
                  type="button"
                  className="px-3 py-2 bg-pink-500 text-white rounded-lg"
                  onClick={() => setOpen(false)}
                >
                  Застосувати
                </button>
              </div>
            </div>
          </div>,
          typeof document !== "undefined"
            ? document.body
            : (null as unknown as Element)
        )}
    </div>
  );
}
