// src/auth/RequireAdmin.tsx
import { Navigate, Outlet } from "react-router-dom";

export function parseJwt(token: string | null): any | null {
    if (!token) return null;

    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function userIsAdmin(tokenFromArgs?: string | null): boolean {
    const token =
        tokenFromArgs !== undefined
            ? tokenFromArgs
            : localStorage.getItem("auth_token");
    const claims = parseJwt(token);
    if (!claims) return false;

    const possibleRoles =
        claims["role"] ??
        claims["roles"] ??
        claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (!possibleRoles) return false;

    if (Array.isArray(possibleRoles)) {
        return possibleRoles.includes("Admin");
    }

    return String(possibleRoles) === "Admin";
}

export default function RequireAdmin() {
    const token = localStorage.getItem("auth_token");

    if (!token || !userIsAdmin(token)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
