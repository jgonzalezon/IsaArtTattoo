import { apiFetch } from "../lib/api";

export interface Category {
    id: number;
    name: string;
    description?: string | null;
    displayOrder: number;
    productsCount: number;
}

export interface ProductImage {
    id: number;
    url: string;
    altText?: string | null;
    displayOrder: number;
}

export interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    stock?: number;
    tags?: string[];
    categoryName?: string | null;
    images?: ProductImage[];
}

type ApiProductListItem = {
    id: number;
    name: string;
    shortDescription?: string | null;
    price: number;
    mainImageUrl?: string | null;
    categoryName?: string | null;
};

type ApiProductDetail = {
    id: number;
    name: string;
    shortDescription?: string | null;
    price: number;
    stock: number;
    isActive: boolean;
    categoryName?: string | null;
    images?: ProductImage[];
};

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

export function fetchCategories() {
    return apiFetch<Category[]>("/api/catalog/categories");
}

function mapListItem(apiProduct: ApiProductListItem): Product {
    return {
        id: apiProduct.id.toString(),
        name: apiProduct.name,
        description: apiProduct.shortDescription ?? undefined,
        price: Number(apiProduct.price),
        imageUrl: apiProduct.mainImageUrl ?? undefined,
        categoryName: apiProduct.categoryName ?? undefined,
        tags: apiProduct.categoryName ? [apiProduct.categoryName] : undefined,
    };
}

function mapProductDetail(apiProduct: ApiProductDetail): Product {
    return {
        id: apiProduct.id.toString(),
        name: apiProduct.name,
        description: apiProduct.shortDescription ?? undefined,
        price: Number(apiProduct.price),
        stock: apiProduct.stock,
        imageUrl: apiProduct.images?.[0]?.url ?? undefined,
        categoryName: apiProduct.categoryName ?? undefined,
        images: apiProduct.images,
        tags: apiProduct.categoryName ? [apiProduct.categoryName] : undefined,
    };
}

export function fetchProducts() {
    return apiFetch<ApiProductListItem[]>("/api/catalog/products").then(
        (items) => items.map(mapListItem)
    );
}

export function fetchProductById(id: string) {
    return apiFetch<ApiProductDetail>(`/api/catalog/products/${id}`).then(
        (product) => mapProductDetail(product)
    );
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
