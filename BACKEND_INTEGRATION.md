# Документація інтеграції з бекендом

Цей документ описує, **як фронтенд звертається до бекенду**, які ендпоїнти використовує, які параметри передає, і як побудовані основні флоу: **магазини → товари → кошик → замовлення → історія/деталі → повторне замовлення**.

## Базові налаштування

- **ENV змінна**: `NEXT_PUBLIC_BACKEND_URL` (fallback: `NEXT_PUBLIC_BACKEND_UR`)
- **Файл**: `src/lib/env.ts`
- **Base URL** для API:
  - `BACKEND_BASE_URL` = `NEXT_PUBLIC_BACKEND_URL` без `/` в кінці
  - `API_BASE_URL` = `${BACKEND_BASE_URL}/api/v1`
- **Клієнт**: `src/lib/api.ts`
- **Важливо**: усі `fetch` виконуються з `credentials: "include"` (cookie-based auth/сесії).

## Загальні правила виклику API

### Формат запитів

- **JSON** для всіх ендпоїнтів (тіло запиту — `application/json`)
- Бекенд помилки обробляються через `response.ok` у `ApiClient.request()`

### CORS

Для продакшену (Vercel) бекенд має дозволяти origin вашого домену, інакше браузер блокує запити (CORS preflight).

## Ендпоїнти, які використовує фронтенд

Нижче наведені **реальні** виклики з `src/lib/api.ts` та відповідних хуків.

### Shops (магазини)

#### Отримати список магазинів

- **HTTP**: `GET /shops`
- **Опційні query**: `minRating`, `maxRating`
- **Фронтенд**:
  - Клієнт: `apiClient.getShops(params?)`
  - Хук: `src/hooks/useShops.ts`
  - Сторінка: `src/components/pages/ShopsListView.tsx`

#### Отримати магазин за ID

- **HTTP**: `GET /shops/:id`
- **Фронтенд**:
  - Клієнт: `apiClient.getShop(id)`
  - Сторінка: `src/components/pages/ShopDetailsView.tsx` (деталі точки/магазину)

### Products (товари)

#### Отримати товари (каталог) з пагінацією/фільтрами/сортуванням

- **HTTP**: `GET /products`
- **Query** (використовуються фронтом):
  - `page`, `limit`
  - `category` (одна категорія)
  - `categories[]` (мультивибір)
  - `search`
  - `isActive`, `isHit`, `isNew`, `hasDiscount`
  - `sortBy` (`price | createdAt | name`)
  - `sortOrder` (`asc | desc`)
- **Фронтенд**:
  - Клієнт: `apiClient.getProducts(filters)`
  - Хук: `src/hooks/useProducts.ts`
  - Сторінка: `src/components/pages/ShopCatalogView.tsx`

#### Отримати один товар

- **HTTP**: `GET /products/:id`
- **Фронтенд**:
  - Клієнт: `apiClient.getProduct(id)`
  - Використання:
    - точкові отримання даних
    - (fallback) підвантаження `imageUrl` для позицій замовлення, якщо бекенд не повернув `items[].product`

#### Отримати список категорій

- **HTTP**: `GET /products/categories`
- **Фронтенд**:
  - Клієнт: `apiClient.getProductCategories()`
  - Хук: `src/hooks/useProductCategories.ts`
  - Використання:
    - `ProductFilters`
    - Головна сторінка (`src/app/page.tsx`) для правильних лінків на `/shop?category=...`

### Cart (кошик) — поточна реалізація у фронті

У цій версії застосунку кошик **локальний** (Zustand + persist), без створення бекенд-корзини.

- **Store**: `src/stores/cartStore.ts`
- **Зберігається**: `cart-storage` у `localStorage`
- **Операції**:
  - `addItem({ productId, name, price, imageUrl })`
  - `updateQuantity(productId, qty)`
  - `removeItem(productId)`
  - `clearCart()`
  - `getTotalItems()`, `getTotalPrice()`

> Якщо ви переходите на бекенд-кошик (`POST /cart`, `POST /cart/:id/items`, `POST /cart/:id/checkout`), тоді треба додати відповідні методи в `src/lib/api.ts` і замінити локальні операції на серверні.

### Orders (замовлення)

#### Створити замовлення

- **HTTP**: `POST /orders`
- **Фронтенд**:
  - Виклик: `apiClient.createOrder(orderData)`
  - Хук: `src/hooks/useOrders.ts` → `useCreateOrder()`
  - Сторінка: `src/components/pages/CartView.tsx`
- **Body, який формує фронт** (див. `CartView.tsx`):

```json
{
  "shopId": "uuid",
  "customerEmail": "user@example.com",
  "customerPhone": "+380501112233",
  "deliveryAddr": "вул. ...",
  "deliveryAt": "2026-04-02T09:36:00",
  "userTimezone": "Europe/Kyiv",
  "items": [
    { "productId": "uuid", "name": "Назва", "qty": 2, "price": 170 }
  ],
  "totalPrice": 340
}
```

#### Отримати список замовлень

- **HTTP**: `GET /orders?page=1&limit=10`
- **Фронтенд**:
  - Клієнт: `apiClient.getOrders(page, limit)`
  - Хук: `useOrders(page, limit)`
  - Сторінка: `src/components/pages/OrdersListView.tsx`

#### Отримати замовлення за ID

- **HTTP**: `GET /orders/:id`
- **Фронтенд**:
  - Клієнт: `apiClient.getOrder(id)`
  - Хук: `useOrder(id)`
  - Сторінка: `src/components/pages/OrderDetailsView.tsx`

#### Історія замовлень (пошук)

Фронт наразі має сторінку “Мої замовлення” зі **внутрішнім пошуком по вже завантажених** `GET /orders`.

Якщо у вас є бекенд-ендпоїнт:

- **HTTP**: `GET /orders/history?customerEmail=...&customerPhone=...&orderId=...`

то його можна підключити окремим хуком і робити пошук сервером.

## Як фронт показує картинки в замовленнях

### Основний сценарій (оптимальний)

Бекенд повертає в `order.items[]` вкладений `product`, зокрема `product.imageUrl`.

- **Джерело**: `order.items[i].product.imageUrl`
- Використання:
  - превʼю в `OrdersListView`
  - картинки в `OrderDetails`
  - “Повторити замовлення” додає в кошик `imageUrl`

### Fallback сценарій (сумісність зі старими відповідями)

Якщо в `items[]` немає `product`, фронт:

- збирає `productId` без `imageUrl`
- робить `GET /products/:id` **лише для відсутніх**
- мапить `productId → imageUrl` локально

Це реалізовано в:

- `src/components/pages/OrdersListView.tsx`
- `src/components/pages/OrderDetailsView.tsx`

## Повторне замовлення (Reorder)

- **Де**: `OrdersListView` і `OrderDetailsView`
- **Що робить**:
  - бере позиції `order.items`
  - додає в локальний кошик через `cartStore.addOrderItems(...)`
  - зберігає кількості (qty) і додає картинки (`imageUrl`)

## Купони

### Список активних купонів

- **HTTP**: `GET /coupons/active`
- **Фронт**: `src/components/pages/CouponsView.tsx` через `getActiveCoupons()`

### Валідація купона

- **HTTP**: `GET /coupons/validate?code=...&total=...` (+ опційно `cartId`)
- **Фронт**:
  - Функція: `validateCoupon(code, total, cartId?)` у `src/lib/api.ts`
  - Хук: `src/hooks/useCoupons.ts`
  - Сторінка: `src/components/pages/CartView.tsx`

> Якщо бекенд валідатор підтримує `cartId`, то фронт має передавати `cartId` **лише якщо** реально використовується бекенд-кошик.
> У поточній реалізації кошик локальний, тому фронт робить клієнтську перевірку застосовності (`appliesToCategory` / `appliesToProductId`) на основі товарів у кошику.

## Де подивитись код інтеграції

- **API клієнт**: `src/lib/api.ts`
- **ENV бекенду**: `src/lib/env.ts`
- **Хуки**:
  - `src/hooks/useShops.ts`
  - `src/hooks/useProducts.ts`
  - `src/hooks/useProductCategories.ts`
  - `src/hooks/useOrders.ts`
  - `src/hooks/useCoupons.ts`
- **Сторінки**:
  - `src/components/pages/ShopsListView.tsx`
  - `src/components/pages/ShopCatalogView.tsx`
  - `src/components/pages/CartView.tsx`
  - `src/components/pages/OrdersListView.tsx`
  - `src/components/pages/OrderDetailsView.tsx`
  - `src/components/pages/CouponsView.tsx`

