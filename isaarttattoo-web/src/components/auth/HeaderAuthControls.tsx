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
                Carrito {cartCount ? `(${cartCount})` : ""}
            </Link>
            <Link
                to="/orders"
                className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
            >
                Órdenes
            </Link>
            {isAuthenticated && isAdmin && (
                <Link
                    to="/admin"
                    className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 font-semibold text-cyan-100 hover:bg-cyan-400/20"
                >
                    Administración
                </Link>
            )}
            {isAuthenticated ? (
                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1.5 text-slate-900"
                >
                    Cerrar sesión
                </button>
            ) : (
                <>
                    <Link
                        to="/login"
                        className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/10"
                    >
                        Iniciar sesión
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1.5 text-slate-900"
                    >
                        Registrarse
                    </Link>
                </>
            )}
        </nav>
    );
}
