"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { OrderDetails } from "@/components/OrderDetails";
import { useOrder } from "@/hooks/useOrders";
import { Loader2, AlertCircle } from "lucide-react";

export function OrderDetailsView() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-600">
              Завантаження замовлення...
            </span>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Помилка завантаження
            </h2>
            <p className="text-gray-600">
              Не вдалося завантажити деталі замовлення.
            </p>
          </div>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Замовлення не знайдено
            </h2>
            <p className="text-gray-600">Замовлення з таким ID не існує.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrderDetails order={order} />
      </div>
    </div>
  );
}
