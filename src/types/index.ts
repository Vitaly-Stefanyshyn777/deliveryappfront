// Типи для квітів
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceOriginal?: number | null;
  discountPercent?: number; // надходить з бекенду, обчислено на льоту
  category: string;
  imageUrl: string;
  isActive: boolean;
  isHit: boolean;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

// Типи для магазинів
export interface Shop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

// Типи для позицій замовлення
export interface OrderItem {
  id?: string;
  productId: string;
  name: string;
  qty: number;
  price: number;
}

// Типи для замовлень
export interface Order {
  id: string;
  shopId: string;
  totalPrice: number;
  deliveryAddr: string;
  deliveryAtUTC: string;
  createdAt: string;
  updatedAt: string;
  shop: Shop;
  items: OrderItem[];
}

// Типи для створення замовлення
export interface CreateOrderRequest {
  shopId: string;
  deliveryAddr: string;
  deliveryAt: string;
  userTimezone: string;
  items: OrderItem[];
  totalPrice: number;
}

// Типи для пагінації
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Типи для кошика
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
}

// Типи для фільтрів продуктів
export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  categories?: string[];
  search?: string;
  isActive?: boolean;
  isHit?: boolean;
  isNew?: boolean;
  hasDiscount?: boolean;
  // Для бекенду
  sortBy?: "price" | "createdAt" | "name";
  sortOrder?: "asc" | "desc";
}

// Типи для сортування
export type SortOption =
  | "none"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc"
  | "discount-desc"
  | "favorites-first";

// Типи для форми замовлення
export interface OrderFormData {
  email: string;
  phone: string;
  deliveryAddr: string;
  deliveryAt: string;
}

// Купони
export interface Coupon {
  id?: string;
  code: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  startsAt?: string; // ISO
  endsAt?: string; // ISO
  isActive: boolean;
  imageUrl?: string;
  appliesToProductId?: string | null;
  appliesToCategory?: string | null;
}
