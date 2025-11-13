// src/auth/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { login as loginApi, LoginRequest, LoginResponse } from "../api/auth";

interface AuthState {
    token: string | null;
    // puedes guardar también email, roles, etc.
}

interface AuthContextValue extends AuthState {
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    const login = async (data: LoginRequest) => {
        const res: LoginResponse = await loginApi(data);

        // Aquí asumimos que la API devuelve { token: "..." }
        setToken(res.token);

        // Si quieres persistirlo:
        // localStorage.setItem("token", res.token);
    };

    const logout = () => {
        setToken(null);
        // localStorage.removeItem("token");
    };

    const value: AuthContextValue = {
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
