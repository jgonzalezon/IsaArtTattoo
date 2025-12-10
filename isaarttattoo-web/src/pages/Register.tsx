import type { FormEvent } from "react";
import { useState } from "react";
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
    <form onSubmit={onSubmit}>
      <h2>Registro</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button>Crear cuenta</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
