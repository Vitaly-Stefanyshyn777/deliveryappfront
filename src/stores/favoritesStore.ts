import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favoriteIds: string[];
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

function uniq(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addToFavorites: (productId) => {
        const { favoriteIds } = get();
        if (!favoriteIds.includes(productId)) set({ favoriteIds: uniq([...favoriteIds, productId]) });
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
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (!state?.favoriteIds?.length) return;
        const deduped = uniq(state.favoriteIds);
        if (deduped.length !== state.favoriteIds.length) {
          useFavoritesStore.setState({ favoriteIds: deduped });
        }
      },
    }
  )
);
