import Link from "next/link";
import { Header } from "@/components/Header";
import { Flower, Truck, Heart, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Квіти для особливих моментів
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Замовляйте найкращі квіти з доставкою по всьому місту. Створюємо
            незабутні моменти для ваших близьких.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors text-lg"
          >
            <Flower className="mr-2 h-5 w-5" />
            Перейти до магазину
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Truck className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Швидка доставка</h3>
            <p className="text-gray-600">
              Доставляємо квіти протягом 2 годин по всьому місту
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Свіжі квіти</h3>
            <p className="text-gray-600">
              Тільки найсвіжіші квіти від перевірених постачальників
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <Star className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Висока якість</h3>
            <p className="text-gray-600">
              Професійні флористи створюють унікальні композиції
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Популярні категорії
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Рози", "Тюльпани", "Лілії", "Хризантеми", "Букети"].map(
              (category) => (
                <Link
                  key={category}
                  href={`/shop?category=${encodeURIComponent(category)}`}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <Flower className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">{category}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
