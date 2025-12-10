import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../api/shop";
import { fetchProducts } from "../api/shop";
import { useCart } from "../context/CartContext";
import { useAuth } from "../auth/AuthContext";

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchProducts();
                setProducts(res);
            } catch (err: any) {
                setError(err.message || "No se pudo cargar el catálogo");
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

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
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
            ))}
        </div>
    );
}
