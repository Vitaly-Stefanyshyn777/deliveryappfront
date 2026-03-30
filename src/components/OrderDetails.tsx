"use client";

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { MapPin, Calendar, Package, CreditCard } from "lucide-react";
import { Order } from "@/types";

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm", { locale: uk });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-pink-500 text-white p-6">
        <h1 className="text-2xl font-bold">Замовлення #{order.id}</h1>
        <p className="text-pink-100 mt-1">
          Створено {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Package className="h-5 w-5 mr-2 text-pink-500" />
            Магазин
          </h2>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{order.shop.name}</p>
            <p className="text-gray-600 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {order.shop.address}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-pink-500" />
            Доставка
          </h2>
          <div className="space-y-2">
            <p className="text-gray-600 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {order.deliveryAddr}
            </p>
            <p className="text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(order.deliveryAtUTC)}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-pink-500" />
            Товари
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Кількість: {item.qty} шт.
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {item.price * item.qty} ₴
                  </p>
                  <p className="text-sm text-gray-600">{item.price} ₴ за шт.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-pink-500" />
            Підсумок
          </h2>
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Всього:</span>
            <span className="text-2xl font-bold text-pink-600">
              {order.totalPrice} ₴
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
