"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CartItem } from "@/components/CartItem";
import { OrderForm } from "@/components/OrderForm";
import { useCartStore } from "@/stores/cartStore";
import { useShopStore } from "@/stores/shopStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { useValidateCoupon } from "@/hooks/useCoupons";
import { Coupon, OrderFormData } from "@/types";
import { apiClient } from "@/lib/api";
import styles from "./CartView.module.css";

export function CartView() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const { selectedShopId } = useShopStore();
  const createOrderMutation = useCreateOrder();
  const validateCoupon = useValidateCoupon();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState<Coupon | null>(null);
  const [productCategoryById, setProductCategoryById] = useState<Record<string, string>>({});

  const handleSubmitOrder = async (formData: OrderFormData) => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const shopId = selectedShopId;
      if (!shopId) {
        alert("Спочатку оберіть магазин.");
        router.push("/shops");
        return;
      }
      const orderData = {
        shopId,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deliveryAddr: formData.deliveryAddr,
        deliveryAt: formData.deliveryAt,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        totalPrice: getTotalPrice(),
      };
      const order = await createOrderMutation.mutateAsync(orderData);
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch {
      alert("Помилка створення замовлення. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.root}>
        <Header />
        <div className={`${styles.container} ${styles.page}`}>
          <div className={styles.breadcrumb}>
            <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Кошик" }]} />
          </div>
          <div className={styles.emptyCard}>
            <ShoppingCart className={styles.emptyIcon} />
            <h1 className={styles.title}>Ваш кошик порожній</h1>
            <p className={styles.subtitle}>
              Додайте позиції в кошик, щоб оформити доставку
            </p>
            <button
              onClick={() => router.push("/shop")}
              className={styles.emptyButton}
            >
              Перейти до меню
            </button>
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
          <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Кошик" }]} />
        </div>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>Кошик ({getTotalItems()} товарів)</h1>
          <p className={styles.subtitle}>
            Перевірте позиції та оформіть доставку
          </p>
        </div>

        <div className={styles.layout}>
          <div>
            <div className={styles.itemsCard}>
              <div className={styles.itemsHeader}>
                <h2 className={styles.itemsTitle}>Товари в кошику</h2>
                <button onClick={clearCart} className={styles.clearCart}>
                  <Trash2 className={styles.clearIcon} /> Очистити кошик
                </button>
              </div>
              <div className={styles.divider}>
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Оформлення замовлення</h2>
              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Товарів:</span>
                  <span className={styles.summaryValue}>{getTotalItems()}</span>
                </div>
                <div>
                  <label className={styles.couponLabel}>Код купона</label>
                  <div className={styles.couponRow}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Напр., WELCOME10"
                      className={styles.couponInput}
                    />
                    <button
                      type="button"
                      className={styles.couponButton}
                      onClick={async () => {
                        try {
                          const trimmed = couponCode.trim();
                          if (!trimmed) return;

                          const data = await validateCoupon.mutateAsync({
                            code: trimmed,
                            total: getTotalPrice(),
                          });

                          if (data.appliesToProductId) {
                            const ok = items.some((i) => i.productId === data.appliesToProductId);
                            if (!ok) {
                              setCouponInfo(null);
                              alert("Цей купон застосовується лише до конкретного товару, якого немає в кошику.");
                              return;
                            }
                          }

                          if (data.appliesToCategory) {
                            const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
                            const missing = uniqueIds.filter((id) => !productCategoryById[id]);
                            if (missing.length) {
                              const products = await Promise.all(
                                missing.map(async (id) => {
                                  try {
                                    return await apiClient.getProduct(id);
                                  } catch {
                                    return null;
                                  }
                                })
                              );
                              const patch: Record<string, string> = {};
                              for (const p of products) {
                                if (p?.id && p.category) patch[p.id] = p.category;
                              }
                              if (Object.keys(patch).length) {
                                setProductCategoryById((prev) => ({ ...prev, ...patch }));
                              }

                              const merged = { ...productCategoryById, ...patch };
                              const ok = items.some((i) => merged[i.productId] === data.appliesToCategory);
                              if (!ok) {
                                setCouponInfo(null);
                                alert(`Купон застосовується лише до категорії "${data.appliesToCategory}". У кошику немає товарів цієї категорії.`);
                                return;
                              }
                            } else {
                              const ok = items.some((i) => productCategoryById[i.productId] === data.appliesToCategory);
                              if (!ok) {
                                setCouponInfo(null);
                                alert(`Купон застосовується лише до категорії "${data.appliesToCategory}". У кошику немає товарів цієї категорії.`);
                                return;
                              }
                            }
                          }

                          setCouponInfo(data);
                        } catch {
                          setCouponInfo(null);
                          alert("Купон недійсний або непридатний");
                        }
                      }}
                    >
                      Застосувати
                    </button>
                  </div>
                  {couponInfo && (
                    <p className={styles.successText}>
                      Застосовано купон {couponInfo.code}
                    </p>
                  )}
                </div>
                <div className={styles.totalRow}>
                  <span>До сплати:</span>
                  <span className={styles.totalValue}>
                    {(() => {
                      const total = getTotalPrice();
                      if (!couponInfo) return total;
                      if (couponInfo.discountPercent)
                        return Math.max(
                          0,
                          Math.round(total * (1 - couponInfo.discountPercent / 100))
                        );
                      if (couponInfo.discountAmount)
                        return Math.max(0, total - couponInfo.discountAmount);
                      return total;
                    })()}{" "}
                    ₴
                  </span>
                </div>
              </div>

              <OrderForm
                onSubmit={handleSubmitOrder}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
