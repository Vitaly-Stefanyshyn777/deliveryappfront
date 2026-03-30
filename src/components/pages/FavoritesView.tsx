"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProducts } from "@/hooks/useProducts";
import { Heart, Loader2 } from "lucide-react";
import { Product } from "@/types";

export function FavoritesView() {
  const { favoriteIds } = useFavoritesStore();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allProducts } = useProducts({ page: 1, limit: 1000 });

  useEffect(() => {
    if (allProducts?.items) {
      const favorites = allProducts.items.filter((product) =>
        favoriteIds.includes(product.id)
      );
      setFavoriteProducts(favorites);
      setIsLoading(false);
    }
  }, [allProducts, favoriteIds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-600">
              Завантаження улюблених...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Breadcrumbs
            items={[{ label: "Головна", href: "/" }, { label: "Улюблені" }]}
          />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Мої улюблені квіти
          </h1>
          <p className="text-gray-600">Квіти, які ви додали до улюблених</p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Улюблених квітів поки немає
            </h2>
            <p className="text-gray-600 mb-8">
              Додайте квіти до улюблених, натиснувши на сердечко в каталозі.
            </p>
            <a
              href="/shop"
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Перейти до магазину
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Знайдено {favoriteProducts.length} улюблених квітів
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
