// src/api/auth.ts
import { apiFetch } from "../lib/api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export function login(data: LoginRequest) {
    return apiFetch<LoginResponse>("/api/Auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export function register(data: RegisterRequest) {
    return apiFetch<unknown>("/api/Auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

//  Confirmar email
export function confirmEmail(email: string, token: string) {
    const url =
        `/api/Auth/confirm?` +
        `email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    return apiFetch<string>(url, { method: "GET" });
}


//  Reset contraseña
export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export function resetPassword(data: ResetPasswordRequest) {
    return apiFetch<string | { message?: string }>("/api/Auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
