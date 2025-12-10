import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import StoreLayout from "../components/StoreLayout";
import type { Product } from "../api/shop";
import { fetchProducts } from "../api/shop";

export default function HomePage() {
    const [featured, setFeatured] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        const loadFeatured = async () => {
            try {
                const products = await fetchProducts();
                setFeatured(products.slice(0, 3));
            } catch (err: any) {
                setError(err.message || "No se pudo cargar el catálogo destacado");
            } finally {
                setLoading(false);
            }
        };

        loadFeatured();
    }, []);

    const showAdminPanel = isAuthenticated && isAdmin;

    const stats = useMemo(
        () => [
            { label: "Clientes felices", value: "+500" },
            { label: "Estilos únicos", value: "12" },
            { label: "Años creando", value: "8" },
        ],
        []
    );

    return (
        <StoreLayout
            title="IsaArtTattoo Studio"
            description="Arte permanente con experiencias guiadas y piezas exclusivas."
        >
            <div className="grid gap-12">
                <section className="grid items-center gap-10 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
                            <span className="h-2 w-2 rounded-full bg-fuchsia-400"></span>
                            Nuevo catálogo 2025
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                                Diseños listos para agendar o personalizar
                            </h2>
                            <p className="text-lg text-slate-200">
                                Explora flashes curados, reserva tu sesión y sigue tus órdenes desde un mismo lugar. Somos un estudio boutique con enfoque en trazos finos y color.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-fuchsia-500/20 transition hover:shadow-cyan-400/30"
                            >
                                Ver catálogo
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                            >
                                Iniciar sesión
                            </Link>
                            {showAdminPanel && (
                                <Link
                                    to="/admin"
                                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-400/10 px-5 py-3 text-base font-semibold text-cyan-100 transition hover:border-cyan-300 hover:text-white"
                                >
                                    Panel de administración
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-center">
                            {stats.map((stat) => (
                                <div key={stat.label} className="space-y-1">
                                    <p className="text-2xl font-semibold text-cyan-300">{stat.value}</p>
                                    <p className="text-xs uppercase tracking-wide text-slate-300">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-tr from-cyan-500/20 via-fuchsia-500/20 to-indigo-500/20 blur-3xl"></div>
                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/60 shadow-2xl">
                            <div className="flex h-full flex-col gap-6 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                                            Agenda guiada
                                        </p>
                                        <h3 className="text-2xl font-semibold text-white">Tu idea, nuestro trazo</h3>
                                    </div>
                                    <span className="rounded-full bg-fuchsia-400/20 px-3 py-1 text-xs font-semibold text-fuchsia-100">
                                        Segura
                                    </span>
                                </div>

                                <p className="text-sm text-slate-200">
                                    Reserva online, confirma disponibilidad y recibe recordatorios automáticos. También puedes seguir tus órdenes y pagos desde el panel de cliente.
                                </p>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs text-slate-300">Paso 1</p>
                                        <p className="text-base font-semibold text-white">Elige un flash</p>
                                        <p className="text-sm text-slate-300">Explora piezas listas para tatuar o personaliza colores.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs text-slate-300">Paso 2</p>
                                        <p className="text-base font-semibold text-white">Reserva</p>
                                        <p className="text-sm text-slate-300">Selecciona fecha, paga la seña y recibe confirmación inmediata.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs text-slate-300">Paso 3</p>
                                        <p className="text-base font-semibold text-white">Disfruta</p>
                                        <p className="text-sm text-slate-300">Llega al estudio y vive una sesión acompañada y segura.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Destacados</p>
                            <h3 className="text-2xl font-semibold text-white">Piezas listas para agendar</h3>
                            <p className="text-sm text-slate-300">Seleccionamos algunos diseños recientes para inspirarte.</p>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                        >
                            Ver catálogo completo →
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading && (
                            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
                                Cargando piezas destacadas...
                            </div>
                        )}

                        {error && (
                            <div className="col-span-full rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                                {error}
                            </div>
                        )}

                        {!loading && !error && featured.length === 0 && (
                            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
                                Aún no hay productos disponibles. Revisa más tarde.
                            </div>
                        )}

                        {featured.map((product) => (
                            <article
                                key={product.id}
                                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-5 shadow-lg"
                            >
                                {product.imageUrl && (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-40 w-full rounded-xl object-cover"
                                    />
                                )}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                                            Flash
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 line-clamp-3">
                                        {product.description || "Pieza única disponible para tu próxima sesión."}
                                    </p>
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-xs text-cyan-200">
                                            {product.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-200"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-semibold text-cyan-300">
                                        {product.price.toLocaleString("es-ES", {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </p>
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-900"
                                    >
                                        Ver detalle
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </StoreLayout>
    );
}
