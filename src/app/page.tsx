import Link from "next/link";
import { Header } from "@/components/Header";
import {
  BadgeCheck,
  Clock3,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.root}>
      <Header />

      <main className={`${styles.main} ${styles.container}`}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroBadge}>Delivery app</span>
            <h1 className={styles.heroTitle}>
              Їжа з доставкою швидко, зручно і без зайвих кроків
            </h1>
            <p className={styles.heroText}>
              Обирай страви, додавай у кошик і оформлюй доставку в кілька
              кліків. Інтерфейс уже стилізований під сучасний food delivery.
            </p>
            <Link href="/shop" className={styles.heroButton}>
              <UtensilsCrossed className={styles.heroButtonIcon} />
              Перейти до меню
            </Link>
          </div>
        </section>

        <section className={styles.benefits}>
          {[
            {
              icon: Truck,
              title: "Швидка доставка",
              text: "Оформлюй замовлення та отримуй їжу без затримок.",
            },
            {
              icon: UtensilsCrossed,
              title: "Смачні позиції",
              text: "Меню виглядає як справжній delivery marketplace.",
            },
            {
              icon: BadgeCheck,
              title: "Зручний checkout",
              text: "Валідована форма, кошик і історія замовлень під рукою.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={styles.benefitCard}>
                <Icon className={styles.benefitIcon} />
                <h3 className={styles.benefitTitle}>{item.title}</h3>
                <p className={styles.benefitText}>{item.text}</p>
              </article>
            );
          })}
        </section>

        <section className={styles.categoriesCard}>
          <div className={styles.categoriesHeader}>
            <div>
              <h2 className={styles.categoriesTitle}>Популярні страви</h2>
              <p className={styles.categoriesText}>
                Категорії для швидкого замовлення
              </p>
            </div>
            <div className={styles.timeText}>
              <Clock3 className={styles.timeIcon} />
              25-35 хвилин
            </div>
          </div>
          <div className={styles.categoryGrid}>
            {["Burgers", "Pizza", "Drinks", "Desserts", "Salads"].map(
              (category) => (
                <Link
                  key={category}
                  href={`/shop?category=${encodeURIComponent(category)}`}
                  className={styles.categoryCard}
                >
                  <UtensilsCrossed className={styles.categoryIcon} />
                  <span className={styles.categoryName}>{category}</span>
                </Link>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
