import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("test@isaarttattoo.com");
    const [password, setPassword] = useState("Prueba123!");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login({ email, password });
            navigate("/products");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Error al iniciar sesión");
            } else {
                setError("Error al iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 px-4 py-12 text-neutral-900">
            <div className="mx-auto w-full max-w-md space-y-8 rounded-3xl border border-neutral-200 bg-white px-8 py-10 shadow-xl shadow-blue-100/40">
                <div className="space-y-2 text-center">
                    <p className="text-xs uppercase tracking-[0.28em] text-blue-700">IsaArtTattoo</p>
                    <h1 className="text-2xl font-semibold text-neutral-900">Iniciar sesión</h1>
                    <p className="text-sm text-neutral-600">Accede para gestionar tus pedidos y reservas.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="grid gap-2 text-sm font-medium text-neutral-800">
                        <span>Email</span>
                        <input
                            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-neutral-800">
                        <span>Contraseña</span>
                        <input
                            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    {error && <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{error}</p>}

                    <button
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="text-center text-sm text-neutral-700">
                    ¿No tienes cuenta? {" "}
                    <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </div>
    );
}
