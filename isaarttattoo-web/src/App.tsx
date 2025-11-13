import { useEffect, useState } from "react";
import AuthCard from "./components/AuthCard";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ConfirmEmailPage from "./pages/ConfirmEmail";
import ResetPasswordPage from "./pages/ResetPassword";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* 🔹 ESTA es la ruta del enlace del correo */}
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />

                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;