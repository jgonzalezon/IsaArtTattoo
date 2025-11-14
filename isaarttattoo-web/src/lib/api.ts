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

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    // Errores 4xx / 5xx
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error HTTP ${res.status}`);
    }

    // Sin contenido (204, etc.)
    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("content-type") ?? "";

    // Si parece JSON, intentamos leer como JSON,
    // pero si falla (porque realmente es HTML), devolvemos texto.
    if (contentType.includes("application/json")) {
        try {
            const json = await res.json();
            return json as T;
        } catch {
            const text = await res.text();
            return text as unknown as T;
        }
    }

    // Cualquier otra cosa (text/plain, text/html, etc.) → texto
    const text = await res.text();
    return text as unknown as T;
}
