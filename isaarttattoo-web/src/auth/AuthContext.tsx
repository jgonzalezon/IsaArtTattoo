// src/auth/AuthContext.tsx
import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi } from "../api/auth";
import type { LoginRequest, LoginResponse } from "../api/auth";


interface AuthState {
    token: string | null;
}

interface AuthContextValue extends AuthState {
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // opcional: hidratar desde localStorage
    useEffect(() => {
        const stored = localStorage.getItem("auth_token");
        if (stored) setToken(stored);
    }, []);

    const login = async (data: LoginRequest) => {
        const res: LoginResponse = await loginApi(data);
        setToken(res.token);
        localStorage.setItem("auth_token", res.token);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("auth_token");
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
