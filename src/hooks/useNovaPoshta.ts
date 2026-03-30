import { useQuery } from "@tanstack/react-query";
import { BACKEND_BASE_URL } from "@/lib/env";

export interface NpCity {
  ref: string;
  name: string;
  region?: string;
}

export interface NpPoint {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  isPostomat: boolean;
  cityRef: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(
    url.startsWith("http") ? url : `${BACKEND_BASE_URL}${url}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useNpCities(query: string, limit: number = 10) {
  return useQuery<{ items: NpCity[] }>({
    queryKey: ["np-cities", query, limit],
    queryFn: () =>
      fetchJson(
        `/api/v1/nova-poshta/cities?query=${encodeURIComponent(
          query
        )}&limit=${limit}`
      ),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNpWarehouses(params: {
  cityRef?: string;
  type?: "warehouse" | "postomat" | "both";
  streetQuery?: string;
  page?: number;
  limit?: number;
}) {
  const {
    cityRef,
    type = "both",
    streetQuery = "",
    page = 1,
    limit = 100,
  } = params;
  const qs = new URLSearchParams();
  if (cityRef) qs.append("cityRef", cityRef);
  if (type) qs.append("type", type);
  if (streetQuery) qs.append("streetQuery", streetQuery);
  qs.append("page", String(page));
  qs.append("limit", String(limit));
  const url = `/api/v1/nova-poshta/warehouses?${qs.toString()}`;

  return useQuery<{
    points: NpPoint[];
    meta?: { total: number; page: number; limit: number };
  }>({
    queryKey: ["np-warehouses", cityRef, type, streetQuery, page, limit],
    queryFn: () => fetchJson(url),
    enabled: Boolean(cityRef),
    staleTime: 2 * 60 * 1000,
    retry: 1, // Повторити тільки 1 раз
    retryDelay: 1000, // Затримка 1 секунда
  });
}
