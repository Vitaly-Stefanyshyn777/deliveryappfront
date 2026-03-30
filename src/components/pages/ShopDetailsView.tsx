"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useShop } from "@/hooks/useShops";
import { Loader2, AlertCircle } from "lucide-react";

export function ShopDetailsView() {
  const params = useParams();
  const shopId = params?.id as string;
  const { data: shop, isLoading: isShopLoading, error: shopError } = useShop(shopId);

  const { data } = useProducts({ page: 1, limit: 12, category: "Букети" });

  if (isShopLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-600">Завантаження магазину...</span>
          </div>
        </div>
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Магазин не знайдено
            </h2>
            <p className="text-gray-600">
              Не вдалося завантажити дані магазину.
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {shop?.name || "Магазин"}
        </h1>
        {shop?.address && (
          <p className="text-gray-600 mb-6">Адреса: {shop.address}</p>
        )}

        <h2 className="text-xl font-semibold text-gray-900 mb-4">Букети</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.items?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
