// src/api/client.ts

// 1) Leemos la base y LE QUITAMOS las barras del final
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

if (!RAW_BASE_URL) {
    console.warn("VITE_API_BASE_URL no está definido");
}

// Ej: "https://localhost:7213/" -> "https://localhost:7213"
const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

// ---------------------------------------------
// Helper: normaliza rutas, añade /api/v1 si toca
// ---------------------------------------------
function resolveApiUrl(path: string): string {
    // Aseguramos que empieza por "/"
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }

    // Si ya viene con /api/v1/... lo respetamos
    if (path.startsWith("/api/v")) {
        return `${API_BASE_URL}${path}`;
    }

    // Si es /api/... le inyectamos la versión
    if (path.startsWith("/api/")) {
        return `${API_BASE_URL}/api/v1${path.substring(4)}`;
    }

    // Cualquier otra ruta
    return `${API_BASE_URL}${path}`;
}

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = resolveApiUrl(path);

    console.log("apiFetch ?", url, options);

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

    if (res.status === 204) {
        return undefined as T;
    }

    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
        return await res.json();
    }

    const textResult = await res.text();
    return textResult as T;
}
