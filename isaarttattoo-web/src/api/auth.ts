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
