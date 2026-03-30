"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQty: number) => {
    updateQuantity(item.productId, newQty);
  };

  const handleRemoveItem = () => {
    removeItem(item.productId);
  };

  return (
    <div className={styles.item}>
      <div className={styles.imageWrap}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="80px"
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{item.name}</h3>
        <p className={styles.subtitle}>{item.price} ₴ за одиницю</p>
      </div>

      <div className={styles.actions}>
        <div className={styles.qtyBox}>
          <button
            onClick={() => handleQuantityChange(item.qty - 1)}
            className={styles.qtyButton}
            aria-label="Зменшити кількість"
          >
            <Minus className={styles.qtyIcon} />
          </button>

          <span className={styles.qtyValue}>{item.qty}</span>

          <button
            onClick={() => handleQuantityChange(item.qty + 1)}
            className={styles.qtyButton}
            aria-label="Збільшити кількість"
          >
            <Plus className={styles.qtyIcon} />
          </button>
        </div>

        <button
          onClick={handleRemoveItem}
          className={styles.removeButton}
          aria-label="Видалити товар"
        >
          <Trash2 className={styles.removeIcon} />
        </button>
      </div>

      <div className={styles.total}>
        <span>{item.price * item.qty} ₴</span>
      </div>
    </div>
  );
}
