import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CreateOrderRequest } from "@/types";

export function useOrders(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["orders", page, limit],
    queryFn: () => apiClient.getOrders(page, limit),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) =>
      apiClient.createOrder(orderData),
    onSuccess: () => {
      // Оновлюємо кеш замовлень
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
