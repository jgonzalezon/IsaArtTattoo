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
    return apiFetch<LoginResponse>("/api/v1/Auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export function register(data: RegisterRequest) {
    return apiFetch<unknown>("/api/v1/Auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

// Confirmar email
export function confirmEmail(email: string, token: string) {
    const url =
        `/api/v1/Auth/confirm?` +
        `email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    return apiFetch<string>(url, { method: "GET" });
}

// Reset contraseña
export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export function resetPassword(data: ResetPasswordRequest) {
    return apiFetch<string | { message?: string }>(
        "/api/v1/Auth/reset-password",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
}

export function resendConfirmation(email: string) {
    return apiFetch<string>("/api/v1/Auth/resend-confirmation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
    });
}
