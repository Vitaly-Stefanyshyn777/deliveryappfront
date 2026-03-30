"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { QuickSort } from "@/components/QuickSort";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useProducts } from "@/hooks/useProducts";
import {
  ProductFilters as ProductFiltersType,
  SortOption,
  Product,
} from "@/types";
import { Loader2 } from "lucide-react";
import { useFavoritesStore } from "@/stores/favoritesStore";

export function ShopCatalogView() {
  const searchParams = useSearchParams();
  const { favoriteIds } = useFavoritesStore();
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 12,
    category: searchParams.get("category") || undefined,
    search: searchParams.get("search") || undefined,
  });
  const [sortBy, setSortBy] = useState<SortOption>("none");

  const { data, isLoading, error } = useProducts(filters);

  // Сортування продуктів
  const sortedProducts = useMemo(() => {
    if (!data?.items) return [];

    return [...data.items].sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "none":
          return 0;
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "favorites-first":
          const aIsFavorite = favoriteIds.includes(a.id);
          const bIsFavorite = favoriteIds.includes(b.id);
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          return 0;
        default:
          return 0;
      }
    });
  }, [data?.items, sortBy, favoriteIds]);

  const handleFilterChange = (newFilters: Partial<ProductFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    // Синхронізуємо з бекенд-параметрами
    if (newSort === "price-asc")
      setFilters((prev) => ({ ...prev, sortBy: "price", sortOrder: "asc" }));
    else if (newSort === "price-desc")
      setFilters((prev) => ({ ...prev, sortBy: "price", sortOrder: "desc" }));
    else if (newSort === "date-asc")
      setFilters((prev) => ({
        ...prev,
        sortBy: "createdAt",
        sortOrder: "asc",
      }));
    else if (newSort === "date-desc")
      setFilters((prev) => ({
        ...prev,
        sortBy: "createdAt",
        sortOrder: "desc",
      }));
    else if (newSort === "none")
      setFilters((prev) => ({
        ...prev,
        sortBy: undefined,
        sortOrder: undefined,
      }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Помилка завантаження
            </h1>
            <p className="text-gray-600">
              Не вдалося завантажити каталог квітів. Спробуйте пізніше.
            </p>
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
            items={[{ label: "Головна", href: "/" }, { label: "Магазин" }]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Фільтри */}
          <div className="lg:w-64 flex-shrink-0">
            <ProductFilters
              filters={filters}
              sortBy={sortBy}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
            />
            {/* <div className="mt-6 p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Букети</h3>
                <Link
                  href="/shop?category=Букети"
                  className="text-sm text-pink-600 hover:underline"
                >
                  Показати всі
                </Link>
              </div>
              <p className="text-sm text-gray-600">
                Переглянь добірку: «Червона любов», «Ніжність», «Весняний
                настрій», «Білий шовк».
              </p>
            </div> */}
          </div>

          {/* Каталог */}
          <div className="flex-1">
            {/* Швидке сортування (на всю ширину контейнера) */}
            <div className="mb-6">
              <QuickSort sortBy={sortBy} onSortChange={handleSortChange} />
            </div>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                <span className="ml-2 text-gray-600">Завантаження...</span>
              </div>
            ) : data ? (
              <>
                {/* Результати */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    Знайдено {data.total} товарів
                    {filters.category && ` в категорії "${filters.category}"`}
                    {filters.search && ` за запитом "${filters.search}"`}
                  </p>
                </div>

                {/* Сітка товарів */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Пагінація */}
                {data.totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.page! - 1)}
                        disabled={filters.page === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Попередня
                      </button>

                      {Array.from(
                        { length: data.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === filters.page
                              ? "bg-pink-500 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(filters.page! + 1)}
                        disabled={filters.page === data.totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Наступна
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Товари не знайдено</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
