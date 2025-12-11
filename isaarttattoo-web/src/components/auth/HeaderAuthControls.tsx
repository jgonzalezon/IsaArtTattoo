import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

type HeaderTone = "dark" | "light";

interface HeaderAuthControlsProps {
    cartCount?: number;
    tone?: HeaderTone;
}

export default function HeaderAuthControls({ cartCount = 0, tone = "dark" }: HeaderAuthControlsProps) {
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const isLight = tone === "light";

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav
            className={`grid w-full gap-2 text-sm md:auto-cols-max md:grid-flow-col md:items-center md:justify-end ${
                isLight ? "text-neutral-900" : "text-stone-100"
            }`}
        >
            <Link
                to="/"
                className={`rounded-xl px-3 py-2 text-center font-semibold transition ${
                    isLight
                        ? "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-100"
                        : "border border-blue-900/50 bg-neutral-900/70 text-blue-100 shadow-sm shadow-black/30 hover:border-blue-700 hover:bg-neutral-800"
                }`}
            >
                Inicio
            </Link>
            <Link
                to="/products"
                className="col-span-full w-full rounded-xl bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.18em] text-blue-50 shadow-lg shadow-blue-900/40 transition hover:shadow-blue-800/50"
            >
                Catálogo
            </Link>
            <Link
                to="/cart"
                className={`rounded-xl px-3 py-2 text-center text-sm font-medium transition ${
                    isLight
                        ? "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-100"
                        : "border border-blue-900/40 bg-neutral-900/60 text-blue-100 shadow-sm shadow-black/30 hover:border-blue-800"
                }`}
            >
                Carrito {cartCount ? `(${cartCount})` : ""}
            </Link>
            <Link
                to="/orders"
                className={`rounded-xl px-3 py-2 text-center text-sm font-medium transition ${
                    isLight
                        ? "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-100"
                        : "border border-blue-900/40 bg-neutral-900/60 text-blue-100 shadow-sm shadow-black/30 hover:border-blue-800"
                }`}
            >
                Órdenes
            </Link>
            {isAuthenticated && isAdmin && (
                <Link
                    to="/admin"
                    className={`rounded-xl px-3 py-2 text-center font-semibold transition ${
                        isLight
                            ? "border border-blue-200 bg-blue-50 text-blue-800 shadow-sm hover:bg-blue-100"
                            : "border border-blue-700/50 bg-blue-900/40 text-blue-100 shadow-sm shadow-black/40 hover:bg-blue-900/60"
                    }`}
                >
                    Administración
                </Link>
            )}
            {isAuthenticated ? (
                <button
                    onClick={handleLogout}
                    className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-3 py-2 text-center font-semibold text-blue-50 shadow-lg shadow-blue-900/50 transition hover:from-blue-600 hover:to-blue-500"
                >
                    Cerrar sesión
                </button>
            ) : (
                <Link
                    to="/register"
                    className={`rounded-xl px-3 py-2 text-center font-semibold transition ${
                        isLight
                            ? "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-100"
                            : "border border-blue-900/50 bg-neutral-900/70 text-blue-100 shadow-sm shadow-black/30 hover:border-blue-700 hover:bg-neutral-800"
                    }`}
                >
                    Registrarse
                </Link>
            )}
        </nav>
    );
}
