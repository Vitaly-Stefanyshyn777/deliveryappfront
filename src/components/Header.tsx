"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Flower } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useEffect, useState } from "react";

export function Header() {
  const { getTotalItems } = useCartStore();
  const { favoriteIds } = useFavoritesStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2">
            <Flower className="h-8 w-8 text-pink-500" />
            <span className="text-xl font-bold text-gray-900">
              Квітковий рай
            </span>
          </Link>

          {/* Навігація */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/shops"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Магазини
            </Link>
            <Link
              href="/shop"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Магазин
            </Link>
            <Link
              href="/cart"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Кошик
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Мої замовлення
            </Link>
            <Link
              href="/coupons"
              className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Купони
            </Link>
          </nav>

          {/* Іконки дій */}
          <div className="flex items-center space-x-4">
            <Link
              href="/favorites"
              className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <Heart className="h-6 w-6" />
              {isHydrated && favoriteIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {isHydrated && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
