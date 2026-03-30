import { useQuery, useMutation } from "@tanstack/react-query";
import { Coupon } from "@/types";
import { getActiveCoupons, validateCoupon } from "@/lib/api";

export function useActiveCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ["coupons", "active"],
    queryFn: getActiveCoupons,
    staleTime: 60_000,
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, total }: { code: string; total: number }) =>
      validateCoupon(code, total),
  });
}
