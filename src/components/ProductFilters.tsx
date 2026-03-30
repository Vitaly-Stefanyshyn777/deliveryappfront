"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ProductFilters as ProductFiltersType, SortOption } from "@/types";
import { useProductCategories } from "@/hooks/useProductCategories";

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
    setSelectedCategories([]);
    onFilterChange({ categories: [], category: undefined, search: undefined });
  };

  const hasActiveFilters =
    (filters.categories?.length || 0) > 0 || !!filters.search;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Фільтри</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-pink-500 hover:text-pink-600 flex items-center"
          >
            <X className="h-4 w-4 mr-1" />
            Очистити
          </button>
        )}
      </div>

      {/* <div className="mb-6">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Пошук квітів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </form>
      </div> */}

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Категорії</h3>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {categories?.map((category) => (
            <label
              key={category}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                selectedCategories.includes(category)
                  ? "border-pink-200 bg-pink-50"
                  : "border-gray-200 hover:bg-gray-50"
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
              <span className="text-gray-800">{category}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={clearFilters}
            disabled={!hasAppliedCategory}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasAppliedCategory
                ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
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
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasCategoryChanges
                ? "bg-pink-500 text-white hover:bg-pink-600"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
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
