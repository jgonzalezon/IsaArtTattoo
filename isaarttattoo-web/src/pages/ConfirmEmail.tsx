// src/pages/ConfirmEmail.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmEmail } from "../api/auth";

type Status = "loading" | "success" | "error";

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("Confirmando correo...");

    useEffect(() => {
        const email = searchParams.get("email");
        const token = searchParams.get("token");

        console.log("ConfirmEmailPage params:", { email, token });

        if (!email || !token) {
            setStatus("error");
            setMessage("Faltan parámetros en el enlace de confirmación.");
            return;
        }

        (async () => {
            try {
                const res = await confirmEmail(email, token);
                console.log("confirmEmail response:", res);
                setStatus("success");
                setMessage(res || "Correo confirmado correctamente.");
            } catch (err: any) {
                console.error("confirmEmail error:", err);
                setStatus("error");
                setMessage(err.message ?? "No se ha podido confirmar el correo.");
            }
        })();
    }, [searchParams]);

    const handleGoLogin = () => navigate("/login");

    return (
        <div style={{ maxWidth: 420, margin: "3rem auto", textAlign: "center" }}>
            <h1>Confirmación de correo</h1>
            <p
                style={{
                    marginTop: "1rem",
                    color: status === "error" ? "crimson" : "inherit",
                }}
            >
                {message}
            </p>

            {status === "loading" && <p>Por favor, espera...</p>}

            {status === "success" && (
                <button
                    onClick={handleGoLogin}
                    style={{ marginTop: "1.5rem", padding: "0.5rem 1.5rem" }}
                >
                    Ir al login
                </button>
            )}
        </div>
    );
}
