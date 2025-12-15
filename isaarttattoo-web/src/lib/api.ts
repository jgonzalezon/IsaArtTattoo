// src/lib/api.ts

/**
 * Detecta automáticamente la URL del API Gateway según el entorno
 * - En desarrollo local: https://localhost:7213
 * - En ngrok: https://{dominio-ngrok}
 */
const getGatewayUrl = (): string => {
  if (typeof window === "undefined") {
    return "https://localhost:7213";
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Si es ngrok, usar el dominio de ngrok
  if (hostname.includes("ngrok")) {
    // 🔹 IMPORTANTE: ngrok por defecto redirige HTTPS a HTTP internamente
    // Pero el cliente debe usar HTTPS hacia ngrok
    const url = `${protocol}//${hostname}`;
    console.log("[API] Using ngrok gateway:", url);
    return url;
  }

  // Si es localhost/127.0.0.1, usar el puerto local
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "https://localhost:7213";
  }

  // Fallback
  return "https://localhost:7213";
};

const BASE_URL = getGatewayUrl();

export async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("auth_token");

    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}${path}`;

    console.log("[API] Request:", {
        method: options.method || "GET",
        url,
        hasToken: !!token,
    });

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            // 🔹 En ngrok, necesitamos permitir credenciales y headers custom
            ...(BASE_URL.includes("ngrok") && { mode: "cors" }),
        });

        console.log("[API] Response:", {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get("content-type"),
            url: response.url,
        });

        if (!response.ok) {
            let errorMessage = `API error: ${response.status} ${response.statusText}`;
            
            try {
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } else {
                    const text = await response.text();
                    console.error("[API] Non-JSON error response:", text.substring(0, 500));
                }
            } catch (parseError) {
                console.error("[API] Error parsing error response:", parseError);
            }
            
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            console.error("[API] Expected JSON response, got:", contentType);
            console.error("[API] Requested URL:", url);
            console.error("[API] Response URL:", response.url);
            
            // Si estamos en ngrok y el contenido es HTML, probablemente ngrok no puede llegar al backend
            if (BASE_URL.includes("ngrok") && contentType?.includes("text/html")) {
                throw new Error("ngrok no puede conectar con el API Gateway. Verifica que: 1) El AppHost esté ejecutándose, 2) ngrok esté correctamente configurado con 'ngrok http https://localhost:7213'");
            }
            
            throw new Error(`Invalid response format from API. Expected JSON but got ${contentType}`);
        }           

        const data = await response.json();
        console.log("[API] Success:", { path, itemCount: Array.isArray(data) ? data.length : 1 });
        return data;
    } catch (error) {
        console.error(`[API] Fetch error for ${url}:`, error);
        throw error;
    }
}
