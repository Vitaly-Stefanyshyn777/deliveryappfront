"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar, Loader2, AlertCircle, Search, MapPin, RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { useOrders } from "@/hooks/useOrders";
import { apiClient } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { Order, OrderHistoryQuery } from "@/types";

export function OrdersListView() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyResults, setHistoryResults] = useState<Order[] | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [reorderLoadingId, setReorderLoadingId] = useState<string | null>(null);
  const { data, isLoading, error } = useOrders(page, 10);

  const formatDate = (d: string) =>
    format(new Date(d), "dd MMM yyyy, HH:mm", { locale: uk });

  const handleHistorySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = historyQuery.trim();
    if (!q) {
      setHistoryResults(null);
      setHistoryError(null);
      return;
    }

    const query: OrderHistoryQuery = q.includes("@")
      ? { customerEmail: q }
      : /^[+\d\s()-]{6,}$/.test(q)
      ? { customerPhone: q }
      : { orderId: q };

    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const results = await apiClient.getOrderHistory(query);
      setHistoryResults(results);
    } catch {
      setHistoryResults(null);
      setHistoryError("Не вдалося знайти історію замовлень.");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    setReorderLoadingId(order.id);
    try {
      await apiClient.reorderCart(order.id);

      const enrichedItems = await Promise.all(
        order.items.map(async (item) => {
          const product = await apiClient.getProduct(item.productId);
          return {
            ...item,
            imageUrl: product.imageUrl,
          };
        })
      );

      enrichedItems.forEach((item) => {
        addItem(
          {
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
          },
          item.qty
        );
      });

      router.push("/cart");
    } catch {
      setHistoryError("Не вдалося повторити замовлення.");
    } finally {
      setReorderLoadingId(null);
    }
  };

  const displayedOrders = historyResults ?? data?.items ?? [];
  const isHistoryMode = historyResults !== null;
  const visibleOrders = displayedOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.deliveryAddr.toLowerCase().includes(q) ||
      order.shop.name.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-600">
              Завантаження замовлень...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Помилка завантаження
            </h2>
            <p className="text-gray-600">
              Не вдалося завантажити список замовлень.
            </p>
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
            Мої замовлення
          </h1>
          <p className="text-gray-600">Переглядайте історію ваших замовлень</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Пошук за ID, адресою або магазином..."
            />
          </div>
        </div>

        <form
          onSubmit={handleHistorySearch}
          className="mb-8 grid gap-3 md:grid-cols-[1fr_auto_auto]"
        >
          <input
            type="text"
            value={historyQuery}
            onChange={(e) => setHistoryQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Пошук історії: email, телефон або order ID"
          />
          <button
            type="submit"
            disabled={isHistoryLoading}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
          >
            {isHistoryLoading ? "Пошук..." : "Знайти історію"}
          </button>
          <button
            type="button"
            onClick={() => {
              setHistoryQuery("");
              setHistoryResults(null);
              setHistoryError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Скинути
          </button>
        </form>

        {historyError && (
          <div className="mb-6 text-sm text-red-600">{historyError}</div>
        )}

        {!visibleOrders || visibleOrders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Замовлень не знайдено
            </h2>
            <p className="text-gray-600">
              {searchQuery
                ? "Спробуйте змінити пошуковий запит"
                : isHistoryMode
                ? "Спробуйте інший email, телефон або ID"
                : "У вас поки немає замовлень"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-pink-600"
                      >
                        Замовлення #{order.id}
                      </Link>
                      <span className="text-xl font-bold text-pink-600">
                        {order.totalPrice} ₴
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{order.shop.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Доставка: {order.deliveryAddr}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 lg:items-end">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      disabled={reorderLoadingId === order.id}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50"
                    >
                      {reorderLoadingId === order.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Повторюємо...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4" />
                          Reorder
                        </>
                      )}
                    </button>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm text-gray-600 hover:text-pink-600"
                    >
                      Переглянути деталі
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isHistoryMode && data && data.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Попередня
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    p === page
                      ? "bg-pink-500 text-white"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.totalPages}
              className="px-3 py-2 text-sm font-medium rounded-md text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Наступна
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
