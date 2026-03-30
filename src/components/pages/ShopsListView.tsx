"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { MapPin, Star } from "lucide-react";
import styles from "./ShopsListView.module.css";

const DEMO_SHOPS = [
  {
    id: "761ed028-1003-43cd-aa26-26370908ab1d",
    name: "Burger Express",
    address: "Київ, Хрещатик 22",
    rating: 4.9,
  },
  {
    id: "ee2cdbe6-5e6c-4222-bde3-d1fc754d6007",
    name: "Pizza Point",
    address: "Львів, Шевченка 8",
    rating: 4.8,
  },
  {
    id: "15507b63-c0ab-4ae8-ba35-bb5bc9f834d1",
    name: "Sushi Lane",
    address: "Київ, Перемоги 15",
    rating: 4.4,
  },
];

export function ShopsListView() {
  const [ratingFilter, setRatingFilter] = useState<"all" | "4-5" | "3-4" | "2-3">(
    "all"
  );

  const filteredShops = useMemo(() => {
    return DEMO_SHOPS.filter((shop) => {
      if (ratingFilter === "all") return true;
      if (ratingFilter === "4-5") return shop.rating >= 4;
      if (ratingFilter === "3-4") return shop.rating >= 3 && shop.rating < 4;
      return shop.rating >= 2 && shop.rating < 3;
    });
  }, [ratingFilter]);

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
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
          {filteredShops.map((s) => (
            <Link key={s.id} href={`/shops/${s.id}`} className={styles.shopCard}>
              <div className={styles.shopTitleRow}>
                <h2 className={styles.shopName}>{s.name}</h2>
                <span className={styles.rating}>
                  <Star className={styles.ratingIcon} />
                  {s.rating.toFixed(1)}
                </span>
              </div>
              <div className={styles.address}>
                <MapPin className={styles.addressIcon} />
                <span>{s.address}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
