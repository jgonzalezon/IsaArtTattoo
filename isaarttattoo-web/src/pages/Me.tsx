import { useAuth } from "../auth/AuthContext";

export default function Me() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Perfil</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Salir</button>
    </div>
  );
}
