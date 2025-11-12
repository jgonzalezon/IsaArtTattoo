import { useState } from "react";
import api from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setMsg("Te hemos enviado instrucciones por email.");
    } catch {
      setMsg("Error al solicitar el reset.");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Olvidé mi contraseña</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <button>Enviar</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
