// src/api/auth.ts
import { apiFetch } from "../lib/api";

export interface LoginRequest {
    email: string;
    password: string;
}

// Ajusta esto al JSON REAL que te devuelve el AuthController
export interface LoginResponse {
    token: string;
    // userEmail?: string;
    // roles?: string[];
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

// Más adelante aquí meteremos:
// - confirmEmail
// - forgotPassword
// - resetPassword
// etc., apuntando a tus endpoints reales.
