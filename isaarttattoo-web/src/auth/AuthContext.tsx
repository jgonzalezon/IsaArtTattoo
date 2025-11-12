import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

type User = { name: string | null };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser({ name: data.user?.identity?.name ?? data.user?.name ?? null });
    } catch {
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    await refreshMe();
  };

  const register = async (email: string, password: string) => {
    await api.post("/api/auth/register", { email, password });
    // El correo de confirmación lo envía el backend
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    // Si hay token, intenta hidratar
    const t = localStorage.getItem("token");
    if (!t) { setLoading(false); return; }
    refreshMe().finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </Ctx.Provider>
  );
};
