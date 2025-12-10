// src/components/auth/RequireAdmin.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
    children: ReactNode;
}

interface JwtPayload {
    [key: string]: any;
    role?: string | string[];
}

export function userIsAdmin(): boolean {   //  export aquí
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode<JwtPayload>(token);
        const role =
            decoded["role"] ||
            decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        if (Array.isArray(role)) return role.includes("Admin");
        return role === "Admin";
    } catch {
        return false;
    }
}

export function RequireAdmin({ children }: Props) {
    if (!userIsAdmin()) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}
