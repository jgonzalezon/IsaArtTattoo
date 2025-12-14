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
    productId: string | number;
    quantity: number;
}

export interface CartItemResponse {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
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

// ? Actualizar para que coincida con el backend
export interface OrderSummary {
    id: number;
    orderNumber: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    subtotalAmount: number;  // ? NEW
    taxAmount: number;       // ? NEW
    totalAmount: number;
}

export interface OrderDetail extends OrderSummary {
    userId: string;
    currency: string;
    updatedAt?: string;
    paidAt?: string;
    cancelledAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    items: Array<{
        productId: number;
        productName: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
    }>;
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

export function fetchCategories() {
    return apiFetch<Category[]>("/api/catalog/categories");
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

// ? Nueva función para validar que la cantidad no exceda el stock
export function canAddToCart(product: Product, desiredQuantity: number): { can: boolean; reason?: string } {
    if (!product.stock && product.stock !== 0) {
        return { can: true }; // Si no hay información de stock, permitir
    }
    
    if (product.stock === 0) {
        return { can: false, reason: "Producto agotado" };
    }
    
    if (desiredQuantity > product.stock) {
        return { can: false, reason: `Solo hay ${product.stock} disponibles` };
    }
    
    return { can: true };
}

export function fetchCart() {
    // apiFetch incluye automáticamente el token si existe
    return apiFetch<CartResponse>("/api/v1/cart");
}

export function addCartItem(payload: CartItemPayload) {
    return apiFetch<CartResponse>("/api/v1/cart/items", {
        method: "POST",
        body: JSON.stringify({
            productId: typeof payload.productId === "string" ? parseInt(payload.productId, 10) : payload.productId,
            quantity: payload.quantity,
        }),
    });
}

export function updateCartItem(payload: CartItemPayload) {
    const productId = typeof payload.productId === "string" ? parseInt(payload.productId, 10) : payload.productId;
    return apiFetch<CartResponse>(`/api/v1/cart/items/${productId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity: payload.quantity }),
    });
}

export function removeCartItem(productId: string | number) {
    const id = typeof productId === "string" ? parseInt(productId, 10) : productId;
    return apiFetch<CartResponse>(`/api/v1/cart/items/${id}`, {
        method: "DELETE",
    });
}

export function submitOrder(payload: OrderRequest) {
    return apiFetch<{ id: string }>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ? Obtener lista de órdenes del usuario
export function fetchOrders() {
    return apiFetch<OrderSummary[]>("/api/v1/orders").then(
        (orders) => orders.map((order) => mapOrderDetail(order))
    );
}

// ? Obtener detalle de una orden
export function fetchOrderById(id: number) {
    return apiFetch<OrderDetail>(`/api/v1/orders/${id}`).then(
        (order) => mapOrderDetail(order)
    );
}

// ? Cancelar una orden
export function cancelOrder(id: number) {
    return apiFetch<OrderDetail>(`/api/v1/orders/${id}/cancel`, {
        method: "POST",
    }).then((order) => mapOrderDetail(order));
}

// ? Marcar como pagada
export function markOrderAsPaid(id: number) {
    return apiFetch<OrderDetail>(`/api/v1/orders/${id}/pay`, {
        method: "POST",
    }).then((order) => mapOrderDetail(order));
}

// ? Función para mapear enum del backend a strings legibles
function mapOrderDetail(order: OrderSummary | OrderDetail): OrderDetail {
    // Mapear PaymentStatus enum a string
    const paymentStatusMap: Record<number | string, string> = {
        0: "Unpaid",
        1: "Paid",
        2: "Refunded",
        3: "Failed",
        "Unpaid": "Unpaid",
        "Paid": "Paid",
        "Refunded": "Refunded",
        "Failed": "Failed",
    };

    // Mapear OrderStatus enum a string
    const statusMap: Record<number | string, string> = {
        0: "Pending",
        1: "Confirmed",
        2: "Shipped",
        3: "Delivered",
        4: "Cancelled",
        "Pending": "Pending",
        "Confirmed": "Confirmed",
        "Shipped": "Shipped",
        "Delivered": "Delivered",
        "Cancelled": "Cancelled",
    };

    return {
        ...order,
        status: statusMap[order.status] || order.status,
        paymentStatus: paymentStatusMap[order.paymentStatus] || order.paymentStatus,
    } as OrderDetail;
}
