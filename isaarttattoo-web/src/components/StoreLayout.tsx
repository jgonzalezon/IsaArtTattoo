import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../context/CartContext";
import type { Category } from "../api/shop";
import { fetchCategories } from "../api/shop";

interface Props {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function StoreLayout({ title, description, children }: Props) {
    const { isAuthenticated, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState(false);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await fetchCategories();
                setCategories(response);
            } catch (error) {
                console.error("No se pudieron cargar las categorías", error);
                setCategoriesError(true);
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    const sortedCategories = useMemo(
        () =>
            [...categories].sort((a, b) => {
                const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
                if (orderA === orderB) {
                    return a.name.localeCompare(b.name);
                }
                return orderA - orderB;
            }),
        [categories]
    );

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
                                    navigate("/");
                                }}
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
                </div>
                <div className="w-full">
                    <div className="hidden flex-wrap items-center gap-2 text-sm text-slate-100 md:flex">
                        {categoriesLoading && (
                            <span className="text-sm text-slate-300">Cargando categorías...</span>
                        )}
                        {!categoriesLoading && categoriesError && (
                            <span className="text-sm text-slate-300">
                                No se han podido cargar las categorías
                            </span>
                        )}
                        {!categoriesLoading && !categoriesError && sortedCategories.length === 0 && (
                            <span className="text-sm text-slate-300">No hay categorías disponibles</span>
                        )}
                        {!categoriesLoading && !categoriesError &&
                            sortedCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/products?category=${category.name}`}
                                    className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/10"
                                >
                                    {category.name}
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
                            {categoriesLoading && (
                                <option value="" disabled className="bg-slate-900">
                                    Cargando categorías...
                                </option>
                            )}
                            {!categoriesLoading && categoriesError && (
                                <option value="" disabled className="bg-slate-900">
                                    No se han podido cargar las categorías
                                </option>
                            )}
                            {!categoriesLoading && !categoriesError &&
                                sortedCategories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.name}
                                        className="bg-slate-900"
                                    >
                                        {category.name}
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
