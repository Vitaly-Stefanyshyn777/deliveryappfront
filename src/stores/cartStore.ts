import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, qty = 1) => {
        const { items } = get();
        const normalizedQty = Math.max(1, Math.floor(qty));
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, qty: i.qty + normalizedQty }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, qty: normalizedQty }],
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, qty) => {
        const { items } = get();
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: items.map((item) =>
            item.productId === productId ? { ...item, qty } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.qty, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.qty, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
