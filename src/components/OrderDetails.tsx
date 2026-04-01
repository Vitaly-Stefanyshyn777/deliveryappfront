"use client";

import Image from "next/image";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { MapPin, Calendar, Package, CreditCard, User } from "lucide-react";
import { Order } from "@/types";
import styles from "./OrderDetails.module.css";

interface OrderDetailsProps {
  order: Order;
  imageByProductId?: Record<string, string>;
}

export function OrderDetails({ order, imageByProductId }: OrderDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm", { locale: uk });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Замовлення #{order.id}</h1>
        <p className={styles.subtitle}>
          Створено {formatDate(order.createdAt)}
        </p>
      </div>

      <div className={styles.body}>
        {(order.userId || order.customerEmail || order.customerPhone) && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <User className={styles.icon} />
              Клієнт
            </h2>
            <div className={styles.list}>
              {order.userId && (
                <p className={styles.itemMeta}>
                  ID користувача: <span className={styles.itemName}>{String(order.userId)}</span>
                </p>
              )}
              {order.customerEmail && (
                <p className={styles.itemMeta}>
                  Email: <span className={styles.itemName}>{order.customerEmail}</span>
                </p>
              )}
              {order.customerPhone && (
                <p className={styles.itemMeta}>
                  Телефон: <span className={styles.itemName}>{order.customerPhone}</span>
                </p>
              )}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Package className={styles.icon} />
            Магазин
          </h2>
          <div className={styles.list}>
            <p className={styles.itemName}>{order.shop.name}</p>
            <p className={styles.itemMeta}>
              <MapPin className={styles.miniIcon} />
              {order.shop.address}
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MapPin className={styles.icon} />
            Доставка
          </h2>
          <div className={styles.list}>
            <p className={styles.itemMeta}>
              <MapPin className={styles.miniIcon} />
              {order.deliveryAddr}
            </p>
            <p className={styles.itemMeta}>
              <Calendar className={styles.miniIcon} />
              {formatDate(order.deliveryAtUTC)}
            </p>
          </div>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>
            <Package className={styles.icon} />
            Товари
          </h2>
          <div className={styles.list}>
            {order.items.map((item) => (
              <div
                key={item.id}
                className={styles.item}
              >
                {item.product?.imageUrl || imageByProductId?.[item.productId] ? (
                  <div className={styles.itemImageWrap}>
                    <Image
                      src={item.product?.imageUrl || imageByProductId?.[item.productId] || ""}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className={styles.itemImage}
                    />
                  </div>
                ) : null}
                <div className={styles.itemContent}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemMeta}>
                    Кількість: {item.qty} шт.
                  </p>
                </div>
                <div className={styles.itemRight}>
                  <p className={styles.itemName}>
                    {item.price * item.qty} ₴
                  </p>
                  <p className={styles.itemMeta}>{item.price} ₴ за шт.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionAlt}>
          <h2 className={styles.sectionTitle}>
            <CreditCard className={styles.icon} />
            Підсумок
          </h2>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Всього:</span>
            <span className={styles.totalValue}>
              {order.totalPrice} ₴
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
