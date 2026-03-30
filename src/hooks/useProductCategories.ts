import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useProductCategories() {
  return useQuery({
    queryKey: ["product-categories"],
    queryFn: () => apiClient.getProductCategories(),
    staleTime: 10 * 60 * 1000,
  });
}
