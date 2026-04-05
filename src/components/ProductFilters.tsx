"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { ProductFilters as ProductFiltersType, SortOption } from "@/types";
import { useProductCategories } from "@/hooks/useProductCategories";
import styles from "./ProductFilters.module.css";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  sortBy: SortOption;
  onFilterChange: (filters: Partial<ProductFiltersType>) => void;
  onSortChange: (sort: SortOption) => void;
}

export function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const { data: categories } = useProductCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categories || [],
  );
  const [minPrice, setMinPrice] = useState<string>(
    filters.minPrice !== undefined ? String(filters.minPrice) : "",
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : "",
  );
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setFiltersExpanded(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const PRICE_MIN = 0;
  const PRICE_MAX = 2000;
  const hasAppliedCategory = Array.isArray(filters.categories)
    ? filters.categories.length > 0
    : false;
  const hasCategoryChanges =
    JSON.stringify(selectedCategories) !==
    JSON.stringify(filters.categories || []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    onFilterChange({
      categories: [],
      category: undefined,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  const hasActiveFilters =
    (filters.categories?.length || 0) > 0 ||
    !!filters.search ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  const normalizedSearch = useMemo(() => searchQuery.trim(), [searchQuery]);

  useEffect(() => {
    // Локальний UX: застосовуємо пошук автоматично з debounce
    const t = window.setTimeout(() => {
      onFilterChange({ search: normalizedSearch || undefined });
    }, 250);
    return () => window.clearTimeout(t);
  }, [normalizedSearch, onFilterChange]);

  useEffect(() => {
    // Синхронізуємо локальний стан з URL/зовнішніми змінами, щоб фільтри не "зникали"
    setSearchQuery(filters.search || "");
    setSelectedCategories(filters.categories || []);
    setMinPrice(filters.minPrice !== undefined ? String(filters.minPrice) : "");
    setMaxPrice(filters.maxPrice !== undefined ? String(filters.maxPrice) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    JSON.stringify(filters.categories || []),
    filters.minPrice,
    filters.maxPrice,
  ]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTitleRow}>
          <button
            type="button"
            className={styles.toggleFilters}
            onClick={() => setFiltersExpanded((v) => !v)}
            aria-expanded={filtersExpanded}
            aria-controls="filters-collapsible"
          >
            {filtersExpanded ? (
              <ChevronUp className={styles.toggleIcon} aria-hidden />
            ) : (
              <ChevronDown className={styles.toggleIcon} aria-hidden />
            )}
          </button>
          <h2 className={styles.title}>Фільтри</h2>
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} className={styles.clear}>
            <X className={styles.clearIcon} />
            Очистити
          </button>
        )}
      </div>

      <div
        id="filters-collapsible"
        className={`${styles.collapsible} ${
          filtersExpanded ? "" : styles.collapsibleClosed
        }`}
      >
      <div className={styles.group}>
        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Пошук страв..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onFilterChange({ search: normalizedSearch || undefined });
              }
            }}
            className={styles.searchBox}
          />
        </div>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Категорії</h3>

        <div className={styles.categoryList}>
          {categories?.map((category) => (
            <label
              key={category}
              className={`${styles.option} ${
                selectedCategories.includes(category) ? styles.selected : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={(e) => {
                  setSelectedCategories((prev) => {
                    if (e.target.checked) {
                      return Array.from(new Set([...prev, category]));
                    }
                    return prev.filter((c) => c !== category);
                  });
                }}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            onClick={clearFilters}
            disabled={!hasAppliedCategory}
            className={`${styles.button} ${
              hasAppliedCategory
                ? styles.buttonSecondary
                : styles.buttonDisabled
            }`}
            type="button"
          >
            Скинути
          </button>

          <button
            onClick={() =>
              onFilterChange({
                categories: selectedCategories,
                category: undefined,
              })
            }
            disabled={!hasCategoryChanges}
            className={`${styles.button} ${
              hasCategoryChanges ? styles.buttonPrimary : styles.buttonDisabled
            }`}
            type="button"
          >
            Застосувати
          </button>
        </div>
      </div>
      </div>
      {/* 
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Ціна</h3>
        <div className={styles.priceRow}>
          <input
            type="number"
            inputMode="numeric"
            placeholder="від"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className={styles.priceInput}
          />
          <span className={styles.priceDash}>—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="до"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className={styles.priceInput}
          />
        </div>
        <div className={styles.priceRangeWrap}>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10}
            value={minPrice ? Number(minPrice) : PRICE_MIN}
            onChange={(e) => {
              const nextMin = Number(e.target.value);
              const currentMax = maxPrice ? Number(maxPrice) : PRICE_MAX;
              if (nextMin > currentMax) {
                setMinPrice(String(currentMax));
              } else {
                setMinPrice(String(nextMin));
              }
            }}
            className={styles.priceRange}
            aria-label="Мінімальна ціна"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10}
            value={maxPrice ? Number(maxPrice) : PRICE_MAX}
            onChange={(e) => {
              const nextMax = Number(e.target.value);
              const currentMin = minPrice ? Number(minPrice) : PRICE_MIN;
              if (nextMax < currentMin) {
                setMaxPrice(String(currentMin));
              } else {
                setMaxPrice(String(nextMax));
              }
            }}
            className={`${styles.priceRange} ${styles.priceRangeTop}`}
            aria-label="Максимальна ціна"
          />
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              onFilterChange({ minPrice: undefined, maxPrice: undefined });
            }}
          >
            Скинути
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => {
              const min = minPrice.trim() ? Number(minPrice) : undefined;
              const max = maxPrice.trim() ? Number(maxPrice) : undefined;
              onFilterChange({
                minPrice: Number.isFinite(min as number) ? min : undefined,
                maxPrice: Number.isFinite(max as number) ? max : undefined,
              });
            }}
          >
            Застосувати
          </button>
        </div>
      </div> */}
    </div>
  );
}
