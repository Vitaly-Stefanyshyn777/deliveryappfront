"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Loader2, AlertCircle, MapPin, Star } from "lucide-react";
import { useShops } from "@/hooks/useShops";
import { ShopQueryFilters } from "@/types";

const RATING_PRESETS: Array<{
  label: string;
  filters: ShopQueryFilters;
}> = [
  { label: "Всі", filters: {} },
  { label: "4.0 - 5.0", filters: { minRating: 4, maxRating: 5 } },
  { label: "3.0 - 4.0", filters: { minRating: 3, maxRating: 4 } },
  { label: "2.0 - 3.0", filters: { minRating: 2, maxRating: 3 } },
];

export function ShopsListView() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activeFilters = RATING_PRESETS[activePresetIndex].filters;
  const { data, isLoading, error } = useShops(activeFilters);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Магазини</h1>
            <p className="text-gray-600">
              Оберіть магазин і відфільтруйте їх за рейтингом
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {RATING_PRESETS.map((preset, index) => {
              const isActive = index === activePresetIndex;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setActivePresetIndex(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-pink-500 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-600">Завантаження магазинів...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Помилка завантаження
            </h2>
            <p className="text-gray-600">
              Не вдалося завантажити список магазинів.
            </p>
          </div>
        )}

        {!isLoading && !error && (!data || data.length === 0) && (
          <div className="text-center py-12 text-gray-600">
            Магазини для вибраного діапазону рейтингу не знайдені.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((shop) => {
            const rating = typeof shop.rating === "number" ? shop.rating : null;

            return (
              <Link
                key={shop.id}
                href={`/shops/${shop.id}`}
                className="block p-5 bg-white border rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="text-lg font-semibold text-gray-900">
                    {shop.name}
                  </div>
                  {rating !== null && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-pink-500" />
                  <span>{shop.address}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
