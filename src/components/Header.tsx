"use client";

import Link from "next/link";
import { ShoppingCart, Heart, UtensilsCrossed } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export function Header() {
  const { getTotalItems } = useCartStore();
  const { favoriteIds } = useFavoritesStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand}>
            <UtensilsCrossed className={styles.brandIcon} />
            <span>Delivery App</span>
          </Link>

          <nav className={styles.nav}>
            <Link
              href="/shops"
              className={styles.navLink}
            >
              Магазини
            </Link>
            <Link
              href="/shop"
              className={styles.navLink}
            >
              Магазин
            </Link>
            <Link
              href="/cart"
              className={styles.navLink}
            >
              Кошик
            </Link>
            <Link
              href="/orders"
              className={styles.navLink}
            >
              Мої замовлення
            </Link>
            <Link
              href="/coupons"
              className={styles.navLink}
            >
              Купони
            </Link>
          </nav>

          <div className={styles.actions}>
            <Link
              href="/favorites"
              className={styles.iconButton}
            >
              <Heart className={styles.icon} />
              {isHydrated && favoriteIds.length > 0 && (
                <span className={`${styles.badge} ${styles.badgeIcon}`}>
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className={styles.iconButton}
            >
              <ShoppingCart className={styles.icon} />
              {isHydrated && getTotalItems() > 0 && (
                <span className={`${styles.badge} ${styles.badgeIcon}`}>
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
