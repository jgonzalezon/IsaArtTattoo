import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { register as registerApi } from "../api/auth";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMsg(null);
        try {
            await registerApi({ email, password });
            setMsg("Usuario creado. Revisa tu email para confirmar la cuenta.");
        } catch (err: any) {
            setMsg(err?.message ?? "Error en registro");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 px-4 py-12 text-neutral-900">
            <div className="mx-auto w-full max-w-md space-y-8 rounded-3xl border border-neutral-200 bg-white px-8 py-10 shadow-xl shadow-blue-100/40">
                <div className="space-y-2 text-center">
                    <p className="text-xs uppercase tracking-[0.28em] text-blue-700">IsaArtTattoo</p>
                    <h1 className="text-2xl font-semibold text-neutral-900">Crear cuenta</h1>
                    <p className="text-sm text-neutral-600">Regístrate para guardar tus compras y reservas.</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                    <label className="grid gap-2 text-sm font-medium text-neutral-800">
                        <span>Email</span>
                        <input
                            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-neutral-800">
                        <span>Contraseña</span>
                        <input
                            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    {msg && (
                        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{msg}</p>
                    )}

                    <button className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800">
                        Crear cuenta
                    </button>
                </form>

                <p className="text-center text-sm text-neutral-700">
                    ¿Ya tienes cuenta? {" "}
                    <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
