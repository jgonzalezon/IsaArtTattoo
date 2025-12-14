import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderSummary } from "../api/shop";
import { fetchOrders } from "../api/shop";
import { useAuth } from "../auth/AuthContext";

export default function OrderHistory() {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            if (!isAuthenticated) {
                navigate("/login");
                return;
            }
            try {
                // apiFetch incluye automáticamente el token JWT
                const res = await fetchOrders();
                setOrders(res);
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar las órdenes";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isAuthenticated, navigate]);

    if (loading) return <p className="text-slate-200">Cargando historial...</p>;
    if (error)
        return (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
            </div>
        );

    if (orders.length === 0) {
        return <p className="text-slate-300">Aún no has realizado pedidos.</p>;
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 p-4"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm uppercase tracking-wide text-cyan-300">
                                Pedido #{order.id}
                            </p>
                            <p className="text-lg font-semibold text-white">
                                {order.total.toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR",
                                })}
                            </p>
                            <p className="text-xs text-slate-300">
                                {order.createdAt
                                    ? new Date(order.createdAt).toLocaleString("es-ES")
                                    : "En preparación"}
                            </p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                            {order.status || "Pendiente"}
                        </span>
                    </div>
                    {order.items && (
                        <div className="mt-3 space-y-2 text-sm text-slate-200">
                            {order.items.map((item) => (
                                <div
                                    key={`${order.id}-${item.productId}`}
                                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                                >
                                    <span>
                                        {item.productId} x{item.quantity}
                                    </span>
                                    <span>
                                        {(item.unitPrice * item.quantity).toLocaleString("es-ES", {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
