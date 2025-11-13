// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_IDENTITY_API_URL as string;

if (!BASE_URL) {
    console.warn("VITE_IDENTITY_API_URL no está definido");
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    // Errores 4xx/5xx
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error HTTP ${res.status}`);
    }

    // Sin contenido (204, etc.)
    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        const json = await res.json();
        return json as T;
    }

    const text = await res.text();
    return text as unknown as T;
}
