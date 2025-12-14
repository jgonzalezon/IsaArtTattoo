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

export interface CreateRoleRequest {
    name: string;
}

export interface DeleteRoleRequest {
    name: string;
}

export async function getUsers() {
    // apiFetch incluye automáticamente el token JWT
    return apiFetch<UserSummary[]>("/api/v1/Users");
}

export async function createUser(payload: CreateUserRequest) {
    return apiFetch("/api/v1/Users", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateUserRoles(payload: UpdateUserRolesRequest) {
    return apiFetch("/api/v1/Users/roles", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function changeUserPassword(payload: ChangeUserPasswordRequest) {
    return apiFetch("/api/v1/Users/password", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteUser(id: string) {
    return apiFetch(`/api/v1/Users/${id}`, {
        method: "DELETE",
    });
}

export async function fetchRoles() {
    return apiFetch<RoleResponse[]>("/api/v1/Roles/Listar roles");
}

export async function createRole(payload: CreateRoleRequest) {
    return apiFetch("/api/v1/Roles/Crear Rol", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function deleteRole(name: string) {
    const encodedName = encodeURIComponent(name);
    return apiFetch(`/api/v1/Roles/Borrar Rol ${encodedName}` as const, {
        method: "DELETE",
    });
}
