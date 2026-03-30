"use client";

import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
  };

  const discountPercent = (() => {
    if (typeof product.discountPercent === "number") {
      return Math.round(product.discountPercent);
    }
    if (product.priceOriginal && product.priceOriginal > product.price) {
      return Math.round((1 - product.price / product.priceOriginal) * 100);
    }
    return 0;
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />

        {/* Бейджі: Новинка / -% / Хіт */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {product.isNew && (
            <span className="px-3 py-1 rounded-2xl bg-white text-purple-700 text-sm font-semibold shadow-sm">
              Новинка
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-3 py-1 rounded-2xl bg-purple-600 text-white text-sm font-semibold shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isHit && (
            <span className="px-3 py-1 rounded-2xl bg-red-500 text-white text-sm font-semibold shadow-sm">
              Хіт
            </span>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite(product.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-400"
            }`}
          />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="text-xs text-pink-500 font-medium uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {product.price} ₴
            </span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className="text-xl text-gray-400 line-through">
                {product.priceOriginal} ₴
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center space-x-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-medium">В кошик</span>
          </button>
        </div>
      </div>
    </div>
  );
}
