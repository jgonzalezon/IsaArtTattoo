// src/components/admin/AdminUsersPage.tsx
import { useEffect, useState } from "react";
import {
    getUsers,
    createUser,
    updateUserRoles,
    changeUserPassword,
    deleteUser,
    UserSummary,
} from "../../api/users";

const ALL_ROLES = ["Admin", "User"] as const;

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // form nuevo usuario
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newIsAdmin, setNewIsAdmin] = useState(false);

    // form cambio password
    const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
    const [passwordNew, setPasswordNew] = useState("");

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newPassword) return;

        try {
            await createUser({
                email: newEmail,
                password: newPassword,
                roles: newIsAdmin ? ["Admin", "User"] : ["User"],
            });
            setNewEmail("");
            setNewPassword("");
            setNewIsAdmin(false);
            await loadUsers();
        } catch (err: any) {
            console.error(err);
            alert("Error al crear usuario");
        }
    };

    const toggleRole = async (user: UserSummary, role: string) => {
        const hasRole = user.roles.includes(role);
        let newRoles = hasRole
            ? user.roles.filter((r) => r !== role)
            : [...user.roles, role];

        // prevención: al menos un rol "User"
        if (!newRoles.includes("User")) {
            newRoles = [...newRoles, "User"];
        }

        try {
            await updateUserRoles({ userId: user.id, roles: newRoles });
            await loadUsers();
        } catch (err: any) {
            console.error(err);
            alert("Error al actualizar roles");
        }
    };

    const openPasswordDialog = (userId: string) => {
        setPasswordUserId(userId);
        setPasswordNew("");
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordUserId || !passwordNew) return;

        try {
            await changeUserPassword({
                userId: passwordUserId,
                newPassword: passwordNew,
            });
            setPasswordUserId(null);
            setPasswordNew("");
            alert("Contraseña actualizada");
        } catch (err: any) {
            console.error(err);
            alert("Error al cambiar contraseña");
        }
    };

    const handleDeleteUser = async (user: UserSummary) => {
        if (!confirm(`¿Seguro que quieres eliminar a ${user.email}?`)) return;

        try {
            await deleteUser(user.id);
            await loadUsers();
        } catch (err: any) {
            console.error(err);
            alert("No se pudo eliminar el usuario (quizá es el admin principal).");
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-4">Administración de usuarios</h1>

            {error && (
                <div className="mb-4 rounded bg-red-100 text-red-800 px-4 py-2 text-sm">
                    {error}
                </div>
            )}

            {/* Crear usuario */}
            <section className="mb-8 border rounded-xl p-4 bg-slate-900/40">
                <h2 className="text-lg font-semibold mb-3">Crear nuevo usuario</h2>
                <form
                    onSubmit={handleCreateUser}
                    className="grid gap-3 md:grid-cols-4 items-end"
                >
                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={newIsAdmin}
                                onChange={(e) => setNewIsAdmin(e.target.checked)}
                            />
                            Dar rol Admin
                        </label>
                        <button
                            type="submit"
                            className="ml-auto px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
                        >
                            Crear
                        </button>
                    </div>
                </form>
            </section>

            {/* Lista de usuarios */}
            <section className="border rounded-xl overflow-hidden bg-slate-900/40">
                <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Usuarios</h2>
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
                                <tr key={u.id} className="border-t border-slate-800">
                                    <td className="px-4 py-2">{u.email}</td>
                                    <td className="px-4 py-2">
                                        {u.emailConfirmed ? (
                                            <span className="text-emerald-400">Sí</span>
                                        ) : (
                                            <span className="text-amber-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-3">
                                            {ALL_ROLES.map((role) => (
                                                <label
                                                    key={role}
                                                    className="inline-flex items-center gap-1 text-xs"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={u.roles.includes(role)}
                                                        onChange={() => toggleRole(u, role)}
                                                    />
                                                    {role}
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                                                onClick={() => openPasswordDialog(u.id)}
                                            >
                                                Cambiar contraseña
                                            </button>
                                            <button
                                                className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
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
                                    <td
                                        colSpan={4}
                                        className="px-4 py-4 text-center text-slate-400"
                                    >
                                        No hay usuarios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Diálogo simple para cambiar contraseña */}
            {passwordUserId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
                        <h3 className="text-lg font-semibold mb-3">
                            Cambiar contraseña de usuario
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Nueva contraseña</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
                                    value={passwordNew}
                                    onChange={(e) => setPasswordNew(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPasswordUserId(null)}
                                    className="px-3 py-2 text-sm rounded bg-slate-700 hover:bg-slate-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-2 text-sm rounded bg-emerald-600 hover:bg-emerald-500"
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
