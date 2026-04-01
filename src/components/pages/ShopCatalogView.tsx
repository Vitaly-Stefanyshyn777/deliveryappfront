"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQs = useMemo(() => searchParams.toString(), [searchParams]);
  const { favoriteIds } = useFavoritesStore();
  const [filters, setFilters] = useState<ProductFiltersType>(() => {
    const categories = searchParams.getAll("categories[]");
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "12");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") as ProductFiltersType["sortBy"];
    const sortOrder = searchParams.get("sortOrder") as ProductFiltersType["sortOrder"];

    return {
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 12,
      category: searchParams.get("category") || undefined,
      categories: categories.length ? categories : undefined,
      search: searchParams.get("search") || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    };
  });
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sb = searchParams.get("uiSort") as SortOption | null;
    if (sb) return sb;
    // derive from backend sort params
    const backendSortBy = searchParams.get("sortBy");
    const backendSortOrder = searchParams.get("sortOrder");
    if (backendSortBy === "name" && backendSortOrder === "asc") return "name-asc";
    if (backendSortBy === "name" && backendSortOrder === "desc") return "name-desc";
    if (backendSortBy === "price" && backendSortOrder === "asc") return "price-asc";
    if (backendSortBy === "price" && backendSortOrder === "desc") return "price-desc";
    if (backendSortBy === "createdAt" && backendSortOrder === "asc") return "date-asc";
    if (backendSortBy === "createdAt" && backendSortOrder === "desc") return "date-desc";
    return "none";
  });

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(filters.page ?? 1));
    params.set("limit", String(filters.limit ?? 12));
    if (filters.category) params.set("category", filters.category);
    if (filters.categories?.length) {
      filters.categories.forEach((c) => params.append("categories[]", c));
    }
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (sortBy && sortBy !== "none") params.set("uiSort", sortBy);
    const qs = params.toString();
    if (qs === currentQs) return;
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, sortBy, pathname, router, currentQs]);

  const { data, isLoading, error } = useProducts(filters);

  const visibleProducts = useMemo(() => {
    if (!data?.items) return [];

    const sorted = [...data.items].sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "uk");
        case "name-desc":
          return b.name.localeCompare(a.name, "uk");
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

    const q = (filters.search || "").trim().toLowerCase();
    const priceMin = filters.minPrice ?? null;
    const priceMax = filters.maxPrice ?? null;

    return sorted.filter((p) => {
      if (priceMin !== null && p.price < priceMin) return false;
      if (priceMax !== null && p.price > priceMax) return false;
      if (!q) return true;
      const name = p.name?.toLowerCase() || "";
      const desc = p.description?.toLowerCase() || "";
      const cat = p.category?.toLowerCase() || "";
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [data?.items, sortBy, favoriteIds, filters.search, filters.minPrice, filters.maxPrice]);

  const handleFilterChange = useCallback((newFilters: Partial<ProductFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);

    if (newSort === "name-asc")
      setFilters((prev) => ({ ...prev, sortBy: "name", sortOrder: "asc" }));
    else if (newSort === "name-desc")
      setFilters((prev) => ({ ...prev, sortBy: "name", sortOrder: "desc" }));
    else if (newSort === "price-asc")
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
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

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
                  {visibleProducts.map((product) => (
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
