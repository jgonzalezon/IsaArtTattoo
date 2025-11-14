import { useState } from "react";

type Props = { apiBase: string };

type Mode = "login" | "register" | "awaiting-confirmation";

export default function AuthCard({ apiBase }: Props) {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState<string | null>(null);

    const base = apiBase || ""; // si usas proxy de Vite, queda en ""

    const activeTab = mode === "awaiting-confirmation" ? "register" : mode;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setInfo(null);

        try {
            if (mode === "login") {
                const r = await fetch(`${base}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await r.json();
                if (!r.ok) {
                    throw new Error(data?.title ?? data ?? "Error de login");
                }
                localStorage.setItem("token", data.token);
                setInfo("✅ Login correcto. Token guardado en localStorage.");
            } else {
                // register o awaiting-confirmation → intentamos crear usuario
                const r = await fetch(`${base}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await r.json();
                if (!r.ok) {
                    const msg = Array.isArray(data?.errors)
                        ? data.errors[0].description
                        : data?.title ?? "Error de registro";
                    throw new Error(msg);
                }

                // Registro OK → mostramos estado "esperando confirmación"
                setMode("awaiting-confirmation");
                setInfo(
                    "📧 Usuario creado. Revisa tu correo para confirmar la cuenta."
                );
            }
        } catch (err: any) {
            setInfo(`❌ ${err.message || "Algo ha fallado"}`);
        } finally {
            setBusy(false);
        }
    }

    async function getMe() {
        setBusy(true);
        try {
            const token = localStorage.getItem("token");
            const r = await fetch(`${base}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await r.json();
            setInfo(
                r.ok
                    ? `👤 Usuario: ${data?.name ?? "?"}`
                    : `❌ ${data?.title ?? "No autorizado"}`
            );
        } finally {
            setBusy(false);
        }
    }

    async function resendConfirm() {
        setBusy(true);
        setInfo(null);
        try {
            const r = await fetch(`${base}/api/auth/resend-confirmation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // 🔹 IMPORTANTE: enviar objeto { email }
                body: JSON.stringify({ email }),
            });

            const text = await r.text();
            if (r.ok) {
                setInfo("📨 Correo de confirmación reenviado.");
            } else {
                setInfo(`❌ ${text || "No se ha podido reenviar el correo."}`);
            }
        } catch (err: any) {
            setInfo(
                `❌ ${err?.message || "No se ha podido reenviar el correo."}`
            );
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

            <form onSubmit={handleSubmit} className="grid gap-4">
                <label className="grid gap-1.5">
                    <span className="text-xs text-slate-300">Correo</span>
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-cyan-400/40"
                        placeholder="tu@email.com"
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
                        className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none ring-1 ring-transparent focus:ring-cyan-400/40"
                        placeholder="••••••••"
                    />
                </label>

                <button
                    type="submit"
                    disabled={busy}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition active:scale-[.98] disabled:opacity-60"
                >
                    {busy
                        ? "Procesando..."
                        : mode === "login"
                            ? "Entrar"
                            : "Crear cuenta"}
                </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                {/* 🔹 Solo mostrar “Reenviar confirmación” tras registrarse */}
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
                            localStorage.removeItem("token");
                            setInfo("🔒 Token borrado.");
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
        </div>
    );
}
