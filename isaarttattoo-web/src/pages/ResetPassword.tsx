// src/pages/ResetPassword.tsx
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        const tokenParam = searchParams.get("token");

        setEmail(emailParam);
        setToken(tokenParam);

        if (!emailParam || !tokenParam) {
            setError("Faltan parámetros en el enlace de restablecimiento.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!email || !token) {
            setError("Enlace no válido.");
            return;
        }

        if (!newPassword || newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword({
                email,
                token,
                newPassword,
            });

            const text = typeof res === "string" ? res : res.message ?? "Contraseña restablecida correctamente.";
            setMessage(text);

            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setError(err.message ?? "No se ha podido restablecer la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: "3rem auto" }}>
            <h1>Restablecer contraseña</h1>

            {error && (
                <p style={{ color: "crimson", marginTop: "0.75rem" }}>{error}</p>
            )}

            {message && (
                <p style={{ color: "green", marginTop: "0.75rem" }}>{message}</p>
            )}

            {!message && (
                <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.25rem" }}>
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.25rem" }}>
                            Repite la contraseña
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !token}
                        style={{ width: "100%", padding: "0.5rem" }}
                    >
                        {loading ? "Guardando..." : "Guardar nueva contraseña"}
                    </button>
                </form>
            )}
        </div>
    );
}
