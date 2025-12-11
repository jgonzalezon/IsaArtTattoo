import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { register as apiRegister, resendConfirmation as apiResendConfirmation } from "../api/auth";
import type { LoginRequest } from "../api/auth";

type Mode = "login" | "register" | "awaiting-confirmation";
type Props = { initialMode?: Mode };

export default function AuthCard({ initialMode }: Props) {
    const [mode, setMode] = useState<Mode>(initialMode ?? "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const activeTab = useMemo(
        () => (mode === "awaiting-confirmation" ? "register" : mode),
        [mode]
    );

    useEffect(() => {
        setErrorMessage(null);
        setMessage(null);
    }, [activeTab]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setErrorMessage(null);
        setMessage(null);

        try {
            if (activeTab === "login") {
                await login({ email, password } as LoginRequest);
                setMessage("Sesión iniciada correctamente.");
                navigate("/");
            } else {
                await apiRegister({ email, password });
                setMode("awaiting-confirmation");
                setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso.");
            }
        } catch (err) {
            console.error("Error de autenticación", err);
            setErrorMessage(
                activeTab === "login"
                    ? "Correo o contraseña incorrectos."
                    : "No pudimos crear tu cuenta. Inténtalo de nuevo."
            );
        } finally {
            setBusy(false);
        }
    };

    const resendConfirm = async () => {
        setBusy(true);
        setErrorMessage(null);
        setMessage(null);
        try {
            await apiResendConfirmation(email);
            setMessage("Hemos reenviado el correo de confirmación.");
        } catch (err) {
            console.error("Error reenviando confirmación", err);
            setErrorMessage("No se pudo reenviar el correo de confirmación.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-8 p-8">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/15 to-indigo-500/10 p-6 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_35%)]"></div>
                    <div className="relative z-10 space-y-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white">
                            IsaArtTattoo
                        </span>
                        <h2 className="text-3xl font-semibold">Accede a tu cuenta</h2>
                        <p className="text-sm text-slate-100/90">
                            Gestiona tus órdenes, guarda tus diseños favoritos y mantente al día con las últimas piezas.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-100/90">
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300"></span>
                                Sincroniza tu carrito en todos tus dispositivos.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300"></span>
                                Soporte directo del estudio para resolver dudas.
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2 rounded-full bg-slate-900/60 p-1 text-sm ring-1 ring-white/10">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className={`rounded-full px-4 py-2 transition ${activeTab === "login"
                                        ? "bg-white text-slate-900"
                                        : "text-slate-200 hover:text-white"
                                    }`}
                            >
                                Iniciar sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("register")}
                                className={`rounded-full px-4 py-2 transition ${activeTab === "register"
                                        ? "bg-white text-slate-900"
                                        : "text-slate-200 hover:text-white"
                                    }`}
                            >
                                Registrarse
                            </button>
                        </div>
                        <span className="rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-slate-900">
                            Bienvenido
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-white">
                            {activeTab === "login" ? "Hola de nuevo" : "Crea tu cuenta"}
                        </h1>
                        <p className="text-sm text-slate-300">
                            Accede para seguir tus pedidos y guardar tus favoritos.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="grid gap-2 text-sm text-slate-200">
                            <span className="font-medium">Correo electrónico</span>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                                placeholder="nombre@correo.com"
                            />
                        </label>

                        <label className="grid gap-2 text-sm text-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Contraseña</span>
                                {activeTab === "login" && (
                                    <Link
                                        to="/reset-password"
                                        className="text-xs text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                                    >
                                        ¿Has olvidado tu contraseña?
                                    </Link>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
                                placeholder="••••••••"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={busy}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg transition disabled:opacity-70"
                        >
                            {busy
                                ? "Procesando..."
                                : activeTab === "login"
                                    ? "Entrar"
                                    : "Crear cuenta"}
                        </button>
                    </form>

                    {mode === "awaiting-confirmation" && (
                        <div className="space-y-3 rounded-2xl border border-cyan-400/40 bg-cyan-500/5 p-4 text-sm text-slate-100">
                            <p className="font-semibold text-white">Confirma tu correo</p>
                            <p>
                                Te hemos enviado un enlace de confirmación. Si no lo encuentras, revisa tu carpeta de spam.
                            </p>
                            <button
                                type="button"
                                onClick={resendConfirm}
                                disabled={busy || !email}
                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-60"
                            >
                                Reenviar confirmación
                            </button>
                        </div>
                    )}

                    {(message || errorMessage) && (
                        <div className="space-y-2 text-sm">
                            {message && (
                                <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">
                                    {message}
                                </div>
                            )}
                            {errorMessage && (
                                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-100">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-center text-sm text-slate-300">
                        {activeTab === "login"
                            ? "¿No tienes cuenta?"
                            : "¿Ya tienes una cuenta?"}{" "}
                        <button
                            type="button"
                            onClick={() => setMode(activeTab === "login" ? "register" : "login")}
                            className="font-semibold text-cyan-200 hover:text-cyan-100"
                        >
                            {activeTab === "login" ? "Crear una cuenta" : "Iniciar sesión"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
