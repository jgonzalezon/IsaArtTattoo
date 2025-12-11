import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/logo-isasart.svg";
import artistPortrait from "../assets/artist-isa.svg";
import flameTattoo from "../assets/tattoo-flame.svg";
import skullTattoo from "../assets/tattoo-skull.svg";

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
            { label: "Diseños entregados", value: "+480" },
            { label: "Objetos intervenidos", value: "+260" },
            { label: "Años ilustrando", value: "8" },
        ],
        []
    );

    return (
        <StoreLayout
            title="IsaArtTattoo Studio"
            description="Diseños ilustrados por Isa para llevar en objetos, merch y láminas."
        >
            <div className="grid gap-12">
                <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
                            <span className="h-2 w-2 rounded-full bg-fuchsia-400"></span>
                            Nueva colección sobre objetos
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                                Arte de Isa listo para llevar en tazas, prints y sudaderas
                            </h2>
                            <p className="text-lg text-slate-200">
                                Cada diseño nace en su libreta y viaja a piezas coleccionables. Compra ilustraciones originales en distintos formatos. Muy pronto podrás reservar citas, pero por ahora céntrate en el arte.
                            </p>
                        </div>

                        <div className="space-y-3 sm:max-w-lg">
                            <Link
                                to="/products"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-fuchsia-500/20 transition hover:shadow-cyan-400/30"
                            >
                                Ver catálogo
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                            >
                                Iniciar sesión
                            </Link>
                        </div>

                        {showAdminPanel && (
                            <Link
                                to="/admin"
                                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-400/10 px-5 py-3 text-base font-semibold text-cyan-100 transition hover:border-cyan-300 hover:text-white"
                            >
                                Panel de administración
                            </Link>
                        )}

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
                                <div className="flex items-center gap-3">
                                    <img src={logo} alt="IsaArtTattoo" className="h-14 w-14 rounded-2xl border border-white/10 bg-white/5 p-1" />
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Hecho a mano</p>
                                        <h3 className="text-2xl font-semibold text-white">Ilustración aplicada a objetos</h3>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-200">
                                    Selecciona tu diseño favorito y recíbelo en el formato que más amas: lámina firmada, taza, sudadera o vinilo. Cada pieza se produce en tiradas cortas.
                                </p>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-lg font-semibold text-cyan-200">01</span>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Elige el arte</p>
                                            <p className="text-xs text-slate-300">Flashes exclusivos de Isa, curados por temporada.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/10 text-lg font-semibold text-fuchsia-100">02</span>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Elige el soporte</p>
                                            <p className="text-xs text-slate-300">Tazas, prints, poleras o stickers listos para envío.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Destacados</p>
                                <h3 className="text-2xl font-semibold text-white">Piezas listas para comprar</h3>
                                <p className="text-sm text-slate-300">Seleccionamos algunos diseños recientes para inspirarte.</p>
                            </div>
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                            >
                                Ver catálogo completo →
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
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
                                            className="h-44 w-full rounded-xl object-cover"
                                        />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <h4 className="text-lg font-semibold text-white">{product.name}</h4>
                                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                                                Serie limitada
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 line-clamp-3">
                                            {product.description || "Ilustración exclusiva lista para enviarse en tu formato favorito."}
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
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg">
                            <img src={artistPortrait} alt="Isa dibujando" className="w-full rounded-xl border border-white/10 bg-white/5" />
                            <div className="space-y-2 pt-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">La artista</p>
                                <h3 className="text-xl font-semibold text-white">Isa, ilustradora y tatuadora</h3>
                                <p className="text-sm text-slate-300">
                                    Trazo fino, color vibrante y personajes llenos de actitud. Cada pieza nace en su estudio y se produce localmente para que la lleves contigo.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg">
                            <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                                <img src={flameTattoo} alt="Tatuaje de mano con fuego" className="w-full rounded-lg border border-white/5" />
                                <p className="text-sm font-semibold text-white">Fuego y espinas</p>
                                <p className="text-xs text-slate-300">Líneas atrevidas listas para llevar a tus objetos.</p>
                            </div>
                            <div className="space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                                <img src={skullTattoo} alt="Tatuaje calavera bailarina" className="w-full rounded-lg border border-white/5" />
                                <p className="text-sm font-semibold text-white">Personajes rebeldes</p>
                                <p className="text-xs text-slate-300">Ilustraciones flexibles para prints, stickers o textiles.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </StoreLayout>
    );
}
