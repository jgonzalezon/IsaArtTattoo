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

const authOptions = (extra: RequestInit = {}): RequestInit => {
    const token = localStorage.getItem("auth_token");
    return {
        ...extra,
        headers: {
            "Content-Type": "application/json",
            ...(extra.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
};

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
    return apiFetch<AdminOrderListItem[]>(`/api/v1/admin/orders${query ? `?${query}` : ""}`,
        authOptions());
}

export function fetchAdminOrderDetail(id: number) {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}`, authOptions());
}

export function postAdminOrderAction(id: number, action: string) {
    return apiFetch<AdminOrderDetail>(`/api/v1/admin/orders/${id}/${action}`, {
        method: "POST",
        ...authOptions(),
    });
}
