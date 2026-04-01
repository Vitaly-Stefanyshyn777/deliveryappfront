"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MapPin, Star, AlertCircle, Loader2 } from "lucide-react";
import { useShops } from "@/hooks/useShops";
import { useShopStore } from "@/stores/shopStore";
import styles from "./ShopsListView.module.css";

export function ShopsListView() {
  const router = useRouter();
  const { setSelectedShopId } = useShopStore();
  const [ratingFilter, setRatingFilter] = useState<"all" | "4-5" | "3-4" | "2-3">(
    "all"
  );

  const ratingParams = useMemo(() => {
    if (ratingFilter === "4-5") return { minRating: 4, maxRating: 5 };
    if (ratingFilter === "3-4") return { minRating: 3, maxRating: 4 };
    if (ratingFilter === "2-3") return { minRating: 2, maxRating: 3 };
    return undefined;
  }, [ratingFilter]);

  const { data, isLoading, error } = useShops(ratingParams);

  const filteredShops = useMemo(() => {
    return data || [];
  }, [data]);

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
        <div className={styles.breadcrumb}>
          <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Магазини" }]} />
        </div>
        <div className={styles.headerCard}>
          <h1 className={styles.title}>Магазини</h1>
          <p className={styles.subtitle}>
            Оберіть магазин і відфільтруйте його за рейтингом
          </p>
        </div>

        <div className={styles.filterRow}>
          {[
            { key: "all", label: "Всі" },
            { key: "4-5", label: "4.0 - 5.0" },
            { key: "3-4", label: "3.0 - 4.0" },
            { key: "2-3", label: "2.0 - 3.0" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRatingFilter(item.key as typeof ratingFilter)}
              className={`${styles.filterButton} ${
                ratingFilter === item.key ? styles.filterButtonActive : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {isLoading ? (
            <div className={styles.loadingCard}>
              <Loader2 className={styles.spinner} />
              <div>Завантаження магазинів...</div>
            </div>
          ) : error ? (
            <div className={styles.loadingCard}>
              <AlertCircle className={styles.stateIcon} />
              <div>Не вдалося завантажити магазини</div>
            </div>
          ) : (
            filteredShops.map((s) => (
              <button
                key={s.id}
                type="button"
                className={styles.shopCard}
                onClick={() => {
                  setSelectedShopId(s.id);
                  router.push(`/shops/${s.id}`);
                }}
              >
                <div className={styles.shopTitleRow}>
                  <h2 className={styles.shopName}>{s.name}</h2>
                  {typeof s.rating === "number" && (
                    <span className={styles.rating}>
                      <Star className={styles.ratingIcon} />
                      {s.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className={styles.address}>
                  <MapPin className={styles.addressIcon} />
                  <span>{s.address}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
