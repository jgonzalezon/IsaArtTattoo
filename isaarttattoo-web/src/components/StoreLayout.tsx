import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../context/CartContext";

interface Props {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function StoreLayout({ title, description, children }: Props) {
    const { isAuthenticated, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const categories = [
        { label: "Tatuajes", value: "tatuajes" },
        { label: "Camisetas", value: "camisetas" },
        { label: "Tazas", value: "tazas" },
        { label: "Merch", value: "merch" },
    ];

    const handleCategorySelect = (value: string) => {
        if (!value) return;
        navigate(`/products?category=${value}`);
    };

    return (
        <div className="py-10">
            <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
                <div className="flex w-full flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-cyan-300">IsaArtTattoo</p>
                        <h1 className="text-2xl font-semibold text-white">{title}</h1>
                        {description && (
                            <p className="text-sm text-slate-300">{description}</p>
                        )}
                    </div>
                    <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
                        <Link
                            to="/"
                            className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/products"
                            className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        >
                            Catálogo
                        </Link>
                        <Link
                            to="/cart"
                            className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        >
                            Carrito ({totalItems})
                        </Link>
                        <Link
                            to="/orders"
                            className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        >
                            Órdenes
                        </Link>
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    logout();
                                    navigate("/login");
                                }}
                                className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1.5 text-slate-900"
                            >
                                Cerrar sesión
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1.5 text-slate-900"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </nav>
                </div>
                <div className="w-full">
                    <div className="hidden flex-wrap items-center gap-2 text-sm text-slate-100 md:flex">
                        {categories.map((category) => (
                            <Link
                                key={category.value}
                                to={`/products?category=${category.value}`}
                                className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/10"
                            >
                                {category.label}
                            </Link>
                        ))}
                    </div>
                    <div className="md:hidden">
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-cyan-300">
                            Categorías
                        </label>
                        <select
                            onChange={(event) => handleCategorySelect(event.target.value)}
                            defaultValue=""
                            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white"
                        >
                            <option value="" disabled>
                                Selecciona una categoría
                            </option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value} className="bg-slate-900">
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
                {children}
            </div>
        </div>
    );
}
