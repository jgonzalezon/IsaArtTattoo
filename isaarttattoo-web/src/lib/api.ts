// src/lib/api.ts

// El API Gateway SIEMPRE es el punto de entrada
// En desarrollo: https://localhost:7213 (API Gateway)
// Los servicios internos se comunican por service discovery
const FALLBACK_GATEWAY_URL = "https://localhost:7213";

// ✅ NUNCA usar VITE_API_BASE_URL - siempre forzar al Gateway
const BASE_URL = FALLBACK_GATEWAY_URL;

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("auth_token");

    // ✅ NO establecer Content-Type si el body es FormData
    // El navegador lo establece automáticamente a multipart/form-data
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers as Record<string, string>),
    };

    // Enviar el token JWT si está disponible
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}${path}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(
                `API error: ${response.status} ${response.statusText}`
            );
        }

        // Manejar respuestas sin body (204 No Content)
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json();
    } catch (error) {
        console.error(`API Fetch error:`, error);
        throw error;
    }
}
