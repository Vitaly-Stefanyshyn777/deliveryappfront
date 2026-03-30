"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import { useCartStore } from "@/stores/cartStore";

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
    <div className="flex items-center py-4">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover rounded-md"
        />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-gray-500">{item.price} ₴ за одиницю</p>
      </div>

      <div className="flex items-center space-x-2 ml-4">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => handleQuantityChange(item.qty - 1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md"
            aria-label="Зменшити кількість"
          >
            <Minus className="h-4 w-4 text-gray-500" />
          </button>

          <span className="w-8 text-center font-medium">{item.qty}</span>

          <button
            onClick={() => handleQuantityChange(item.qty + 1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md"
            aria-label="Збільшити кількість"
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <button
          onClick={handleRemoveItem}
          className="p-2 text-red-500 hover:bg-red-50 rounded-md"
          aria-label="Видалити товар"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="ml-4 text-right">
        <span className="font-medium text-gray-900">
          {item.price * item.qty} ₴
        </span>
      </div>
    </div>
  );
}
