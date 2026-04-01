"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { AlertCircle, Calendar, Loader2, MapPin, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useCartStore } from "@/stores/cartStore";
import { apiClient } from "@/lib/api";
import { useOrders } from "@/hooks/useOrders";
import styles from "./OrdersListView.module.css";

export function OrdersListView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useOrders(page, 10);
  const { addOrderItems } = useCartStore();
  const [imageByProductId, setImageByProductId] = useState<Record<string, string>>({});
  const imageByProductIdRef = useRef<Record<string, string>>({});
  useEffect(() => {
    imageByProductIdRef.current = imageByProductId;
  }, [imageByProductId]);

  const formatDate = (d: string) =>
    format(new Date(d), "dd MMM yyyy, HH:mm", { locale: uk });

  const filtered = useMemo(() => {
    const base = data?.items ?? [];
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((o) => {
      return (
        o.id.toLowerCase().includes(q) ||
        o.deliveryAddr.toLowerCase().includes(q) ||
        o.shop.name.toLowerCase().includes(q) ||
        (o.customerEmail || "").toLowerCase().includes(q) ||
        (o.customerPhone || "").toLowerCase().includes(q)
      );
    });
  }, [data?.items, searchQuery]);

  useEffect(() => {
    if (!filtered.length) return;

    const known: Record<string, string> = {};
    for (const o of filtered) {
      for (const i of o.items ?? []) {
        const url = i.product?.imageUrl;
        if (url) known[i.productId] = url;
      }
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

    const missing = new Set<string>();
    const current = imageByProductIdRef.current;
    for (const o of filtered) {
      for (const i of o.items ?? []) {
        const already = i.product?.imageUrl || current[i.productId] || known[i.productId];
        if (!already) missing.add(i.productId);
      }
    }
    if (!missing.size) return;

    let alive = true;
    (async () => {
      const ids = Array.from(missing);
      const products = await Promise.all(
        ids.map(async (id) => {
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
  }, [filtered]);

  if (isLoading) {
    return (
      <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
          <div className={styles.loading}>
            <div className={styles.loaderRow}>
              <Loader2 className={styles.spinner} />
              <span className={styles.subtitle}>Завантаження замовлень...</span>
            </div>
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
          <div className={styles.error}>
            <div className={styles.stateCenter}>
              <AlertCircle className={styles.stateIcon} />
              <h2 className={styles.title}>Помилка завантаження</h2>
              <p className={styles.subtitle}>
                Не вдалося завантажити список замовлень.
              </p>
            </div>
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
          <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Мої замовлення" }]} />
        </div>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>Мої замовлення</h1>
          <p className={styles.subtitle}>Переглядайте історію ваших замовлень</p>
        </div>

        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder="Пошук за ID, адресою або магазином..."
          />
        </div>

        {!filtered || filtered.length === 0 ? (
          <div className={styles.emptyCard}>
            <Calendar className={styles.emptyIcon} />
            <h2 className={styles.title}>
              Замовлень не знайдено
            </h2>
            <p className={styles.subtitle}>
              {searchQuery
                ? "Спробуйте змінити пошуковий запит"
                : "У вас поки немає замовлень"}
            </p>
          </div>
        ) : (
          <div className={styles.orders}>
            {filtered.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <Link href={`/orders/${order.id}`}>
                  <div className={styles.orderHeader}>
                    <h3 className={styles.orderTitle}>Замовлення #{order.id}</h3>
                    <span className={styles.orderPrice}>{order.totalPrice} ₴</span>
                  </div>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaRow}>
                      <MapPin className={styles.metaIcon} />
                      <span>{order.shop.name}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <Calendar className={styles.metaIcon} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <p className={styles.subtitle}>Доставка: {order.deliveryAddr}</p>

                  {order.items?.some(
                    (i) => i.product?.imageUrl || imageByProductId[i.productId]
                  ) ? (
                    <div className={styles.orderItemsPreview} aria-label="Товари у замовленні">
                      {order.items
                        .filter((i) => !!(i.product?.imageUrl || imageByProductId[i.productId]))
                        .slice(0, 4)
                        .map((i) => (
                          <div key={i.id ?? i.productId} className={styles.previewThumb}>
                            <Image
                              src={i.product?.imageUrl || imageByProductId[i.productId]}
                              alt={i.name}
                              fill
                              sizes="40px"
                              className={styles.previewImage}
                            />
                          </div>
                        ))}
                      <span className={styles.previewCount}>
                        {order.items.length} товар(ів)
                      </span>
                    </div>
                  ) : null}
                </Link>

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
                    router.push("/cart");
                  }}
                >
                  Повторити замовлення
                </button>
              </div>
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={styles.pageButton}
            >
              Попередня
            </button>

            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`${styles.pageButton} ${
                  p === page ? styles.pageButtonActive : ""
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.totalPages}
              className={styles.pageButton}
            >
              Наступна
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
