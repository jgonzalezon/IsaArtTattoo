// src/api/users.ts
import { apiFetch } from "../lib/api";

export interface UserSummary {
    id: string;
    email: string;
    emailConfirmed: boolean;
    roles: string[];
}

export interface CreateUserRequest {
    email: string;
    password: string;
    roles: string[];
}

export interface UpdateUserRolesRequest {
    userId: string;
    roles: string[];
}

export interface ChangeUserPasswordRequest {
    userId: string;
    newPassword: string;
}

export interface RoleResponse {
    id: string;
    name: string;
}

// Helper para meter el JWT
function authOptions(extra: RequestInit = {}): RequestInit {
    // IMPORTANTE: misma clave que en AuthCard
    const token = localStorage.getItem("auth_token");

    return {
        ...extra,
        headers: {
            ...(extra.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
}

export async function getUsers() {
    return apiFetch<UserSummary[]>("/api/v1/Users", authOptions());
}

export async function createUser(payload: CreateUserRequest) {
    return apiFetch("/api/v1/Users", authOptions({
        method: "POST",
        body: JSON.stringify(payload),
    }));
}

export async function updateUserRoles(payload: UpdateUserRolesRequest) {
    return apiFetch("/api/v1/Users/roles", authOptions({
        method: "PUT",
        body: JSON.stringify(payload),
    }));
}

export async function changeUserPassword(payload: ChangeUserPasswordRequest) {
    return apiFetch("/api/v1/Users/password", authOptions({
        method: "PUT",
        body: JSON.stringify(payload),
    }));
}

export async function deleteUser(id: string) {
    return apiFetch(`/api/v1/Users/${id}`, authOptions({
        method: "DELETE",
    }));
}

export async function fetchRoles() {
    return apiFetch<RoleResponse[]>("/api/v1/Roles", authOptions());
}
