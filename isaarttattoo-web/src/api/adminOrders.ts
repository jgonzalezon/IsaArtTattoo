import { apiFetch } from "../lib/api";
import type { OrderItem } from "./shop";

export interface AdminOrderListItem {
    id: number;
    orderNumber?: string;
    userId?: string;
    userEmail?: string;
    status?: string;
    paymentStatus?: string;
    totalAmount?: number;
    createdAt?: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
    items?: (OrderItem & { name?: string })[];
    updatedAt?: string;
}

export function fetchAdminOrders(params: {
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
}) {
    const search = new URLSearchParams();
    if (params.status) search.append("status", params.status);
    if (params.paymentStatus) search.append("paymentStatus", params.paymentStatus);
    if (params.from) search.append("from", params.from);
    if (params.to) search.append("to", params.to);

    const query = search.toString();
    // ? Usar ruta estándar del Gateway: /api/v1/admin/orders
    return apiFetch<AdminOrderListItem[]>(`/api/v1/admin/orders${query ? `?${query}` : ""}`);
}

export function fetchAdminOrderDetail(id: number) {
    // ? Usar ruta estándar del Gateway
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}`);
}

export function postAdminOrderAction(id: number, action: string) {
    // ? Usar ruta estándar del Gateway
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/${action}`, {
        method: "POST",
    });
}
