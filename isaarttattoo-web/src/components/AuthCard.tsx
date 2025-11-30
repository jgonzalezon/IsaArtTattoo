import { useState } from "react";
import { Link } from "react-router-dom";
import { userIsAdmin } from "../auth/RequireAdmin";

import {
    login as apiLogin,
    register as apiRegister,
    resendConfirmation as apiResendConfirmation,
} from "../api/auth";
import { apiFetch } from "../api/client";

type Props = { apiBase: string };

type Mode = "login" | "register" | "awaiting-confirmation";

export default function AuthCard({ apiBase }: Props) {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState<string | null>(null);

    const activeTab = mode === "awaiting-confirmation" ? "register" : mode;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setInfo(null);

        try {
            if (mode === "login") {
                const data = await apiLogin({ email, password });
                localStorage.setItem("auth_token", data.token);
                setInfo("Login correcto. Token guardado en localStorage.");
            } else {
                await apiRegister({ email, password });
                setMode("awaiting-confirmation");
                setInfo("Usuario creado. Revisa tu correo para confirmar la cuenta.");
            }
        } catch (err: any) {
            setInfo(err.message || "Ha ocurrido un error");
        } finally {
            setBusy(false);
        }
    }

    async function getMe() {
        setBusy(true);
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setInfo("No hay token en localStorage.");
                return;
            }

            const r = await apiFetch<any>("/api/v1/Auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setInfo(`Usuario: ${r?.email ?? r?.name ?? "Desconocido"}`);
        } catch (err: any) {
            setInfo(err.message || "No autorizado");
        } finally {
            setBusy(false);
        }
    }

    async function resendConfirm() {
        setBusy(true);
        setInfo(null);
        try {
            await apiResendConfirmation(email);
            setInfo("Correo de confirmación reenviado.");
        } catch (err: any) {
            setInfo(err.message || "No se pudo reenviar el correo.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2 rounded-lg bg-slate-900/40 p-1 ring-1 ring-white/10">
                    <button
                        onClick={() => setMode("login")}
                        className={`rounded-md px-3 py-1.5 text-sm transition ${activeTab === "login"
                                ? "bg-white/10 text-white"
                                : "text-slate-300 hover:text-white"
                            }`}
                    >
                        Iniciar sesión
                    </button>

                    <button
                        onClick={() => setMode("register")}
                        className={`rounded-md px-3 py-1.5 text-sm transition ${activeTab === "register"
                                ? "bg-white/10 text-white"
                                : "text-slate-300 hover:text-white"
                            }`}
                    >
                        Registrarse
                    </button>
                </div>

                <span className="rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-slate-900">
                    IsaArtTattoo
                </span>
            </div>

            {userIsAdmin() && (
                <div className="mb-4 text-center">
                    <Link
                        to="/admin/users"
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
                    >
                        Ir al panel de administración
                    </Link>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">

                <label className="grid gap-1.5">
                    <span className="text-xs text-slate-300">Correo</span>
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white"
                        placeholder="correo@mail.com"
                    />
                </label>

                <label className="grid gap-1.5">
                    <span className="text-xs text-slate-300">Contraseña</span>
                    <input
                        type="password"
                        required
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white"
                        placeholder="*******"
                    />
                </label>

                <button
                    type="submit"
                    disabled={busy}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition disabled:opacity-60"
                >
                    {busy
                        ? "Procesando..."
                        : mode === "login"
                            ? "Entrar"
                            : "Crear cuenta"}
                </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">

                {mode === "awaiting-confirmation" && (
                    <button
                        onClick={resendConfirm}
                        className="underline underline-offset-4 hover:text-white"
                        disabled={!email || busy}
                    >
                        Reenviar confirmación
                    </button>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={getMe}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                    >
                        Probar /me
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem("auth_token");
                            setInfo("Token borrado.");
                        }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>

            {info && (
                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-3 text-sm text-slate-200">
                    {info}
                </div>
            )}

            {apiBase && (
                <p className="mt-3 text-center text-xs text-slate-400">
                    API base: {apiBase}
                </p>
            )}
        </div>
    );
}
