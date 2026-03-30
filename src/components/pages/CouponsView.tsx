"use client";

import Image from "next/image";
import { Header } from "@/components/Header";
import { useActiveCoupons } from "@/hooks/useCoupons";

export function CouponsView() {
  const { data, isLoading, error } = useActiveCoupons();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Активні купони
        </h1>

        {isLoading && <div>Завантаження…</div>}
        {error && (
          <div className="text-red-600">Помилка завантаження купонів</div>
        )}
        {!isLoading && !error && (!data || data.length === 0) && (
          <div className="text-gray-500">Наразі активних купонів немає.</div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((c) => (
            <div
              key={c.code}
              className="p-3 border rounded-lg flex flex-col bg-white text-gray-900"
            >
              {c.imageUrl && (
                <div className="relative w-full h-36 mb-3 overflow-hidden rounded">
                  <Image
                    src={c.imageUrl}
                    alt={c.code}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="font-medium mb-1 text-gray-900">
                {c.description || "Купон"} ({c.code})
              </div>
              <div className="text-sm text-gray-700 mb-3">
                {c.discountPercent
                  ? `Знижка ${c.discountPercent}%`
                  : c.discountAmount
                  ? `Знижка -${c.discountAmount} ₴`
                  : ""}
              </div>
              <div className="mt-auto">
                <button
                  type="button"
                  className="px-3 py-2 border rounded-lg text-sm text-gray-900"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(c.code);
                    } catch {}
                  }}
                >
                  Скопіювати код
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
