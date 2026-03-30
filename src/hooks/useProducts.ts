import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { ProductFilters } from "@/types";

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  });
}
