"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { apiClient } from "@/lib/api";
import { Shop } from "@/types";
import styles from "./ShopDetailsView.module.css";

export function ShopDetailsView() {
  const params = useParams();
  const shopId = params?.id as string;
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await apiClient.getShop(shopId);
        if (mounted) setShop(s);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [shopId]);

  const { data } = useProducts({ page: 1, limit: 12 });

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
        <h1 className={styles.title}>{shop?.name || "Магазин"}</h1>
        {shop?.address && <p className={styles.subtitle}>Адреса: {shop.address}</p>}

        <h2 className={styles.sectionTitle}>Меню</h2>
        <div className={styles.grid}>
          {data?.items?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
