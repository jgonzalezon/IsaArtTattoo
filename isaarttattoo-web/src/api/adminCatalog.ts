import { apiFetch } from "../lib/api";

export interface AdminCategory {
    id: number;
    name: string;
    description?: string | null;
    displayOrder: number;
}

export interface AdminProduct {
    id: number;
    name: string;
    shortDescription?: string | null;
    price: number;
    stock: number;
    isActive: boolean;
    categoryName?: string | null;
}

const authHeaders = (): RequestInit => {
    const token = localStorage.getItem("auth_token");
    return {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
};

export function getCategories() {
    return apiFetch<AdminCategory[]>("/api/catalog/categories", authHeaders());
}

export function createCategory(payload: Partial<AdminCategory>) {
    return apiFetch<AdminCategory>("/api/catalog/categories", {
        method: "POST",
        body: JSON.stringify(payload),
        ...authHeaders(),
    });
}

export function updateCategory(id: number, payload: Partial<AdminCategory>) {
    return apiFetch<AdminCategory>(`/api/catalog/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        ...authHeaders(),
    });
}

export function deleteCategory(id: number) {
    return apiFetch<void>(`/api/catalog/categories/${id}`, {
        method: "DELETE",
        ...authHeaders(),
    });
}

export function getProducts() {
    return apiFetch<AdminProduct[]>("/api/catalog/products", authHeaders());
}

export function createProduct(payload: Partial<AdminProduct> & { categoryId?: number }) {
    return apiFetch<AdminProduct>("/api/catalog/products", {
        method: "POST",
        body: JSON.stringify(payload),
        ...authHeaders(),
    });
}

export function updateProduct(id: number, payload: Partial<AdminProduct> & { categoryId?: number }) {
    return apiFetch<AdminProduct>(`/api/catalog/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        ...authHeaders(),
    });
}

export function deleteProduct(id: number) {
    return apiFetch<void>(`/api/catalog/products/${id}`, {
        method: "DELETE",
        ...authHeaders(),
    });
}
