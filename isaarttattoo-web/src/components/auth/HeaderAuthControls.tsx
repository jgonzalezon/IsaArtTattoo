import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

interface HeaderAuthControlsProps {
    cartCount?: number;
}

export default function HeaderAuthControls({ cartCount = 0 }: HeaderAuthControlsProps) {
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="grid w-full gap-2 text-sm text-stone-100 md:auto-cols-max md:grid-flow-col md:items-center md:justify-end">
            <Link
                to="/"
                className="rounded-xl border border-rose-900/50 bg-neutral-900/70 px-3 py-2 text-center font-semibold tracking-wide text-rose-100 shadow-sm shadow-black/30 transition hover:border-rose-700 hover:bg-neutral-800"
            >
                Inicio
            </Link>
            <Link
                to="/products"
                className="col-span-full w-full rounded-xl bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.18em] text-rose-50 shadow-lg shadow-rose-900/40 transition hover:shadow-rose-800/50"
            >
                Catálogo
            </Link>
            <Link
                to="/cart"
                className="rounded-xl border border-rose-900/40 bg-neutral-900/60 px-3 py-2 text-center text-sm font-medium text-rose-100 shadow-sm shadow-black/30 transition hover:border-rose-800"
            >
                Carrito {cartCount ? `(${cartCount})` : ""}
            </Link>
            <Link
                to="/orders"
                className="rounded-xl border border-rose-900/40 bg-neutral-900/60 px-3 py-2 text-center text-sm font-medium text-rose-100 shadow-sm shadow-black/30 transition hover:border-rose-800"
            >
                Órdenes
            </Link>
            {isAuthenticated && isAdmin && (
                <Link
                    to="/admin"
                    className="rounded-xl border border-rose-700/50 bg-rose-900/40 px-3 py-2 text-center font-semibold text-rose-100 shadow-sm shadow-black/40 transition hover:bg-rose-900/60"
                >
                    Administración
                </Link>
            )}
            {isAuthenticated ? (
                <button
                    onClick={handleLogout}
                    className="rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 px-3 py-2 text-center font-semibold text-rose-50 shadow-lg shadow-rose-900/50 transition hover:from-rose-600 hover:to-rose-500"
                >
                    Cerrar sesión
                </button>
            ) : (
                <Link
                    to="/register"
                    className="rounded-xl border border-rose-900/50 bg-neutral-900/70 px-3 py-2 text-center font-semibold text-rose-100 shadow-sm shadow-black/30 transition hover:border-rose-700 hover:bg-neutral-800"
                >
                    Registrarse
                </Link>
            )}
        </nav>
    );
}
