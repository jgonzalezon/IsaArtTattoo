import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "../api/shop";
import { fetchProductById } from "../api/shop";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                if (!id) return;
                const res = await fetchProductById(id);
                setProduct(res);
            } catch (err: any) {
                setError(err.message || "No se pudo cargar el producto");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) return <p className="text-slate-200">Cargando producto...</p>;
    if (error)
        return (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
            </div>
        );
    if (!product) return <p className="text-slate-300">Producto no encontrado.</p>;

    const handleAddToCart = () => {
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
        navigate("/cart");
    };

    const heroImage = product.imageUrl || product.images?.[0]?.url;

    return (
        <div className="grid gap-8 md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-4">
                {heroImage ? (
                    <img
                        src={heroImage}
                        alt={product.name}
                        className="w-full rounded-2xl object-cover"
                    />
                ) : (
                    <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-900/50 text-slate-400">
                        Sin imagen disponible
                    </div>
                )}
                {(product.images?.length ?? 0) > 1 && (
                    <div className="flex flex-wrap gap-3">
                        {product.images?.map((image) => (
                            <img
                                key={image.id}
                                src={image.url}
                                alt={image.altText ?? product.name}
                                className="h-20 w-24 rounded-lg object-cover ring-1 ring-white/10"
                            />
                        ))}
                    </div>
                )}
                {(product.tags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-cyan-200">
                        {product.tags?.map((tag) => (
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
            <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-lg">
                <p className="text-sm uppercase tracking-wide text-cyan-300">Detalles</p>
                <h2 className="text-3xl font-semibold text-white">{product.name}</h2>
                {product.categoryName && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-fuchsia-200">
                        {product.categoryName}
                    </span>
                )}
                <p className="text-slate-200">
                    {product.description || "Pieza única personalizada."}
                </p>
                <p className="text-3xl font-bold text-cyan-300">
                    {product.price.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                    })}
                </p>
                {typeof product.stock === "number" && (
                    <p className="text-sm text-emerald-200">Stock: {product.stock}</p>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={handleAddToCart}
                        className="rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-semibold text-slate-900"
                    >
                        Añadir al carrito
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-white/10 px-4 py-3 text-slate-100 hover:bg-white/10"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}
