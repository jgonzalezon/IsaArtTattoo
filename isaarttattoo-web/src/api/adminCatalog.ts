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
    categoryId: number | null;
    categoryName?: string | null;
}

export interface ProductImage {
    id: number;
    url: string;
    altText?: string | null;
    displayOrder: number;
}

export function getCategories() {
    return apiFetch<AdminCategory[]>("/api/catalog/categories");
}

export function createCategory(payload: Partial<AdminCategory>) {
    return apiFetch<AdminCategory>("/api/admin/catalog/categories", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateCategory(id: number, payload: Partial<AdminCategory>) {
    return apiFetch<AdminCategory>(`/api/admin/catalog/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function deleteCategory(id: number) {
    return apiFetch<void>(`/api/admin/catalog/categories/${id}`, {
        method: "DELETE",
    });
}

export function getProducts() {
    return apiFetch<AdminProduct[]>("/api/admin/catalog/products");
}

export function createProduct(payload: Partial<AdminProduct> & { categoryId?: number | null }) {
    return apiFetch<AdminProduct>("/api/admin/catalog/products", {
        method: "POST",
        body: JSON.stringify({
            ...payload,
            initialStock: payload.stock ?? 0,
        }),
    });
}

export function updateProduct(id: number, payload: Partial<AdminProduct> & { categoryId?: number | null }) {
    return apiFetch<AdminProduct>(`/api/admin/catalog/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function deleteProduct(id: number) {
    return apiFetch<void>(`/api/admin/catalog/products/${id}`, {
        method: "DELETE",
    });
}

export function createProductWithImage(payload: {
    name: string;
    shortDescription?: string;
    price: number;
    categoryId?: number;
    stock: number;
    isActive: boolean;
    file: File;
    altText?: string;
    displayOrder?: number;
}) {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("shortDescription", payload.shortDescription ?? "");
    form.append("price", payload.price.toString());
    if (payload.categoryId) form.append("categoryId", payload.categoryId.toString());
    form.append("initialStock", payload.stock.toString());
    form.append("isActive", payload.isActive ? "true" : "false");
    form.append("file", payload.file);
    if (payload.altText) form.append("altText", payload.altText);
    if (payload.displayOrder !== undefined) form.append("displayOrder", payload.displayOrder.toString());

    return apiFetch<AdminProduct>("/api/admin/catalog/products-with-image", {
        method: "POST",
        body: form,
    });
}

export function uploadProductImage(
    productId: number,
    payload: { file: File; altText?: string; displayOrder?: number },
) {
    const form = new FormData();
    form.append("file", payload.file);
    if (payload.altText) form.append("altText", payload.altText);
    if (payload.displayOrder !== undefined) form.append("displayOrder", payload.displayOrder.toString());

    return apiFetch<ProductImage>(`/api/admin/catalog/products/${productId}/images/upload`, {
        method: "POST",
        body: form,
    });
}
