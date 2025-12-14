import { apiFetch } from "../lib/api";

// Enums como constantes (para compatibilidad con erasableSyntaxOnly)
export const OrderStatus = {
    Pending: 0,
    Confirmed: 1,
    Shipped: 2,
    Delivered: 3,
    Cancelled: 4
} as const;

export const PaymentStatus = {
    Unpaid: 0,
    Paid: 1,
    Refunded: 2,
    Failed: 3
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface OrderItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
}

export interface AdminOrderListItem {
    id: number;
    orderNumber: string;
    createdAt: string;
    status: OrderStatus | string;
    paymentStatus: PaymentStatus | string;
    subtotalAmount: number;
    taxAmount: number;
    totalAmount: number;
}

export interface AdminOrderDetail extends AdminOrderListItem {
    userId: string;
    currency: string;
    updatedAt?: string;
    paidAt?: string;
    cancelledAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    items: OrderItem[];
}

// Obtener lista de órdenes con filtros
export function fetchAdminOrders(params?: {
    status?: OrderStatus | number | null;
    paymentStatus?: PaymentStatus | number | null;
    from?: Date | string | null;
    to?: Date | string | null;
}): Promise<AdminOrderListItem[]> {
    const search = new URLSearchParams();
    
    if (params?.status !== null && params?.status !== undefined) {
        search.append("status", String(params.status));
    }
    if (params?.paymentStatus !== null && params?.paymentStatus !== undefined) {
        search.append("paymentStatus", String(params.paymentStatus));
    }
    if (params?.from) {
        const fromStr = params.from instanceof Date ? params.from.toISOString() : params.from;
        search.append("from", fromStr);
    }
    if (params?.to) {
        const toStr = params.to instanceof Date ? params.to.toISOString() : params.to;
        search.append("to", toStr);
    }

    const query = search.toString();
    return apiFetch<AdminOrderListItem[]>(`/api/v1/admin/orders${query ? `?${query}` : ""}`);
}

// Obtener detalle de una orden
export function fetchAdminOrderDetail(id: number): Promise<AdminOrderDetail> {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}`);
}

// Confirmar orden
export function confirmOrder(id: number): Promise<AdminOrderDetail> {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/confirm`, {
        method: "POST"
    });
}

// Marcar como pagado
export function setPaidOrder(id: number): Promise<AdminOrderDetail> {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/set-paid`, {
        method: "POST"
    });
}

// Marcar como enviado
export function shipOrder(id: number): Promise<AdminOrderDetail> {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/ship`, {
        method: "POST"
    });
}

// Marcar como entregado
export function deliverOrder(id: number): Promise<AdminOrderDetail> {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/deliver`, {
        method: "POST"
    });
}

// Cancelar orden
export function cancelOrder(id: number): Promise<AdminOrderDetail> {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/cancel`, {
        method: "POST"
    });
}

// Mapeo de estados para UI
const orderStatusLabels: Record<OrderStatus | string, string> = {
    [OrderStatus.Pending]: "Pendiente",
    [OrderStatus.Confirmed]: "Confirmado",
    [OrderStatus.Shipped]: "Enviado",
    [OrderStatus.Delivered]: "Entregado",
    [OrderStatus.Cancelled]: "Cancelado",
    "Pending": "Pendiente",
    "Confirmed": "Confirmado",
    "Shipped": "Enviado",
    "Delivered": "Entregado",
    "Cancelled": "Cancelado"
};

const paymentStatusLabels: Record<PaymentStatus | string, string> = {
    [PaymentStatus.Unpaid]: "No pagado",
    [PaymentStatus.Paid]: "Pagado",
    [PaymentStatus.Refunded]: "Reembolsado",
    [PaymentStatus.Failed]: "Fallido",
    "Unpaid": "No pagado",
    "Paid": "Pagado",
    "Refunded": "Reembolsado",
    "Failed": "Fallido"
};

export function getOrderStatusLabel(status: OrderStatus | string): string {
    return orderStatusLabels[status] || String(status);
}

export function getPaymentStatusLabel(status: PaymentStatus | string): string {
    return paymentStatusLabels[status] || String(status);
}

// Mapeo de colores para estados
export function getOrderStatusColor(status: OrderStatus | string): string {
    const statusNum = typeof status === "string" ? parseInt(status) : status;
    switch (statusNum) {
        case OrderStatus.Pending:
            return "yellow";
        case OrderStatus.Confirmed:
            return "blue";
        case OrderStatus.Shipped:
            return "cyan";
        case OrderStatus.Delivered:
            return "green";
        case OrderStatus.Cancelled:
            return "red";
        default:
            return "gray";
    }
}

export function getPaymentStatusColor(status: PaymentStatus | string): string {
    const statusNum = typeof status === "string" ? parseInt(status) : status;
    switch (statusNum) {
        case PaymentStatus.Unpaid:
            return "red";
        case PaymentStatus.Paid:
            return "green";
        case PaymentStatus.Refunded:
            return "orange";
        case PaymentStatus.Failed:
            return "red";
        default:
            return "gray";
    }
}
