import {
  Product,
  Shop,
  Order,
  CreateOrderRequest,
  PaginatedResponse,
  ProductFilters,
  Coupon,
} from "@/types";

const API_BASE_URL =
  "https://flowerdeliverybackend-production.up.railway.app/api/v1";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Продукти
  async getProducts(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.category) params.append("category", filters.category);
    // Якщо передано кілька категорій — додаємо повторювані параметри category=...
    if (filters.categories && filters.categories.length) {
      filters.categories.forEach((c) => params.append("categories[]", c));
    }
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    if (filters.isHit !== undefined)
      params.append("isHit", String(filters.isHit));
    if (filters.isNew !== undefined)
      params.append("isNew", String(filters.isNew));
    if (filters.hasDiscount !== undefined)
      params.append("hasDiscount", String(filters.hasDiscount));
    if (filters.search) params.append("search", filters.search);
    if (filters.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    return this.request<PaginatedResponse<Product>>(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async getProductCategories(): Promise<string[]> {
    return this.request<string[]>("/products/categories");
  }

  async getShop(id: string): Promise<Shop> {
    return this.request<Shop>(`/shops/${id}`);
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async getOrders(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.request<PaginatedResponse<Order>>(
      `/orders?${params.toString()}`
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export async function getActiveCoupons(): Promise<Coupon[]> {
  return apiClient["request"]<Coupon[]>("/coupons/active");
}

export async function validateCoupon(
  code: string,
  total: number
): Promise<Coupon> {
  const params = new URLSearchParams({ code, total: String(total) });
  return apiClient["request"]<Coupon>(`/coupons/validate?${params.toString()}`);
}
