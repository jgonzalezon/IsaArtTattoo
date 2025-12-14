// src/components/auth/RequireAdmin.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: ReactNode;
}

interface DecodedToken {
    [key: string]: unknown;
    role?: string | string[];
}

// Función para decodificar JWT manualmente (sin dependencia)
function parseJwtToken(token: string | null): DecodedToken | null {
    if (!token) return null;

    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        
        const jsonString = atob(base64);
        const decoded = JSON.parse(jsonString) as DecodedToken;
        
        return decoded;
    } catch {
        return null;
    }
}

export function userIsAdmin(tokenArg?: string | null): boolean {
    // Prioridad: 1. parámetro, 2. localStorage
    const token = tokenArg !== undefined ? tokenArg : localStorage.getItem("auth_token");
    
    const decoded = parseJwtToken(token);
    if (!decoded) {
        return false;
    }

    // Intentar múltiples lugares donde podría estar el role
    const role = 
        decoded.role ||
        decoded["roles"] ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!role) {
        return false;
    }

    // Manejar array o string
    return Array.isArray(role) 
        ? role.includes("Admin")
        : role === "Admin";
}

export function RequireAdmin({ children }: Props) {
    if (!userIsAdmin()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
