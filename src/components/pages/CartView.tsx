"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { CartItem } from "@/components/CartItem";
import { OrderForm } from "@/components/OrderForm";
import { useCartStore } from "@/stores/cartStore";
import { useValidateCoupon } from "@/hooks/useCoupons";
import { apiClient } from "@/lib/api";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Coupon, OrderFormData } from "@/types";

export function CartView() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const validateCoupon = useValidateCoupon();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState<Coupon | null>(null);

  const handleSubmitOrder = async (formData: OrderFormData) => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const shopId = "761ed028-1003-43cd-aa26-26370908ab1d";
      const cart = await apiClient.createCart({
        shopId,
        customerEmail: formData.email,
        customerPhone: formData.phone,
      });

      for (const item of items) {
        await apiClient.addCartItem(cart.id, {
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          price: item.price,
        });
      }

      const order = await apiClient.checkoutCart(cart.id, {
        deliveryAddr: formData.deliveryAddr,
        deliveryAt: formData.deliveryAt,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ваш кошик порожній
            </h1>
            <p className="text-gray-600 mb-8">
              Додайте квіти до кошика, щоб зробити замовлення
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Перейти до магазину
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Кошик ({getTotalItems()} товарів)
          </h1>
          <p className="text-gray-600">
            Перевірте ваші товари та оформіть замовлення
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Товари в кошику
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Очистити кошик
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Оформлення замовлення
              </h2>
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-800">Товарів:</span>
                  <span className="font-semibold text-gray-900">
                    {getTotalItems()}
                  </span>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Код купона
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Напр., WELCOME10"
                      className="flex-1 px-3 py-2 border rounded-lg text-gray-900"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border rounded-lg text-gray-900 hover:bg-gray-50"
                      onClick={async () => {
                        try {
                          const data = await validateCoupon.mutateAsync({
                            code: couponCode,
                            total: getTotalPrice(),
                          });
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
                    <p className="mt-2 text-sm text-green-700">
                      Застосовано купон {couponInfo.code}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center text-lg font-semibold mt-3">
                  <span className="text-gray-900">До сплати:</span>
                  <span className="text-pink-600">
                    {(() => {
                      const total = getTotalPrice();
                      if (!couponInfo) return total;
                      if (couponInfo.discountPercent)
                        return Math.max(
                          0,
                          Math.round(
                            total * (1 - couponInfo.discountPercent / 100)
                          )
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
