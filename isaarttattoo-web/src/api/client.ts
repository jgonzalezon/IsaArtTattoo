// src/api/client.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
    console.warn("VITE_API_BASE_URL no está definido");
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!res.ok) {
        // Puedes sofisticarlo más adelante
        const text = await res.text();
        throw new Error(text || `Error HTTP ${res.status}`);
    }

    // Si tu endpoint no devuelve JSON, ajusta esto
    return (await res.json()) as T;
}
