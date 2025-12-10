import type { FormEvent } from "react";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
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
