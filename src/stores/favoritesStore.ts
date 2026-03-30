import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favoriteIds: string[];
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addToFavorites: (productId) => {
        const { favoriteIds } = get();
        if (!favoriteIds.includes(productId)) {
          set({ favoriteIds: [...favoriteIds, productId] });
        }
      },

      removeFromFavorites: (productId) => {
        const { favoriteIds } = get();
        set({ favoriteIds: favoriteIds.filter((id) => id !== productId) });
      },

      isFavorite: (productId) => {
        const { favoriteIds } = get();
        return favoriteIds.includes(productId);
      },

      toggleFavorite: (productId) => {
        const { isFavorite, addToFavorites, removeFromFavorites } = get();
        if (isFavorite(productId)) {
          removeFromFavorites(productId);
        } else {
          addToFavorites(productId);
        }
      },
    }),
    {
      name: "favorites-storage",
    }
  )
);
