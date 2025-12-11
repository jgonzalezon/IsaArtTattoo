import { useEffect, useState } from "react";
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

    return (
        <StoreLayout
            title="Colección IsaArtTattoo"
            description="Diseños artísticos aplicables a piel, papel o textil con sello boutique."
        >
            <div className="grid gap-12">
                <section className="grid items-center gap-10 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-900/40 bg-rose-900/30 px-4 py-2 text-xs uppercase tracking-[0.25em] text-rose-100 shadow-inner shadow-black/30">
                            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                            Diseños listos 2025
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-semibold leading-tight text-rose-50 md:text-5xl">
                                Piezas ilustradas para imprimir, vestir o tatuar
                            </h2>
                            <p className="text-lg text-stone-200">
                                Láminas para enmarcar, prints de edición limitada, sudaderas bordadas y flashes preparados para tu piel. Todo el arte delicado y vibrante de Isa en un mismo lugar.
                            </p>
                        </div>

                        <div className="grid w-full gap-3 sm:max-w-md">
                            <Link
                                to="/products"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 px-6 py-4 text-base font-semibold uppercase tracking-[0.18em] text-rose-50 shadow-lg shadow-rose-900/40 transition hover:shadow-rose-800/60"
                            >
                                Ver catálogo
                            </Link>
                            {showAdminPanel && (
                                <Link
                                    to="/admin"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-800/60 bg-rose-950/40 px-5 py-3 text-base font-semibold text-rose-100 transition hover:border-rose-700"
                                >
                                    Panel de administración
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-tr from-rose-900/30 via-neutral-900 to-black blur-3xl"></div>
                        <div className="relative overflow-hidden rounded-[32px] border border-rose-900/40 bg-neutral-900/70 shadow-2xl shadow-rose-900/30">
                            <div className="flex h-full flex-col gap-6 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-rose-200">
                                            Reserva informativa
                                        </p>
                                        <h3 className="text-2xl font-semibold text-rose-50">Tu idea, nuestro trazo</h3>
                                    </div>
                                    <span className="rounded-full bg-rose-800/40 px-3 py-1 text-xs font-semibold text-rose-100">
                                        Boutique
                                    </span>
                                </div>

                                <p className="text-sm text-stone-200">
                                    Gestionamos las reservas de forma personalizada para asegurar que cada diseño encaje contigo y con el soporte que prefieras. Escríbenos y coordinaremos la mejor forma de producir tu pieza.
                                </p>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-rose-900/40 bg-neutral-900/70 p-4 shadow-inner shadow-black/30">
                                        <p className="text-xs text-stone-300">Paso 1</p>
                                        <p className="text-base font-semibold text-rose-50">Elige un diseño</p>
                                        <p className="text-sm text-stone-300">Ilustraciones pensadas para papel, textil o piel según tu gusto.</p>
                                    </div>
                                    <div className="rounded-2xl border border-rose-900/40 bg-neutral-900/70 p-4 shadow-inner shadow-black/30">
                                        <p className="text-xs text-stone-300">Paso 2</p>
                                        <p className="text-base font-semibold text-rose-50">Coordina la reserva</p>
                                        <p className="text-sm text-stone-300">Por ahora gestionamos todo por contacto directo para darte atención personalizada.</p>
                                    </div>
                                    <div className="rounded-2xl border border-rose-900/40 bg-neutral-900/70 p-4 shadow-inner shadow-black/30">
                                        <p className="text-xs text-stone-300">Paso 3</p>
                                        <p className="text-base font-semibold text-rose-50">Recibe tu pieza</p>
                                        <p className="text-sm text-stone-300">Preparamos tu print, prenda o cita de tatuaje con la misma dedicación.</p>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-rose-900/40 bg-rose-900/30 p-4 text-sm text-rose-50 shadow-inner shadow-black/30">
                                    <p className="font-semibold">Contacto para reservas y encargos</p>
                                    <p>Teléfono: +34 600 000 000</p>
                                    <p>Email: contacto@isasartstudio.com</p>
                                    <p className="text-stone-200/80">Atendemos de forma personalizada para que cada diseño llegue al soporte adecuado.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Destacados</p>
                            <h3 className="text-2xl font-semibold text-rose-50">Diseños listos para llevar</h3>
                            <p className="text-sm text-stone-300">Selección curada para imprimir, vestir o reservar en estudio.</p>
                        </div>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-100 hover:text-rose-50"
                        >
                            Ver catálogo completo →
                        </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading && (
                            <div className="col-span-full rounded-2xl border border-rose-900/40 bg-neutral-900/60 p-6 text-sm text-stone-200">
                                Cargando piezas destacadas...
                            </div>
                        )}

                        {error && (
                            <div className="col-span-full rounded-2xl border border-red-800/40 bg-red-900/30 p-4 text-sm text-rose-50">
                                {error}
                            </div>
                        )}

                        {!loading && !error && featured.length === 0 && (
                            <div className="col-span-full rounded-2xl border border-rose-900/40 bg-neutral-900/60 p-6 text-sm text-stone-200">
                                Aún no hay productos disponibles. Revisa más tarde.
                            </div>
                        )}

                        {featured.map((product) => (
                            <article
                                key={product.id}
                                className="flex flex-col gap-3 rounded-2xl border border-rose-900/40 bg-neutral-900/70 p-5 shadow-lg shadow-black/30"
                            >
                                {product.imageUrl && (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-40 w-full rounded-xl object-cover border border-rose-900/30"
                                    />
                                )}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-lg font-semibold text-rose-50">{product.name}</h4>
                                        <span className="rounded-full bg-rose-900/40 px-3 py-1 text-xs font-semibold text-rose-100">
                                            Diseño híbrido
                                        </span>
                                    </div>
                                    <p className="text-sm text-stone-300 line-clamp-3">
                                        {product.description || "Arte listo para transformar en print, prenda o cita de tatuaje."}
                                    </p>
                                    {product.tags && product.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-xs text-rose-100">
                                            {product.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-rose-900/40 px-2 py-1 text-rose-100"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-semibold text-rose-200">
                                        {product.price.toLocaleString("es-ES", {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </p>
                                    <Link
                                        to={`/products/${product.id}`}
                                        className="rounded-lg bg-gradient-to-r from-rose-900 via-rose-700 to-rose-600 px-4 py-2 text-sm font-semibold text-rose-50 shadow-lg shadow-rose-900/40"
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
