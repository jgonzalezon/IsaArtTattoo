import { useEffect, useState, ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthCard from "./components/AuthCard";
import ConfirmEmailPage from "./pages/ConfirmEmail";
import ResetPasswordPage from "./pages/ResetPassword";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import RequireAdmin from "./auth/RequireAdmin";

type AuthLayoutProps = {
    apiBase: string;
    children: ReactNode;
};

function AuthLayout({ apiBase, children }: AuthLayoutProps) {
    return (
        <div className="grid min-h-dvh place-items-center">
            <div className="w-full max-w-md">
                {children}
                <p className="mt-6 text-center text-sm text-slate-400">
                    API base:
                    <code className="text-slate-300">
                        {apiBase || "/api"}
                    </code>
                </p>
            </div>
        </div>
    );
}

export default function App() {
    const [apiBase, setApiBase] = useState<string>(
        import.meta.env.VITE_API_BASE_URL ?? ""
    );

    useEffect(() => {
        if (!apiBase) setApiBase("");
    }, [apiBase]);

    return (
        <div className="relative min-h-dvh overflow-hidden bg-slate-950 text-slate-100">

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(56,189,248,.25),rgba(2,6,23,0))]"></div>
            <div className="absolute -top-1/3 left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-gradient-to-tr from-fuchsia-500/30 via-cyan-400/30 to-indigo-400/30 blur-3xl animate-pulse"></div>

            <div className="relative z-10 mx-auto min-h-dvh max-w-7xl px-4">

                <Routes>
                    <Route
                        path="/"
                        element={
                            <AuthLayout apiBase={apiBase}>
                                <AuthCard apiBase={apiBase} />
                            </AuthLayout>
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <AuthLayout apiBase={apiBase}>
                                <AuthCard apiBase={apiBase} />
                            </AuthLayout>
                        }
                    />

                    <Route
                        path="/confirm-email"
                        element={
                            <AuthLayout apiBase={apiBase}>
                                <ConfirmEmailPage />
                            </AuthLayout>
                        }
                    />

                    <Route
                        path="/reset-password"
                        element={
                            <AuthLayout apiBase={apiBase}>
                                <ResetPasswordPage />
                            </AuthLayout>
                        }
                    />

                    <Route element={<RequireAdmin />}>
                        <Route
                            path="/admin/users"
                            element={<AdminUsersPage />}
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

            </div>
        </div>
    );
}
