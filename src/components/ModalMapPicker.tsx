"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { MapPoint } from "./MapPicker";
import { useNpCities, useNpWarehouses } from "@/hooks/useNovaPoshta";
import { BACKEND_BASE_URL } from "@/lib/env";
import styles from "./ModalMapPicker.module.css";

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
            )}&limit=1`
          );
          const data = await res.json();
          const ref = data?.items?.[0]?.ref;
          if (ref) cityRefs.push(ref);
        }
        const all: MapPoint[] = [];
        for (const ref of cityRefs) {
          const url = `${BACKEND_BASE_URL}/api/v1/nova-poshta/warehouses?cityRef=${ref}&type=both&limit=50`;
          const r = await fetch(url);
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
    <div className={styles.root}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={open}
        aria-expanded={open}
        className={styles.triggerButton}
      >
        {triggerLabel}
      </button>

      {open &&
        createPortal(
          <div className={styles.overlayWrap}>
            <div
              className={styles.overlay}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            />
            <div className={styles.modal}>
              <div className={styles.header}>
                <h3 className={styles.title}>Вибір адреси на мапі</h3>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.body}>
                <div className={styles.sidebar}>
                  <div className={styles.section}>
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
                      className={styles.input}
                    />
                    {cityQuery.length >= 2 && cities.data?.items && (
                      <div className={styles.suggestions}>
                        {cities.data.items.map((c) => (
                          <button
                            type="button"
                            key={c.ref}
                            onClick={() => {
                              setSelectedCityRef(c.ref);
                              setCityQuery(c.name);
                              onAddressSelect?.(c.name);
                            }}
                            className={`${styles.suggestionButton} ${
                              selectedCityRef === c.ref
                                ? styles.suggestionActive
                                : ""
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {!selectedCityRef && (
                      <p className={styles.hint}>
                        Оберіть місто зі списку, щоб побачити відділення
                      </p>
                    )}
                  </div>

                  <div className={styles.tabs}>
                    {(["both", "warehouse", "postomat"] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTab(t)}
                        className={`${styles.tab} ${
                          tab === t ? styles.tabActive : ""
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

                  <div className={styles.section}>
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
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.list}>
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
                        className={styles.listButton}
                      >
                        <div className={styles.listTitle}>{p.name}</div>
                        <div className={styles.listMeta}>{p.address}</div>
                      </button>
                    ))}
                    {wh.isFetching && (
                      <div className={styles.listMeta}>Завантаження...</div>
                    )}
                  </div>
                </div>

                <div className={styles.mapWrap}>
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
              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.footerButton}
                  onClick={() => setOpen(false)}
                >
                  Закрити
                </button>
                <button
                  type="button"
                  className={`${styles.footerButton} ${styles.footerPrimary}`}
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
