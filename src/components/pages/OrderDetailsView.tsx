"use client";

import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OrderDetails } from "@/components/OrderDetails";
import { useOrder } from "@/hooks/useOrders";
import { useCartStore } from "@/stores/cartStore";
import { apiClient } from "@/lib/api";
import styles from "./OrderDetailsView.module.css";

export function OrderDetailsView() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);
  const { addOrderItems } = useCartStore();
  const [imageByProductId, setImageByProductId] = useState<Record<string, string>>({});
  const imageByProductIdRef = useRef<Record<string, string>>({});
  useEffect(() => {
    imageByProductIdRef.current = imageByProductId;
  }, [imageByProductId]);

  useEffect(() => {
    if (!order?.items?.length) return;

    const known: Record<string, string> = {};
    for (const i of order.items) {
      const url = i.product?.imageUrl;
      if (url) known[i.productId] = url;
    }
    if (Object.keys(known).length) {
      setImageByProductId((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [k, v] of Object.entries(known)) {
          if (next[k] !== v) {
            next[k] = v;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }

    const current = imageByProductIdRef.current;
    const missing = Array.from(
      new Set(
        order.items
          .filter((i) => !(i.product?.imageUrl || current[i.productId] || known[i.productId]))
          .map((i) => i.productId)
      )
    );
    if (!missing.length) return;

    let alive = true;
    (async () => {
      const products = await Promise.all(
        missing.map(async (id) => {
          try {
            return await apiClient.getProduct(id);
          } catch {
            return null;
          }
        })
      );
      if (!alive) return;
      const patch: Record<string, string> = {};
      for (const p of products) {
        if (p?.id && p.imageUrl) patch[p.id] = p.imageUrl;
      }
      if (Object.keys(patch).length) {
        setImageByProductId((prev) => {
          let changed = false;
          const next = { ...prev };
          for (const [k, v] of Object.entries(patch)) {
            if (next[k] !== v) {
              next[k] = v;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [order]);

  if (isLoading) {
      return (
        <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
          <div className={styles.stateCard}>
            <Loader2 className={styles.loaderIcon} />
            <span className={styles.stateText}>Завантаження замовлення...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
          <div className={styles.stateCard}>
            <AlertCircle className={styles.errorIcon} />
            <h2 className={styles.stateText}>Помилка завантаження</h2>
            <p className={styles.stateText}>
              Не вдалося завантажити деталі замовлення.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
          <div className={styles.stateCard}>
            <AlertCircle className={styles.emptyIcon} />
            <h2 className={styles.stateText}>Замовлення не знайдено</h2>
            <p className={styles.stateText}>Замовлення з таким ID не існує.</p>
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
          <Breadcrumbs
            items={[
              { label: "Головна", href: "/" },
              { label: "Мої замовлення", href: "/orders" },
              { label: "Деталі" },
            ]}
          />
        </div>
        <OrderDetails order={order} imageByProductId={imageByProductId} />
        <button
          type="button"
          className={styles.reorderButton}
          onClick={async () => {
            addOrderItems(
              order.items.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                qty: i.qty,
                imageUrl: i.product?.imageUrl || imageByProductId[i.productId] || "",
              }))
            );
          }}
        >
          Повторити замовлення
        </button>
      </div>
    </div>
  );
}
