"use client";

import { useParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { OrderDetails } from "@/components/OrderDetails";
import { useOrder } from "@/hooks/useOrders";
import styles from "./OrderDetailsView.module.css";

export function OrderDetailsView() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);

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
        <OrderDetails order={order} />
      </div>
    </div>
  );
}
