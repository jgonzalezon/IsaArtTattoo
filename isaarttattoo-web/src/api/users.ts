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

// Helper para añadir el token JWT
function authOptions(extra?: RequestInit): RequestInit {
    const token = localStorage.getItem("token");
    return {
        ...extra,
        headers: {
            ...(extra?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
}

export async function getUsers() {
    return apiFetch<UserSummary[]>("/api/users", authOptions());
}

export async function createUser(payload: CreateUserRequest) {
    return apiFetch("/api/users", authOptions({
        method: "POST",
        body: JSON.stringify(payload),
    }));
}

export async function updateUserRoles(payload: UpdateUserRolesRequest) {
    return apiFetch("/api/users/roles", authOptions({
        method: "PUT",
        body: JSON.stringify(payload),
    }));
}

export async function changeUserPassword(payload: ChangeUserPasswordRequest) {
    return apiFetch("/api/users/password", authOptions({
        method: "PUT",
        body: JSON.stringify(payload),
    }));
}

export async function deleteUser(id: string) {
    return apiFetch(`/api/users/${id}`, authOptions({
        method: "DELETE",
    }));
}
