"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { QuickSort } from "@/components/QuickSort";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useProducts } from "@/hooks/useProducts";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { Product, ProductFilters as ProductFiltersType, SortOption } from "@/types";
import styles from "./ShopCatalogView.module.css";

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

  const sortedProducts = useMemo(() => {
    if (!data?.items) return [];

    return [...data.items].sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "favorites-first": {
          const aIsFavorite = favoriteIds.includes(a.id);
          const bIsFavorite = favoriteIds.includes(b.id);
          if (aIsFavorite && !bIsFavorite) return -1;
          if (!aIsFavorite && bIsFavorite) return 1;
          return 0;
        }
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

    if (newSort === "price-asc")
      setFilters((prev) => ({ ...prev, sortBy: "price", sortOrder: "asc" }));
    else if (newSort === "price-desc")
      setFilters((prev) => ({ ...prev, sortBy: "price", sortOrder: "desc" }));
    else if (newSort === "date-asc")
      setFilters((prev) => ({ ...prev, sortBy: "createdAt", sortOrder: "asc" }));
    else if (newSort === "date-desc")
      setFilters((prev) => ({ ...prev, sortBy: "createdAt", sortOrder: "desc" }));
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
      <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
        <div className={styles.error}>
            <div className={styles.stateCenter}>
              <AlertCircle className={styles.stateIcon} />
              <h1 className={styles.errorTitle}>Помилка завантаження</h1>
              <p className={styles.loadingText}>
                Не вдалося завантажити каталог. Спробуйте пізніше.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
        <div className={styles.breadcrumb}>
          <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Меню" }]} />
        </div>

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <ProductFilters
              filters={filters}
              sortBy={sortBy}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.sectionHeader}>
              <QuickSort sortBy={sortBy} onSortChange={handleSortChange} />
            </div>

            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.loaderRow}>
                  <Loader2 className={styles.spinner} />
                  <span className={styles.loadingText}>Завантаження...</span>
                </div>
              </div>
            ) : data ? (
              <>
                <div className={styles.results}>
                  <p>
                    Знайдено {data.total} товарів
                    {filters.category && ` в категорії "${filters.category}"`}
                    {filters.search && ` за запитом "${filters.search}"`}
                  </p>
                </div>

                <div className={styles.grid}>
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {data.totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 1}
                      className={styles.pageButton}
                    >
                      Попередня
                    </button>

                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`${styles.pageButton} ${
                            page === filters.page ? styles.pageButtonActive : ""
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page === data.totalPages}
                      className={styles.pageButton}
                    >
                      Наступна
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <p className={styles.emptyText}>Товари не знайдено</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
