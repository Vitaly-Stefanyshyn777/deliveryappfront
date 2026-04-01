import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShopStore {
  selectedShopId: string | null;
  setSelectedShopId: (shopId: string) => void;
  clearSelectedShop: () => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      selectedShopId: null,
      setSelectedShopId: (shopId) => set({ selectedShopId: shopId }),
      clearSelectedShop: () => set({ selectedShopId: null }),
    }),
    { name: "shop-storage" }
  )
);

