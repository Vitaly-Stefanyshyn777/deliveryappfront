import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Shop, ShopQueryFilters } from "@/types";

export function useShops(filters: ShopQueryFilters = {}) {
  return useQuery<Shop[]>({
    queryKey: ["shops", filters],
    queryFn: () => apiClient.getShops(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShop(id: string) {
  return useQuery<Shop>({
    queryKey: ["shop", id],
    queryFn: () => apiClient.getShop(id),
    enabled: !!id,
  });
}
