"use client";

import { useMemo, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { QuickSort } from "@/components/QuickSort";
import { useProducts } from "@/hooks/useProducts";
import { apiClient } from "@/lib/api";
import { Product, ProductFilters as ProductFiltersType, Shop, SortOption } from "@/types";
import styles from "./ShopDetailsView.module.css";

export function ShopDetailsView() {
  const params = useParams();
  const shopId = params?.id as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 12,
  });
  const [sortBy, setSortBy] = useState<SortOption>("none");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await apiClient.getShop(shopId);
        if (mounted) setShop(s);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [shopId]);

  const { data } = useProducts(filters);

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
  }, [data?.items, sortBy, filters.search, filters.minPrice, filters.maxPrice]);

  const handleFilterChange = (newFilters: Partial<ProductFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    if (newSort === "name-asc")
      setFilters((prev) => ({ ...prev, sortBy: "name", sortOrder: "asc" }));
    else if (newSort === "name-desc")
      setFilters((prev) => ({ ...prev, sortBy: "name", sortOrder: "desc" }));
    else if (newSort === "price-asc")
      setFilters((prev) => ({ ...prev, sortBy: "price", sortOrder: "asc" }));
    else if (newSort === "price-desc")
      setFilters((prev) => ({ ...prev, sortBy: "price", sortOrder: "desc" }));
    else if (newSort === "none")
      setFilters((prev) => ({ ...prev, sortBy: undefined, sortOrder: undefined }));
  };

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
        <div className={styles.breadcrumb}>
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Магазини", href: "/shops" },
              { label: shop?.name || "Магазин" },
            ]}
          />
        </div>
        <h1 className={styles.title}>{shop?.name || "Магазин"}</h1>
        {shop?.address && <p className={styles.subtitle}>Адреса: {shop.address}</p>}

        <h2 className={styles.sectionTitle}>Меню</h2>
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
            <div className={styles.grid}>
              {visibleProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
