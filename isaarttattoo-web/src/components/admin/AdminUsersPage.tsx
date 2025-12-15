import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../Pagination";
import {
    getUsers,
    createUser,
    updateUserRoles,
    changeUserPassword,
    deleteUser,
    fetchRoles,
    createRole,
    deleteRole,
} from "../../api/users";
import type { UserSummary, RoleResponse } from "../../api/users";
import { Link } from "react-router-dom";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRoles, setNewRoles] = useState<string[]>([]);
    const [newRoleName, setNewRoleName] = useState("");
    const [roleToDelete, setRoleToDelete] = useState("");

    const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
    const [passwordNew, setPasswordNew] = useState("");

    const ITEMS_PER_PAGE = 15;

    const loadData = async () => {
        try {
            setLoading(true);
            const usersResponse = await getUsers();
            const sortedUsers = usersResponse.sort((a, b) => a.email.localeCompare(b.email));
            setUsers(sortedUsers);
            setCurrentPage(1);

            try {
                const rolesResponse = await fetchRoles();
                setRoles(rolesResponse);
            } catch (rolesErr) {
                console.error(rolesErr);
                const fallbackRoles = Array.from(new Set(sortedUsers.flatMap((u) => u.roles ?? []))).map((r) => ({
                    id: r,
                    name: r,
                }));
                setRoles(fallbackRoles);
                setFeedback("No se pudieron cargar los roles desde la API, usando valores actuales.");
            }

            setError(null);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar los usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (roles.length > 0 && !roleToDelete) {
            setRoleToDelete(roles[0].name);
        }
    }, [roles, roleToDelete]);

    const roleOptions = useMemo(() => roles.map((r) => r.name), [roles]);

    // Paginacion
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newPassword || newRoles.length === 0) {
            setError("Completa todos los campos y selecciona al menos un rol.");
            return;
        }
        setFeedback(null);
        setError(null);
        try {
            await createUser({ email: newEmail, password: newPassword, roles: newRoles });
            setNewEmail("");
            setNewPassword("");
            setNewRoles([]);
            setFeedback("Usuario creado correctamente.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Error al crear usuario");
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) {
            setError("Introduce un nombre para el rol.");
            return;
        }
        setError(null);
        setFeedback(null);
        try {
            await createRole({ name: newRoleName.trim() });
            setNewRoleName("");
            setFeedback("Rol creado correctamente.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo crear el rol");
        }
    };

    const handleDeleteRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleToDelete) {
            setError("Selecciona un rol para borrar.");
            return;
        }
        if (!confirm(`Seguro que quieres borrar el rol "${roleToDelete}"?`)) return;
        setError(null);
        setFeedback(null);
        try {
            await deleteRole(roleToDelete);
            setFeedback("Rol eliminado correctamente.");
            setRoleToDelete("");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo borrar el rol");
        }
    };

    const handleRolesChange = async (userId: string, rolesSelected: string[]) => {
        try {
            await updateUserRoles({ userId, roles: rolesSelected });
            setFeedback("Roles actualizados");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudieron actualizar los roles");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordUserId || !passwordNew) return;
        try {
            await changeUserPassword({ userId: passwordUserId, newPassword: passwordNew });
            setPasswordUserId(null);
            setPasswordNew("");
            setFeedback("Contraseña actualizada");
        } catch (err) {
            console.error(err);
            setError("No se pudo cambiar la contraseña");
        }
    };

    const handleDeleteUser = async (user: UserSummary) => {
        if (!confirm(`Seguro que quieres eliminar a ${user.email}?`)) return;
        try {
            await deleteUser(user.id);
            setFeedback("Usuario eliminado");
            await loadData();
        } catch (err) {
            console.error(err);
            setError("No se pudo eliminar al usuario");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-white">Usuarios y roles</h1>
                    <p className="text-sm text-slate-300">
                        Crea cuentas nuevas, asigna roles y gestiona accesos de forma segura.
                    </p>
                </div>
                <Link
                    to="/admin"
                    className="rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/80 hover:bg-cyan-400/20"
                >
                    Volver al panel
                </Link>
            </header>

            {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                </div>
            )}
            {feedback && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    {feedback}
                </div>
            )}

            <section className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-white">Crear nuevo rol</h2>
                        <p className="text-sm text-slate-300">Agrega roles personalizados antes de asignarlos.</p>
                    </div>
                    <form onSubmit={handleCreateRole} className="space-y-3">
                        <label className="grid gap-2 text-sm text-slate-200">
                            <span>Nombre del rol</span>
                            <input
                                type="text"
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                placeholder="Ej. Editor"
                            />
                        </label>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
                        >
                            Crear rol
                        </button>
                    </form>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-white">Borrar rol</h3>
                                <p className="text-xs text-slate-300">Selecciona un rol existente para eliminarlo.</p>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-slate-200">
                                {roles.length} roles
                            </span>
                        </div>
                        <form onSubmit={handleDeleteRole} className="space-y-3">
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Rol a borrar</span>
                                <select
                                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                                    value={roleToDelete}
                                    onChange={(e) => setRoleToDelete(e.target.value)}
                                >
                                    <option value="" disabled>
                                        Selecciona un rol
                                    </option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="submit"
                                className="w-full rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-300 hover:bg-red-500/20"
                            >
                                Borrar rol
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h2 className="text-lg font-semibold text-white">Crear nuevo usuario</h2>
                    <p className="text-sm text-slate-300">Asignar roles disponibles desde el directorio.</p>
                    <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 md:grid-cols-6">
                        <label className="grid gap-2 text-sm text-slate-200 md:col-span-3">
                            <span>Correo electronico</span>
                            <input
                                type="email"
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                                placeholder="usuario@correo.com"
                            />
                        </label>
                        <label className="grid gap-2 text-sm text-slate-200 md:col-span-3">
                            <span>Contraseña</span>
                            <input
                                type="password"
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="........"
                            />
                        </label>
                        <fieldset className="md:col-span-4">
                            <legend className="text-sm font-medium text-slate-200">Roles</legend>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {roleOptions.length === 0 && (
                                    <p className="text-xs text-slate-400">No hay roles disponibles.</p>
                                )}
                                {roleOptions.map((role) => {
                                    const checked = newRoles.includes(role);
                                    return (
                                        <label
                                            key={role}
                                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 hover:border-cyan-400/40"
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-white/30 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const nextRoles = e.target.checked
                                                        ? [...newRoles, role]
                                                        : newRoles.filter((r) => r !== role);
                                                    setNewRoles(nextRoles);
                                                }}
                                            />
                                            <span>{role}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>
                        <div className="flex items-end md:col-span-2">
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-900"
                            >
                                Crear usuario
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Usuarios</h2>
                        <p className="text-xs text-slate-400">Roles dinamicos desde la API.</p>
                    </div>
                    {loading && <span className="text-xs text-slate-400">Cargando</span>}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-900/70">
                            <tr>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Confirmado</th>
                                <th className="px-4 py-2 text-left">Roles</th>
                                <th className="px-4 py-2 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((u) => {
                                const availableRoles = Array.from(new Set([...(u.roles ?? []), ...roleOptions]));
                                return (
                                    <tr key={u.id} className="border-t border-white/5">
                                        <td className="px-4 py-2">{u.email}</td>
                                        <td className="px-4 py-2">
                                            {u.emailConfirmed ? (
                                                <span className="text-emerald-400">Si</span>
                                            ) : (
                                                <span className="text-amber-400">No</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-2">
                                                {availableRoles.length === 0 && (
                                                    <span className="text-xs text-slate-400">Sin roles</span>
                                                )}
                                                {availableRoles.map((role) => {
                                                    const checked = u.roles?.includes(role) ?? false;
                                                    return (
                                                        <label
                                                            key={role}
                                                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 hover:border-cyan-400/40"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-white/30 bg-slate-900 text-cyan-400 focus:ring-cyan-400"
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    const nextRoles = e.target.checked
                                                                        ? Array.from(new Set([...(u.roles ?? []), role]))
                                                                        : (u.roles ?? []).filter((r) => r !== role);
                                                                    handleRolesChange(u.id, nextRoles);
                                                                }}
                                                            />
                                                            <span>{role}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs hover:bg-slate-700"
                                                    onClick={() => setPasswordUserId(u.id)}
                                                >
                                                    Cambiar contraseña
                                                </button>
                                                <button
                                                    className="rounded-lg bg-red-600 px-3 py-1 text-xs hover:bg-red-500"
                                                    onClick={() => handleDeleteUser(u)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                                        No hay usuarios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="border-t border-white/5 px-4 py-4 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={users.length}
                        />
                    </div>
                )}
            </section>

            {passwordUserId && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white">Cambiar contraseña</h3>
                        <p className="text-sm text-slate-300">Introduce la nueva contraseña para el usuario seleccionado.</p>
                        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                            <label className="grid gap-2 text-sm text-slate-200">
                                <span>Nueva contraseña</span>
                                <input
                                    type="password"
                                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    value={passwordNew}
                                    onChange={(e) => setPasswordNew(e.target.value)}
                                    required
                                    placeholder="........"
                                />
                            </label>
                            <div className="flex justify-end gap-2 text-sm">
                                <button
                                    type="button"
                                    onClick={() => setPasswordUserId(null)}
                                    className="rounded-lg border border-white/10 px-3 py-2 text-slate-200 hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 font-semibold text-slate-900"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
