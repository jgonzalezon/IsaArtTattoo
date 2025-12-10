import type { ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthCard from "./components/AuthCard";
import ConfirmEmailPage from "./pages/ConfirmEmail";
import ResetPasswordPage from "./pages/ResetPassword";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import RequireAdmin from "./auth/RequireAdmin";
import CatalogPage from "./pages/CatalogPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminCatalogPage from "./pages/AdminCatalogPage";

type AuthLayoutProps = {
    children: ReactNode;
};

function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="grid min-h-dvh place-items-center">
            <div className="w-full max-w-md">{children}</div>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <div className="relative min-h-dvh overflow-hidden bg-slate-950 text-slate-100">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(56,189,248,.25),rgba(2,6,23,0))]"></div>
                    <div className="absolute -top-1/3 left-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-gradient-to-tr from-fuchsia-500/30 via-cyan-400/30 to-indigo-400/30 blur-3xl animate-pulse"></div>

                    <div className="relative z-10 mx-auto min-h-dvh max-w-7xl px-4">
                        <Routes>
                            <Route path="/" element={<HomePage />} />

                            <Route
                                path="/login"
                                element={
                                    <AuthLayout>
                                        <AuthCard />
                                    </AuthLayout>
                                }
                            />

                            <Route
                                path="/register"
                                element={
                                    <AuthLayout>
                                        <AuthCard initialMode="register" />
                                    </AuthLayout>
                                }
                            />

                            <Route
                                path="/confirm-email"
                                element={
                                    <AuthLayout>
                                        <ConfirmEmailPage />
                                    </AuthLayout>
                                }
                            />

                            <Route
                                path="/reset-password"
                                element={
                                    <AuthLayout>
                                        <ResetPasswordPage />
                                    </AuthLayout>
                                }
                            />

                            <Route path="/products" element={<CatalogPage />} />
                            <Route
                                path="/products/:id"
                                element={<ProductDetailPage />}
                            />

                            <Route
                                path="/cart"
                                element={
                                    <ProtectedRoute>
                                        <CartPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/checkout"
                                element={
                                    <ProtectedRoute>
                                        <CheckoutPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute>
                                        <OrdersPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route element={<RequireAdmin />}>
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                                <Route path="/admin/catalog" element={<AdminCatalogPage />} />
                                <Route path="/admin/identity" element={<AdminUsersPage />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </CartProvider>
        </AuthProvider>
    );
}
