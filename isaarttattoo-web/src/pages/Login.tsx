import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

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
        } catch (err: any) {
            setError(err.message ?? "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: "40px auto" }}>
            <h2>Login</h2>

            <input
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
        </form>
    );
}
