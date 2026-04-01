"use client";

import Image from "next/image";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useActiveCoupons } from "@/hooks/useCoupons";
import styles from "./CouponsView.module.css";

export function CouponsView() {
  const { data, isLoading, error } = useActiveCoupons();

  return (
    <div className={styles.root}>
      <Header />
      <div className={`${styles.container} ${styles.page}`}>
        <div className={styles.breadcrumb}>
          <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Купони" }]} />
        </div>
        <div className={styles.heroCard}>
          <h1 className={styles.title}>Активні купони</h1>
          <p className={styles.subtitle}>
            Знижки для швидкого checkout у delivery app.
          </p>
        </div>

        {isLoading && <div className={styles.stateCard}>Завантаження…</div>}
        {error && <div className={styles.stateCard}>Помилка завантаження купонів</div>}
        {!isLoading && !error && (!data || data.length === 0) && (
          <div className={styles.stateCard}>Наразі активних купонів немає.</div>
        )}

        <div className={styles.grid}>
          {data?.map((c) => (
            <div key={c.code} className={styles.couponCard}>
              {c.imageUrl && (
                <div className={styles.imageWrap}>
                  <Image src={c.imageUrl} alt={c.code} fill className={styles.image} />
                </div>
              )}
              <div className={styles.body}>
                <div className={styles.code}>
                  {c.description || "Купон"} ({c.code})
                </div>
                <div className={styles.description}>
                  {c.discountPercent
                    ? `Знижка ${c.discountPercent}%`
                    : c.discountAmount
                    ? `Знижка -${c.discountAmount} ₴`
                    : ""}
                </div>
                <button
                  type="button"
                  className={styles.button}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(c.code);
                    } catch {}
                  }}
                >
                  Скопіювати код
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
