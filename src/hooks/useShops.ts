import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Shop } from "@/types";

export function useShops(params?: { minRating?: number; maxRating?: number }) {
  return useQuery<Shop[]>({
    queryKey: ["shops", params?.minRating ?? null, params?.maxRating ?? null],
    queryFn: () => apiClient.getShops(params),
    staleTime: 2 * 60 * 1000,
  });
}

