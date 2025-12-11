import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category, Product } from "../api/shop";
import { fetchCategories, fetchProducts } from "../api/shop";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTag, setActiveTag] = useState<string>("Todos");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [productList, catalogCategories] = await Promise.all([
                    fetchProducts(),
                    fetchCategories(),
                ]);
                setProducts(productList);
                setCategories(catalogCategories);
            } catch (err: unknown) {
                console.error(err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("No se pudo actualizar la categoría");
                }
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return <p className="text-slate-200">Cargando catálogo...</p>;
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
            </div>
        );
    }

    if (products.length === 0) {
        return <p className="text-slate-300">Aún no hay productos disponibles.</p>;
    }

    const normalize = (value: string) => value.trim().toLowerCase();

    const filterByTag = (items: Product[], tag: string) => {
        if (tag === "Todos") return items;

        const normalized = normalize(tag);
        return items.filter(
            (product) =>
                product.tags?.some((t) => normalize(t).includes(normalized)) ||
                normalize(product.name).includes(normalized)
        );
    };

    const derivedTags = Array.from(
        new Set(products.flatMap((p) => p.tags ?? []))
    );
    const categoryFilters = categories.map((c) => c.name);
    const filters = [
        "Todos",
        ...(categoryFilters.length > 0 ? categoryFilters : derivedTags),
    ];

    const filteredProducts = filterByTag(products, activeTag);

    const handleAddToCart = (product: Product) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
        });
    };

    const featuredSections = [
        {
            title: "Tatuajes personalizados",
            tag: "tatuajes",
            description: "Diseños únicos hechos a medida para tu piel.",
        },
        {
            title: "Camisetas",
            tag: "camiseta",
            description: "Textiles cómodos con arte original.",
        },
        {
            title: "Tazas",
            tag: "taza",
            description: "Colecciona tus ilustraciones favoritas en cerámica.",
        },
    ];

    const renderProductCard = (product: Product) => {
        const categoryLabel = product.categoryName || product.tags?.[0];
        const stockLabel =
            product.stock === 0
                ? "Agotado"
                : product.stock
                  ? `Stock: ${product.stock}`
                  : "Disponible";

        return (
            <article
                key={product.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 shadow-lg"
            >
                {product.imageUrl && (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-40 w-full rounded-xl object-cover"
                    />
                )}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                        <p className="text-sm text-slate-300 line-clamp-3">
                            {product.description || "Pieza única"}
                        </p>
                        {product.tags && (
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-cyan-200">
                                {product.tags.map((tag) => (
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
                    <div className="flex flex-col items-end gap-2 text-xs font-medium">
                        {categoryLabel && (
                            <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-fuchsia-200">
                                {categoryLabel}
                            </span>
                        )}
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-200">
                            {stockLabel}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-cyan-300">
                        {product.price.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                        >
                            Ver más
                        </button>
                        <button
                            onClick={() => handleAddToCart(product)}
                            className="rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1.5 text-sm font-semibold text-slate-900"
                        >
                            Añadir
                        </button>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
                {filters.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            activeTag === tag
                                ? "bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/30"
                                : "border border-white/10 text-white hover:bg-white/10"
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => renderProductCard(product))}
            </div>

            <div className="space-y-6">
                {featuredSections.map((section) => {
                    const sectionProducts = filterByTag(products, section.tag).slice(0, 3);
                    if (sectionProducts.length === 0) return null;

                    return (
                        <section
                            key={section.title}
                            className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-900/30 to-slate-900/60 p-4 shadow-xl"
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-cyan-200/80">Destacado</p>
                                    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                                    <p className="text-sm text-slate-300">{section.description}</p>
                                </div>
                                <button
                                    onClick={() => setActiveTag(section.tag)}
                                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                                >
                                    Ver más
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {sectionProducts.map((product) => renderProductCard(product))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
