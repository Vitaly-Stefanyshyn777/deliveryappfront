"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Heart, UtensilsCrossed, Menu, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const { favoriteIds } = useFavoritesStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    // На зміну маршруту — закриваємо меню, щоб не блокувати скрол
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand}>
            <UtensilsCrossed className={styles.brandIcon} />
            <span>Delivery App</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/shops" className={styles.navLink}>
              Магазини
            </Link>
            <Link href="/shop" className={styles.navLink}>
              Магазин
            </Link>

            <Link href="/orders" className={styles.navLink}>
              Мої замовлення
            </Link>
            <Link href="/coupons" className={styles.navLink}>
              Купони
            </Link>
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.burgerButton} ${
                mobileMenuOpen ? styles.burgerHidden : ""
              }`}
              aria-label="Відкрити меню"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className={styles.icon} />
            </button>

            <Link href="/favorites" className={styles.iconButton}>
              <Heart className={styles.icon} />
              {isHydrated && favoriteIds.length > 0 && (
                <span className={`${styles.badge} ${styles.badgeIcon}`}>
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className={styles.iconButton}>
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

      {mobileMenuOpen && (
        <div
          className={styles.mobileMenuOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Мобільне меню"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className={styles.mobileMenuPanel} id="mobile-nav">
            <div className={styles.mobileMenuHeader}>
              <span className={styles.mobileMenuTitle}>Меню</span>
              <button
                type="button"
                className={styles.mobileMenuClose}
                aria-label="Закрити меню"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className={styles.icon} />
              </button>
            </div>
            <nav className={styles.mobileNav}>
              <Link
                href="/shops"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Магазини
              </Link>
              <Link
                href="/shop"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Магазин
              </Link>
              <Link
                href="/favorites"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Улюблені
              </Link>
              <Link
                href="/cart"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Кошик
              </Link>
              <Link
                href="/orders"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Мої замовлення
              </Link>
              <Link
                href="/coupons"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Купони
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
