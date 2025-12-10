import { apiFetch } from "../lib/api";

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    stock?: number;
    tags?: string[];
}

export interface CartItemPayload {
    productId: string;
    quantity: number;
}

export interface CartItemResponse extends CartItemPayload {
    name?: string;
    price?: number;
}

export interface CartResponse {
    items: CartItemResponse[];
}

export interface OrderItem {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderRequest {
    items: OrderItem[];
    notes?: string;
    contactEmail?: string;
    shippingAddress?: string;
}

export interface OrderSummary {
    id: string;
    createdAt?: string;
    total: number;
    status?: string;
    items?: OrderItem[];
}

const authHeaders = (token: string | null): Record<string, string> =>
    token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};

export function fetchProducts() {
    return apiFetch<Product[]>("/api/v1/catalog/products");
}

export function fetchProductById(id: string) {
    return apiFetch<Product>(`/api/v1/catalog/products/${id}`);
}

export function fetchCart(token: string | null) {
    return apiFetch<CartResponse>("/api/v1/cart", {
        headers: authHeaders(token),
    });
}

export function addCartItem(token: string | null, payload: CartItemPayload) {
    return apiFetch<CartResponse>("/api/v1/cart/items", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
}

export function updateCartItem(token: string | null, payload: CartItemPayload) {
    return apiFetch<CartResponse>(`/api/v1/cart/items/${payload.productId}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
}

export function removeCartItem(token: string | null, productId: string) {
    return apiFetch<CartResponse>(`/api/v1/cart/items/${productId}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });
}

export function submitOrder(token: string | null, payload: OrderRequest) {
    return apiFetch<{ id: string }>("/api/v1/orders", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
    });
}

export function fetchOrders(token: string | null) {
    return apiFetch<OrderSummary[]>("/api/v1/orders", {
        headers: authHeaders(token),
    });
}
