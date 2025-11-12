import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await login(email, password);
      setMsg("¡Login correcto!");
    } catch (err: any) {
      setMsg(err?.response?.data ?? "Error de login");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button>Entrar</button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
