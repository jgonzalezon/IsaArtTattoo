import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";

export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const [msg, setMsg] = useState("Confirmando...");

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) { setMsg("Parámetros inválidos"); return; }

    api.get("/api/auth/confirm", { params: { email, token } })
      .then(() => setMsg("Correo confirmado. Ya puedes iniciar sesión."))
      .catch(() => setMsg("Token inválido o expirado."));
  }, []);

  return <p>{msg}</p>;
}
