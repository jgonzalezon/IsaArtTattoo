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

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error HTTP ${res.status}`);
    }

    // si algún endpoint no devuelve JSON, ya lo afinaremos
    return (await res.json()) as T;
}
