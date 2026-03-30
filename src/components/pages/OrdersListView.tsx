"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { AlertCircle, Calendar, Loader2, MapPin, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { useOrders } from "@/hooks/useOrders";
import styles from "./OrdersListView.module.css";

export function OrdersListView() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useOrders(page, 10);

  const formatDate = (d: string) =>
    format(new Date(d), "dd MMM yyyy, HH:mm", { locale: uk });

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

  const filtered = data?.items.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.deliveryAddr.toLowerCase().includes(q) ||
      o.shop.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
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
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={styles.orderCard}
              >
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
              </Link>
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
