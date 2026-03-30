"use client";

import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import styles from "./ProductCard.module.css";

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
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={300}
          height={200}
          className={styles.image}
        />

        {/* Бейджі: Новинка / -% / Хіт */}
        <div className={styles.tags}>
          {product.isNew && (
            <span className={`${styles.tag} ${styles.tagNew}`}>
              Новинка
            </span>
          )}
          {discountPercent > 0 && (
            <span className={`${styles.tag} ${styles.tagDiscount}`}>
              -{discountPercent}%
            </span>
          )}
          {product.isHit && (
            <span className={`${styles.tag} ${styles.tagHit}`}>
              Хіт
            </span>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className={styles.favoriteButton}
        >
          <Heart
            className={`${styles.favoriteIcon} ${
              isFavorite(product.id) ? styles.favoriteActive : styles.favoriteInactive
            }`}
          />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{product.category}</span>
        </div>

        <h3 className={styles.title}>
          {product.name}
        </h3>

        <p className={styles.description}>
          {product.description}
        </p>

        <div className={styles.footer}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>
              {product.price} ₴
            </span>
            {product.priceOriginal && product.priceOriginal > product.price && (
              <span className={styles.priceOld}>
                {product.priceOriginal} ₴
              </span>
            )}
          </div>

          <button onClick={handleAddToCart} className={styles.button}>
            <ShoppingCart className={styles.buttonIcon} />
            <span>В кошик</span>
          </button>
        </div>
      </div>
    </article>
  );
}
