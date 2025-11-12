import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/reset-password", { email, token, newPassword: pwd });
      setMsg("Contraseña restablecida. Ya puedes iniciar sesión.");
    } catch {
      setMsg("No se pudo restablecer la contraseña.");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Reset Password</h2>
      <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Nueva contraseña" />
      <button>Cambiar</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
