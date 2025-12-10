import { useAuth } from "../auth/AuthContext";

export default function Me() {
  const { token, isAuthenticated, logout } = useAuth();
  return (
    <div>
      <h2>Perfil</h2>
      <p>{isAuthenticated ? "Sesión activa" : "No has iniciado sesión"}</p>
      {token && <pre>{token}</pre>}
      <button onClick={logout}>Salir</button>
    </div>
  );
}
