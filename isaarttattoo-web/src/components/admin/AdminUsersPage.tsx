import { useEffect, useMemo, useState } from "react";
import {
    getUsers,
    createUser,
    updateUserRoles,
    changeUserPassword,
    deleteUser,
    fetchRoles,
} from "../../api/users";
import type { UserSummary, RoleResponse } from "../../api/users";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRoles, setNewRoles] = useState<string[]>([]);

    const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
    const [passwordNew, setPasswordNew] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersResponse, rolesResponse] = await Promise.all([
                getUsers(),
                fetchRoles(),
            ]);
            const sortedUsers = usersResponse.sort((a, b) => a.email.localeCompare(b.email));
            setUsers(sortedUsers);
            setRoles(rolesResponse);
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

    const roleOptions = useMemo(() => roles.map((r) => r.name), [roles]);

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
        if (!confirm(`¿Seguro que quieres eliminar a ${user.email}?`)) return;
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
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold text-white">Usuarios y roles</h1>
                <p className="text-sm text-slate-300">
                    Crea cuentas nuevas, asigna roles y gestiona accesos de forma segura.
                </p>
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

            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-lg font-semibold text-white">Crear nuevo usuario</h2>
                <p className="text-sm text-slate-300">Asignar roles disponibles desde el directorio.</p>
                <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 md:grid-cols-4">
                    <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                        <span>Correo electrónico</span>
                        <input
                            type="email"
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                            placeholder="usuario@correo.com"
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Contraseña</span>
                        <input
                            type="password"
                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </label>
                    <label className="grid gap-2 text-sm text-slate-200">
                        <span>Roles</span>
                        <select
                            multiple
                            value={newRoles}
                            onChange={(e) =>
                                setNewRoles(
                                    Array.from(e.target.selectedOptions).map((o) => o.value)
                                )
                            }
                            className="h-full min-h-[44px] rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                            {roleOptions.map((role) => (
                                <option key={role} value={role} className="bg-slate-900">
                                    {role}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-900"
                        >
                            Crear usuario
                        </button>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Usuarios</h2>
                        <p className="text-xs text-slate-400">Roles dinámicos desde la API.</p>
                    </div>
                    {loading && <span className="text-xs text-slate-400">Cargando…</span>}
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
                            {users.map((u) => (
                                <tr key={u.id} className="border-t border-white/5">
                                    <td className="px-4 py-2">{u.email}</td>
                                    <td className="px-4 py-2">
                                        {u.emailConfirmed ? (
                                            <span className="text-emerald-400">Sí</span>
                                        ) : (
                                            <span className="text-amber-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            multiple
                                            value={u.roles}
                                            onChange={(e) =>
                                                handleRolesChange(
                                                    u.id,
                                                    Array.from(e.target.selectedOptions).map((o) => o.value)
                                                )
                                            }
                                            className="min-w-[200px] rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            {roleOptions.map((role) => (
                                                <option key={role} value={role} className="bg-slate-900">
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
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
                            ))}

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
                                    placeholder="••••••••"
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
