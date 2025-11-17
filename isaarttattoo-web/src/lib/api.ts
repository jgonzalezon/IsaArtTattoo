// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!BASE_URL) {
    console.warn("VITE_API_BASE_URL no está definido");
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BASE_URL}${path}`;

    // No forzamos Content-Type si el caller ya lo ha puesto
    const headers: HeadersInit = {
        ...(options.headers || {}),
    };

    const res = await fetch(url, {
        ...options,
        headers,
    });

    // Errores HTTP
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error HTTP ${res.status}`);
    }

    // Sin contenido
    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";

    // JSON
    if (contentType.includes("application/json")) {
        try {
            const json = await res.json();
            return json as T;
        } catch {
            const text = await res.text();
            return text as unknown as T;
        }
    }

    // Otro tipo → texto
    const text = await res.text();
    return text as unknown as T;
}
