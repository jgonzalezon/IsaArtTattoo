// src/lib/api.ts

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

if (!RAW_BASE_URL) {
    console.warn("VITE_API_BASE_URL no está definido");
}

// Normalizamos: sin barra final
const BASE_URL = RAW_BASE_URL.endsWith("/")
    ? RAW_BASE_URL.slice(0, -1)
    : RAW_BASE_URL;

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    // Aseguramos que path empieza por "/"
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }

    const url = `${BASE_URL}${path}`;

    // Construimos Headers a partir de lo que venga en options
    const headers = new Headers(options.headers ?? undefined);

    const token = localStorage.getItem("auth_token");
    const hasAuthorization = headers.has("Authorization");
    const hasContentType = headers.has("Content-Type");
    const isFormData = options.body instanceof FormData;

    // Añadimos Authorization si no viene y tenemos token
    if (!hasAuthorization && token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Si no es FormData y no viene Content-Type, lo fijamos a JSON
    if (!hasContentType && !isFormData) {
        headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error HTTP ${res.status}`);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        try {
            const json = await res.json();
            return json as T;
        } catch {
            const text = await res.text();
            return text as unknown as T;
        }
    }

    const text = await res.text();
    return text as unknown as T;
}
