"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types";
import styles from "./FavoritesView.module.css";

export function FavoritesView() {
  const { favoriteIds } = useFavoritesStore();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: allProducts } = useProducts({ page: 1, limit: 1000 });

  useEffect(() => {
    if (allProducts?.items) {
      const favorites = allProducts.items.filter((product) =>
        favoriteIds.includes(product.id)
      );
      setFavoriteProducts(favorites);
      setIsLoading(false);
    }
  }, [allProducts, favoriteIds]);

  if (isLoading) {
    return (
      <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
          <div className={styles.results}>
            <Loader2 className={styles.spinner} />
            <span className={styles.subtitle}>Завантаження улюблених...</span>
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
          <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Улюблені" }]} />
        </div>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>Мої улюблені страви</h1>
          <p className={styles.subtitle}>Позиції, які ви додали до улюблених</p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className={styles.emptyCard}>
            <Heart className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>Улюблених позицій поки немає</h2>
            <p className={styles.emptyText}>
              Додайте страви до улюблених, натиснувши на сердечко в каталозі.
            </p>
            <a href="/shop" className={styles.button}>
              Перейти до меню
            </a>
          </div>
        ) : (
          <>
            <div className={styles.results}>
              <p className={styles.subtitle}>
                Знайдено {favoriteProducts.length} улюблених позицій
              </p>
            </div>
            <div className={styles.grid}>
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
