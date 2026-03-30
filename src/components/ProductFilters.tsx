"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
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
    filters.categories || []
  );
  const hasAppliedCategory = Array.isArray(filters.categories)
    ? filters.categories.length > 0
    : false;
  const hasCategoryChanges =
    JSON.stringify(selectedCategories) !==
    JSON.stringify(filters.categories || []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    onFilterChange({ categories: [], category: undefined, search: undefined });
  };

  const hasActiveFilters =
    (filters.categories?.length || 0) > 0 || !!filters.search;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Фільтри</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={styles.clear}
          >
            <X className={styles.clearIcon} />
            Очистити
          </button>
        )}
      </div>

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
                onFilterChange({ search: searchQuery || undefined });
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
              hasAppliedCategory ? styles.buttonSecondary : styles.buttonDisabled
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
  );
}
